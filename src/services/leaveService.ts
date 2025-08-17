import { LeaveRequest, Employee, ApiResponse, ValidationError, LeaveBalance, LeaveStats, DashboardData } from '../types';
import { employeeService } from './employeeService';

class LeaveService {
  private readonly STORAGE_KEY = 'lms_leave_requests';

  private getLeaveRequests(): LeaveRequest[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveLeaveRequests(requests: LeaveRequest[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(requests));
  }

  private calculateWorkDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  private validateLeaveRequest(request: Partial<LeaveRequest>): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!request.employeeId) {
      errors.push({ field: 'employeeId', message: 'Employee is required' });
      return errors;
    }

    // Check if employee exists and is active
    const employeeResponse = employeeService.getEmployeeById(request.employeeId);
    if (!employeeResponse.success || !employeeResponse.data) {
      errors.push({ field: 'employeeId', message: 'Employee not found' });
      return errors;
    }

    const employee = employeeResponse.data;
    if (employee.status !== 'active') {
      errors.push({ field: 'employeeId', message: 'Cannot apply leave for inactive employee' });
    }

    if (!request.startDate) {
      errors.push({ field: 'startDate', message: 'Start date is required' });
    }

    if (!request.endDate) {
      errors.push({ field: 'endDate', message: 'End date is required' });
    }

    if (!request.leaveType) {
      errors.push({ field: 'leaveType', message: 'Leave type is required' });
    }

    if (!request.reason?.trim()) {
      errors.push({ field: 'reason', message: 'Reason is required' });
    }

    if (request.startDate && request.endDate) {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);


      // Check if end date is before start date
      if (endDate < startDate) {
        errors.push({ field: 'endDate', message: 'End date cannot be before start date' });
      }

      // Check if leave duration is reasonable (max 365 days)
      const duration = this.calculateWorkDays(request.startDate, request.endDate);
      if (duration > 365) {
        errors.push({ field: 'endDate', message: 'Leave duration cannot exceed 365 days' });
      }

    }

    return errors;
  }

  applyLeave(requestData: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status' | 'days' | 'employeeName'>): ApiResponse<LeaveRequest> {
    try {
      // Get employee name
      const employeeResponse = employeeService.getEmployeeById(requestData.employeeId);
      if (!employeeResponse.success || !employeeResponse.data) {
        return { success: false, error: 'Employee not found' };
      }

      const employee = employeeResponse.data;
      const requestWithName = { ...requestData, employeeName: employee.name };

      const errors = this.validateLeaveRequest(requestWithName);
      if (errors.length > 0) {
        return { success: false, errors };
      }

      const days = this.calculateWorkDays(requestData.startDate, requestData.endDate);

      const newRequest: LeaveRequest = {
        ...requestWithName,
        id: crypto.randomUUID(),
        appliedDate: new Date().toISOString(),
        status: 'pending',
        days
      };

      const requests = this.getLeaveRequests();
      requests.push(newRequest);
      this.saveLeaveRequests(requests);

      return { success: true, data: newRequest };
    } catch (error) {
      return { success: false, error: 'Failed to apply for leave' };
    }
  }

  approveLeave(requestId: string, approvedBy: string, comments?: string): ApiResponse<LeaveRequest> {
    try {
      const requests = this.getLeaveRequests();
      const index = requests.findIndex(req => req.id === requestId);

      if (index === -1) {
        return { success: false, error: 'Leave request not found' };
      }

      const request = requests[index];

      if (request.status !== 'pending') {
        return { success: false, error: 'Only pending requests can be approved' };
      }

      // Deduct leave balance
      const balanceResponse = this.getLeaveBalance(request.employeeId);
      if (!balanceResponse.success || !balanceResponse.data) {
        return { success: false, error: 'Failed to get leave balance' };
      }

      const updateBalanceResponse = employeeService.updateLeaveBalance(
        request.employeeId, 
        balanceResponse.data.remaining - request.days
      );

      if (!updateBalanceResponse.success) {
        return { success: false, error: 'Failed to update leave balance' };
      }

      requests[index] = {
        ...request,
        status: 'approved',
        approvedBy,
        approvedDate: new Date().toISOString(),
        comments
      };

      this.saveLeaveRequests(requests);
      return { success: true, data: requests[index] };
    } catch (error) {
      return { success: false, error: 'Failed to approve leave' };
    }
  }

  rejectLeave(requestId: string, approvedBy: string, comments?: string): ApiResponse<LeaveRequest> {
    try {
      const requests = this.getLeaveRequests();
      const index = requests.findIndex(req => req.id === requestId);

      if (index === -1) {
        return { success: false, error: 'Leave request not found' };
      }

      const request = requests[index];

      if (request.status !== 'pending') {
        return { success: false, error: 'Only pending requests can be rejected' };
      }

      requests[index] = {
        ...request,
        status: 'rejected',
        approvedBy,
        approvedDate: new Date().toISOString(),
        comments
      };

      this.saveLeaveRequests(requests);
      return { success: true, data: requests[index] };
    } catch (error) {
      return { success: false, error: 'Failed to reject leave' };
    }
  }

  getLeaveRequestsForEmployee(employeeId?: string): LeaveRequest[] {
    let requests = this.getLeaveRequests();
    
    if (employeeId) {
      requests = requests.filter(req => req.employeeId === employeeId);
    }

    // Sort by applied date (newest first)
    requests.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

    return requests;
  }

  getAllLeaveRequests(employeeId?: string): ApiResponse<LeaveRequest[]> {
    try {
      let requests = this.getLeaveRequestsForEmployee(employeeId);
      
      return { success: true, data: requests };
    } catch (error) {
      return { success: false, error: 'Failed to fetch leave requests' };
    }
  }

  getLeaveBalance(employeeId: string): ApiResponse<LeaveBalance> {
    try {
      const employeeResponse = employeeService.getEmployeeById(employeeId);
      if (!employeeResponse.success || !employeeResponse.data) {
        return { success: false, error: 'Employee not found' };
      }

      const employee = employeeResponse.data;
      const requests = this.getLeaveRequests().filter(req => 
        req.employeeId === employeeId && req.status === 'approved'
      );

      const used = requests.reduce((total, req) => total + req.days, 0);
      const remaining = employee.leaveBalance - used;

      const balance: LeaveBalance = {
        employeeId,
        annual: employee.leaveBalance,
        sick: 10, // Default sick leave allocation
        personal: 5, // Default personal leave allocation
        used,
        remaining: Math.max(0, remaining)
      };

      return { success: true, data: balance };
    } catch (error) {
      return { success: false, error: 'Failed to calculate leave balance' };
    }
  }

  getDashboardData(): ApiResponse<DashboardData> {
    try {
      const employeesResponse = employeeService.getAllEmployees();
      const requests = this.getLeaveRequestsForEmployee();

      if (!employeesResponse.success) {
        return { success: false, error: 'Failed to fetch dashboard data' };
      }

      const employees = employeesResponse.data!;

      const stats: LeaveStats = {
        totalEmployees: employees.filter(emp => emp.status === 'active').length,
        pendingRequests: requests.filter(req => req.status === 'pending').length,
        approvedRequests: requests.filter(req => req.status === 'approved').length,
        rejectedRequests: requests.filter(req => req.status === 'rejected').length,
        totalLeavesTaken: requests.filter(req => req.status === 'approved').reduce((total, req) => total + req.days, 0),
        averageLeavePerEmployee: 0
      };

      stats.averageLeavePerEmployee = stats.totalEmployees > 0 ? 
        Math.round((stats.totalLeavesTaken / stats.totalEmployees) * 10) / 10 : 0;

      const recentRequests = requests.slice(0, 5);

      const upcomingLeaves = requests
        .filter(req => req.status === 'approved' && new Date(req.startDate) > new Date())
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 5);

      const lowBalanceEmployees = employees
        .filter(emp => emp.status === 'active' && emp.leaveBalance < 5)
        .slice(0, 5);

      const dashboardData: DashboardData = {
        stats,
        recentRequests,
        upcomingLeaves,
        lowBalanceEmployees
      };

      return { success: true, data: dashboardData };
    } catch (error) {
      return { success: false, error: 'Failed to fetch dashboard data' };
    }
  }
}

export const leaveService = new LeaveService();