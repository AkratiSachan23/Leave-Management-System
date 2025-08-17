import { Employee, ApiResponse, ValidationError } from '../types';

class EmployeeService {
  private readonly STORAGE_KEY = 'lms_employees';
  private readonly DEFAULT_LEAVE_BALANCE = 25;

  private getEmployees(): Employee[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveEmployees(employees: Employee[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(employees));
  }

  private validateEmployee(employee: Partial<Employee>): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!employee.name?.trim()) {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (employee.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    }

    if (!employee.email?.trim()) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (!employee.department?.trim()) {
      errors.push({ field: 'department', message: 'Department is required' });
    }

    if (!employee.joiningDate) {
      errors.push({ field: 'joiningDate', message: 'Joining date is required' });
    } else {
      const joiningDate = new Date(employee.joiningDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (joiningDate > today) {
        errors.push({ field: 'joiningDate', message: 'Joining date cannot be in the future' });
      }
    }

    return errors;
  }

  getAllEmployees(): ApiResponse<Employee[]> {
    try {
      const employees = this.getEmployees();
      return { success: true, data: employees };
    } catch (error) {
      return { success: false, error: 'Failed to fetch employees' };
    }
  }

  getEmployeeById(id: string): ApiResponse<Employee> {
    try {
      const employees = this.getEmployees();
      const employee = employees.find(emp => emp.id === id);
      
      if (!employee) {
        return { success: false, error: 'Employee not found' };
      }

      return { success: true, data: employee };
    } catch (error) {
      return { success: false, error: 'Failed to fetch employee' };
    }
  }

  createEmployee(employeeData: Omit<Employee, 'id' | 'leaveBalance' | 'status'>): ApiResponse<Employee> {
    try {
      const errors = this.validateEmployee(employeeData);
      if (errors.length > 0) {
        return { success: false, errors };
      }

      const employees = this.getEmployees();
      
      // Check for duplicate email
      const existingEmployee = employees.find(emp => 
        emp.email.toLowerCase() === employeeData.email.toLowerCase()
      );
      if (existingEmployee) {
        return { 
          success: false, 
          errors: [{ field: 'email', message: 'Email already exists' }] 
        };
      }

      const newEmployee: Employee = {
        ...employeeData,
        id: crypto.randomUUID(),
        leaveBalance: this.DEFAULT_LEAVE_BALANCE,
        status: 'active'
      };

      employees.push(newEmployee);
      this.saveEmployees(employees);

      return { success: true, data: newEmployee };
    } catch (error) {
      return { success: false, error: 'Failed to create employee' };
    }
  }

  updateEmployee(id: string, updates: Partial<Employee>): ApiResponse<Employee> {
    try {
      const employees = this.getEmployees();
      const index = employees.findIndex(emp => emp.id === id);
      
      if (index === -1) {
        return { success: false, error: 'Employee not found' };
      }

      const updatedEmployee = { ...employees[index], ...updates };
      const errors = this.validateEmployee(updatedEmployee);
      
      if (errors.length > 0) {
        return { success: false, errors };
      }

      // Check for duplicate email (excluding current employee)
      if (updates.email) {
        const existingEmployee = employees.find(emp => 
          emp.id !== id && emp.email.toLowerCase() === updates.email!.toLowerCase()
        );
        if (existingEmployee) {
          return { 
            success: false, 
            errors: [{ field: 'email', message: 'Email already exists' }] 
          };
        }
      }

      employees[index] = updatedEmployee;
      this.saveEmployees(employees);

      return { success: true, data: updatedEmployee };
    } catch (error) {
      return { success: false, error: 'Failed to update employee' };
    }
  }

  deactivateEmployee(id: string): ApiResponse<Employee> {
    try {
      const employees = this.getEmployees();
      const index = employees.findIndex(emp => emp.id === id);
      
      if (index === -1) {
        return { success: false, error: 'Employee not found' };
      }

      employees[index].status = 'inactive';
      this.saveEmployees(employees);

      return { success: true, data: employees[index] };
    } catch (error) {
      return { success: false, error: 'Failed to deactivate employee' };
    }
  }

  updateLeaveBalance(employeeId: string, newBalance: number): ApiResponse<Employee> {
    try {
      const employees = this.getEmployees();
      const index = employees.findIndex(emp => emp.id === employeeId);
      
      if (index === -1) {
        return { success: false, error: 'Employee not found' };
      }

      if (newBalance < 0) {
        return { success: false, error: 'Leave balance cannot be negative' };
      }

      employees[index].leaveBalance = newBalance;
      this.saveEmployees(employees);

      return { success: true, data: employees[index] };
    } catch (error) {
      return { success: false, error: 'Failed to update leave balance' };
    }
  }
}

export const employeeService = new EmployeeService();