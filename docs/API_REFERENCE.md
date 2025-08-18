# API Reference Documentation

## Overview

This document provides detailed information about all service methods available in the Mini Leave Management System.

## Employee Service API

### Base Class: `EmployeeService`

Location: `src/services/employeeService.ts`

#### Methods

### `getAllEmployees()`

Retrieves all employees from the system.

**Signature:**
```typescript
getAllEmployees(): ApiResponse<Employee[]>
```

**Parameters:** None

**Returns:**
```typescript
{
  success: boolean;
  data?: Employee[];
  error?: string;
}
```

**Example Usage:**
```typescript
const response = employeeService.getAllEmployees();
if (response.success) {
  console.log('Employees:', response.data);
} else {
  console.error('Error:', response.error);
}
```

**Sample Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "emp-001",
      "name": "John Smith",
      "email": "john@company.com",
      "department": "Engineering",
      "joiningDate": "2023-03-01",
      "leaveBalance": 22,
      "role": "employee",
      "status": "active"
    }
  ]
}
```

---

### `getEmployeeById(id)`

Retrieves a specific employee by their ID.

**Signature:**
```typescript
getEmployeeById(id: string): ApiResponse<Employee>
```

**Parameters:**
- `id` (string): The unique identifier of the employee

**Returns:**
```typescript
{
  success: boolean;
  data?: Employee;
  error?: string;
}
```

**Example Usage:**
```typescript
const response = employeeService.getEmployeeById('emp-001');
if (response.success) {
  console.log('Employee:', response.data);
}
```

**Error Cases:**
- Employee not found: `{ success: false, error: "Employee not found" }`

---

### `createEmployee(employeeData)`

Creates a new employee in the system.

**Signature:**
```typescript
createEmployee(employeeData: Omit<Employee, 'id' | 'leaveBalance' | 'status'>): ApiResponse<Employee>
```

**Parameters:**
```typescript
{
  name: string;
  email: string;
  department: string;
  joiningDate: string; // ISO date string
  role: 'employee' | 'hr';
}
```

**Returns:**
```typescript
{
  success: boolean;
  data?: Employee;
  error?: string;
  errors?: ValidationError[];
}
```

**Example Usage:**
```typescript
const newEmployee = {
  name: "Jane Doe",
  email: "jane@company.com",
  department: "Marketing",
  joiningDate: "2024-01-15",
  role: "employee"
};

const response = employeeService.createEmployee(newEmployee);
```

**Validation Rules:**
- Name: Required, minimum 2 characters
- Email: Required, valid email format, unique
- Department: Required
- Joining Date: Required, cannot be in the future
- Role: Must be 'employee' or 'hr'

**Sample Validation Error:**
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

---

### `updateEmployee(id, updates)`

Updates an existing employee's information.

**Signature:**
```typescript
updateEmployee(id: string, updates: Partial<Employee>): ApiResponse<Employee>
```

**Parameters:**
- `id` (string): Employee ID to update
- `updates` (Partial<Employee>): Fields to update

**Example Usage:**
```typescript
const updates = {
  department: "Senior Engineering",
  leaveBalance: 30
};

const response = employeeService.updateEmployee('emp-001', updates);
```

---

### `deactivateEmployee(id)`

Deactivates an employee (sets status to 'inactive').

**Signature:**
```typescript
deactivateEmployee(id: string): ApiResponse<Employee>
```

**Parameters:**
- `id` (string): Employee ID to deactivate

**Example Usage:**
```typescript
const response = employeeService.deactivateEmployee('emp-001');
```

---

### `updateLeaveBalance(employeeId, newBalance)`

Updates an employee's leave balance.

**Signature:**
```typescript
updateLeaveBalance(employeeId: string, newBalance: number): ApiResponse<Employee>
```

**Parameters:**
- `employeeId` (string): Employee ID
- `newBalance` (number): New leave balance (must be >= 0)

**Example Usage:**
```typescript
const response = employeeService.updateLeaveBalance('emp-001', 20);
```

---

## Leave Service API

### Base Class: `LeaveService`

Location: `src/services/leaveService.ts`

#### Methods

### `applyLeave(requestData)`

Submits a new leave request.

**Signature:**
```typescript
applyLeave(requestData: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status' | 'days' | 'employeeName'>): ApiResponse<LeaveRequest>
```

**Parameters:**
```typescript
{
  employeeId: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  leaveType: LeaveType;
  reason: string;
}
```

**Leave Types:**
- `'annual'` - Annual Leave
- `'sick'` - Sick Leave
- `'personal'` - Personal Leave
- `'emergency'` - Emergency Leave
- `'maternity'` - Maternity Leave
- `'paternity'` - Paternity Leave

**Example Usage:**
```typescript
const leaveRequest = {
  employeeId: 'emp-001',
  startDate: '2024-03-15',
  endDate: '2024-03-17',
  leaveType: 'annual',
  reason: 'Family vacation'
};

const response = leaveService.applyLeave(leaveRequest);
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "id": "leave-001",
    "employeeId": "emp-001",
    "employeeName": "John Smith",
    "startDate": "2024-03-15",
    "endDate": "2024-03-17",
    "leaveType": "annual",
    "reason": "Family vacation",
    "status": "pending",
    "appliedDate": "2024-02-20T10:30:00.000Z",
    "days": 3
  }
}
```

**Validation Rules:**
- Employee must exist and be active
- Start date cannot be in the past
- End date must be after start date
- Maximum duration: 365 days
- Reason is required

---

### `approveLeave(requestId, approvedBy, comments?)`

Approves a pending leave request.

**Signature:**
```typescript
approveLeave(requestId: string, approvedBy: string, comments?: string): ApiResponse<LeaveRequest>
```

**Parameters:**
- `requestId` (string): Leave request ID
- `approvedBy` (string): ID of the approving user
- `comments` (string, optional): Approval comments

**Example Usage:**
```typescript
const response = leaveService.approveLeave(
  'leave-001', 
  'hr-001', 
  'Approved for vacation'
);
```

**Business Logic:**
- Only pending requests can be approved
- Employee's leave balance is automatically deducted
- Approval date is set to current timestamp

---

### `rejectLeave(requestId, approvedBy, comments?)`

Rejects a pending leave request.

**Signature:**
```typescript
rejectLeave(requestId: string, approvedBy: string, comments?: string): ApiResponse<LeaveRequest>
```

**Parameters:**
- `requestId` (string): Leave request ID
- `approvedBy` (string): ID of the rejecting user
- `comments` (string, optional): Rejection reason

**Example Usage:**
```typescript
const response = leaveService.rejectLeave(
  'leave-001', 
  'hr-001', 
  'Insufficient notice period'
);
```

---

### `getAllLeaveRequests(employeeId?)`

Retrieves leave requests, optionally filtered by employee.

**Signature:**
```typescript
getAllLeaveRequests(employeeId?: string): ApiResponse<LeaveRequest[]>
```

**Parameters:**
- `employeeId` (string, optional): Filter by specific employee

**Example Usage:**
```typescript
// Get all requests
const allRequests = leaveService.getAllLeaveRequests();

// Get requests for specific employee
const employeeRequests = leaveService.getAllLeaveRequests('emp-001');
```

**Response Sorting:**
Requests are sorted by applied date (newest first).

---

### `getLeaveBalance(employeeId)`

Calculates and returns an employee's leave balance.

**Signature:**
```typescript
getLeaveBalance(employeeId: string): ApiResponse<LeaveBalance>
```

**Parameters:**
- `employeeId` (string): Employee ID

**Returns:**
```typescript
{
  success: boolean;
  data?: {
    employeeId: string;
    annual: number;      // Total annual allocation
    sick: number;        // Sick leave allocation
    personal: number;    // Personal leave allocation
    used: number;        // Total days used
    remaining: number;   // Remaining balance
  };
  error?: string;
}
```

**Example Usage:**
```typescript
const response = leaveService.getLeaveBalance('emp-001');
if (response.success) {
  console.log(`Remaining balance: ${response.data.remaining} days`);
}
```

---

### `getDashboardData()`

Retrieves comprehensive dashboard statistics.

**Signature:**
```typescript
getDashboardData(): ApiResponse<DashboardData>
```

**Parameters:** None

**Returns:**
```typescript
{
  success: boolean;
  data?: {
    stats: {
      totalEmployees: number;
      pendingRequests: number;
      approvedRequests: number;
      rejectedRequests: number;
      totalLeavesTaken: number;
      averageLeavePerEmployee: number;
    };
    recentRequests: LeaveRequest[];      // Last 5 requests
    upcomingLeaves: LeaveRequest[];      // Next 5 approved leaves
    lowBalanceEmployees: Employee[];     // Employees with < 5 days
  };
  error?: string;
}
```

**Example Usage:**
```typescript
const response = leaveService.getDashboardData();
if (response.success) {
  const { stats, recentRequests, upcomingLeaves } = response.data;
  console.log(`Pending requests: ${stats.pendingRequests}`);
}
```

---

## Utility Methods

### `calculateWorkDays(startDate, endDate)`

Calculates working days between two dates (excludes weekends).

**Signature:**
```typescript
private calculateWorkDays(startDate: string, endDate: string): number
```

**Logic:**
- Excludes Saturdays (day 6) and Sundays (day 0)
- Includes both start and end dates
- Returns 0 for invalid date ranges

---

## Error Handling

### Standard Error Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;           // General error message
  errors?: ValidationError[]; // Field-specific errors
}

interface ValidationError {
  field: string;    // Field name that failed validation
  message: string;  // Human-readable error message
}
```

### Common Error Scenarios

1. **Not Found Errors**
   ```json
   {
     "success": false,
     "error": "Employee not found"
   }
   ```

2. **Validation Errors**
   ```json
   {
     "success": false,
     "errors": [
       {
         "field": "email",
         "message": "Invalid email format"
       },
       {
         "field": "startDate",
         "message": "Start date is required"
       }
     ]
   }
   ```

3. **Business Logic Errors**
   ```json
   {
     "success": false,
     "error": "Only pending requests can be approved"
   }
   ```

---

## Data Persistence

### Storage Keys

- `lms_employees`: Employee data array
- `lms_leave_requests`: Leave request data array
- `lms_current_user`: Current authenticated user

### Data Format

All data is stored as JSON strings in localStorage with automatic serialization/deserialization.

### Storage Limitations

- Browser localStorage typically limited to 5-10MB
- Data persists until manually cleared or browser data is reset
- No automatic backup or recovery mechanisms

---

## Performance Considerations

### Optimization Strategies

1. **Efficient Filtering**: Use array methods efficiently
2. **Minimal Data Transfer**: Only return necessary fields
3. **Caching**: Results cached in component state
4. **Lazy Loading**: Load data only when needed

### Scalability Notes

Current implementation is suitable for:
- Up to 1000 employees
- Up to 10,000 leave requests
- Single-user concurrent access

For larger scale, consider:
- Backend API integration
- Database persistence
- Pagination for large datasets
- Real-time synchronization