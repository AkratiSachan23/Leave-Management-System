export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  joiningDate: string;
  leaveBalance: number;
  role: 'employee' | 'hr';
  status: 'active' | 'inactive';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  days: number;
  comments?: string;
}

export type LeaveType = 'annual' | 'sick' | 'personal' | 'emergency' | 'maternity' | 'paternity';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveBalance {
  employeeId: string;
  annual: number;
  sick: number;
  personal: number;
  used: number;
  remaining: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

export interface LeaveStats {
  totalEmployees: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalLeavesTaken: number;
  averageLeavePerEmployee: number;
}

export interface DashboardData {
  stats: LeaveStats;
  recentRequests: LeaveRequest[];
  upcomingLeaves: LeaveRequest[];
  lowBalanceEmployees: Employee[];
}