# Mini Leave Management System

A modern, responsive web application for managing employee leave requests built with React, TypeScript, and Tailwind CSS.

## 🚀 Live Demo

**Deployed Application:** [https://mini-leave-managemen-55r9.bolt.host](https://mini-leave-managemen-55r9.bolt.host)

## 📋 Table of Contents

- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [System Architecture](#system-architecture)
- [API Documentation](#api-documentation)
- [Assumptions](#assumptions)
- [Edge Cases Handled](#edge-cases-handled)
- [Potential Improvements](#potential-improvements)
- [Screenshots](#screenshots)

## ✨ Features

### Employee Features
- **Authentication**: Simple email-based login system
- **Leave Application**: Apply for different types of leave (Annual, Sick, Personal, Emergency, Maternity, Paternity)
- **Leave Balance Tracking**: View remaining leave balance and usage
- **Request History**: Track all leave requests and their status
- **Dashboard**: Overview of personal leave statistics

### HR Features
- **Employee Management**: Add, edit, and deactivate employees
- **Leave Approval**: Review and approve/reject leave requests
- **HR Dashboard**: Comprehensive overview of all leave activities
- **Bulk Operations**: Quick approve/reject functionality
- **Analytics**: Leave statistics and trends

### System Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Instant updates when actions are performed
- **Data Persistence**: Local storage for demo purposes
- **Role-based Access**: Different interfaces for employees and HR
- **Validation**: Comprehensive form validation and error handling

## 🛠 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd leave-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Demo Accounts

The system comes with pre-configured demo accounts:

**HR Manager:**
- Email: `admin@company.com`
- Name: Sarah Johnson
- Role: HR Manager

**Employee:**
- Email: `john@company.com`
- Name: John Smith
- Role: Employee

**Additional Employee:**
- Email: `emily@company.com`
- Name: Emily Davis
- Role: Employee

### Build for Production

```bash
npm run build
npm run preview
```

## 🏗 System Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Login    │  Dashboard  │  Employee   │  Leave    │   HR    │
│Component  │ Component   │ Management  │Management │Dashboard│
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                           │
├─────────────────────────────────────────────────────────────┤
│           EmployeeService     │      LeaveService           │
│                               │                             │
│  • Employee CRUD              │  • Leave Application        │
│  • Authentication             │  • Approval/Rejection       │
│  • Leave Balance Management   │  • Dashboard Analytics      │
│  • Validation                 │  • Balance Calculation      │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│                   LocalStorage                              │
│                                                             │
│  • lms_employees              │  • lms_leave_requests       │
│  • lms_current_user           │                             │
└─────────────────────────────────────────────────────────────┘
```

### Class Diagram

```typescript
// Core Entities
interface Employee {
  id: string
  name: string
  email: string
  department: string
  joiningDate: string
  leaveBalance: number
  role: 'employee' | 'hr'
  status: 'active' | 'inactive'
}

interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  startDate: string
  endDate: string
  leaveType: LeaveType
  reason: string
  status: LeaveStatus
  appliedDate: string
  approvedBy?: string
  approvedDate?: string
  days: number
  comments?: string
}

// Service Classes
class EmployeeService {
  +getAllEmployees(): ApiResponse<Employee[]>
  +getEmployeeById(id: string): ApiResponse<Employee>
  +createEmployee(data: EmployeeData): ApiResponse<Employee>
  +updateEmployee(id: string, updates: Partial<Employee>): ApiResponse<Employee>
  +deactivateEmployee(id: string): ApiResponse<Employee>
  +updateLeaveBalance(employeeId: string, balance: number): ApiResponse<Employee>
  -validateEmployee(employee: Partial<Employee>): ValidationError[]
}

class LeaveService {
  +applyLeave(requestData: LeaveRequestData): ApiResponse<LeaveRequest>
  +approveLeave(requestId: string, approvedBy: string, comments?: string): ApiResponse<LeaveRequest>
  +rejectLeave(requestId: string, approvedBy: string, comments?: string): ApiResponse<LeaveRequest>
  +getAllLeaveRequests(employeeId?: string): ApiResponse<LeaveRequest[]>
  +getLeaveBalance(employeeId: string): ApiResponse<LeaveBalance>
  +getDashboardData(): ApiResponse<DashboardData>
  -calculateWorkDays(startDate: string, endDate: string): number
  -validateLeaveRequest(request: Partial<LeaveRequest>): ValidationError[]
}
```

## 📡 API Documentation

### Employee Service APIs

#### 1. Get All Employees
```typescript
// Method
employeeService.getAllEmployees()

// Response
{
  success: true,
  data: [
    {
      id: "uuid-1",
      name: "John Smith",
      email: "john@company.com",
      department: "Engineering",
      joiningDate: "2023-03-01",
      leaveBalance: 25,
      role: "employee",
      status: "active"
    }
  ]
}
```

#### 2. Create Employee
```typescript
// Input
{
  name: "Jane Doe",
  email: "jane@company.com",
  department: "Marketing",
  joiningDate: "2024-01-15",
  role: "employee"
}

// Response
{
  success: true,
  data: {
    id: "uuid-2",
    name: "Jane Doe",
    email: "jane@company.com",
    department: "Marketing",
    joiningDate: "2024-01-15",
    leaveBalance: 25,
    role: "employee",
    status: "active"
  }
}
```

### Leave Service APIs

#### 1. Apply for Leave
```typescript
// Input
{
  employeeId: "uuid-1",
  startDate: "2024-02-15",
  endDate: "2024-02-17",
  leaveType: "annual",
  reason: "Family vacation"
}

// Response
{
  success: true,
  data: {
    id: "leave-uuid-1",
    employeeId: "uuid-1",
    employeeName: "John Smith",
    startDate: "2024-02-15",
    endDate: "2024-02-17",
    leaveType: "annual",
    reason: "Family vacation",
    status: "pending",
    appliedDate: "2024-01-20T10:30:00.000Z",
    days: 3
  }
}
```

#### 2. Approve Leave
```typescript
// Input
leaveService.approveLeave("leave-uuid-1", "hr-uuid-1", "Approved for vacation")

// Response
{
  success: true,
  data: {
    id: "leave-uuid-1",
    employeeId: "uuid-1",
    employeeName: "John Smith",
    startDate: "2024-02-15",
    endDate: "2024-02-17",
    leaveType: "annual",
    reason: "Family vacation",
    status: "approved",
    appliedDate: "2024-01-20T10:30:00.000Z",
    approvedBy: "hr-uuid-1",
    approvedDate: "2024-01-21T09:15:00.000Z",
    days: 3,
    comments: "Approved for vacation"
  }
}
```

#### 3. Get Dashboard Data
```typescript
// Response
{
  success: true,
  data: {
    stats: {
      totalEmployees: 15,
      pendingRequests: 3,
      approvedRequests: 12,
      rejectedRequests: 1,
      totalLeavesTaken: 45,
      averageLeavePerEmployee: 3.0
    },
    recentRequests: [...],
    upcomingLeaves: [...],
    lowBalanceEmployees: [...]
  }
}
```

## 🔍 Assumptions

### Technical Assumptions
1. **Browser Support**: Modern browsers with ES6+ support
2. **Storage**: LocalStorage is available and persistent
3. **Network**: Application runs in online environment (no offline support)
4. **Screen Sizes**: Responsive design for 320px to 1920px+ widths

### Business Assumptions
1. **Work Week**: Monday to Friday (weekends excluded from leave calculations)
2. **Leave Types**: Fixed set of leave types (Annual, Sick, Personal, Emergency, Maternity, Paternity)
3. **Leave Balance**: Annual allocation of 25 days per employee
4. **Approval Process**: Single-level approval (HR only)
5. **Authentication**: Simple email-based authentication (no password required for demo)

### Data Assumptions
1. **Employee Uniqueness**: Email addresses are unique identifiers
2. **Leave Duration**: Maximum 365 days per request
3. **Date Format**: ISO date strings for consistency
4. **Currency/Locale**: English locale with standard date formats

## 🛡 Edge Cases Handled

### Input Validation
- **Empty/Invalid Emails**: Validates email format and uniqueness
- **Date Validation**: Prevents past dates, invalid date ranges
- **Leave Duration**: Validates reasonable leave durations (1-365 days)
- **Required Fields**: All mandatory fields validated before submission

### Business Logic
- **Weekend Exclusion**: Only working days counted in leave calculations
- **Duplicate Requests**: Prevents overlapping leave requests
- **Inactive Employees**: Cannot apply for leave or be assigned requests
- **Insufficient Balance**: Warns when leave exceeds available balance
- **Status Transitions**: Only pending requests can be approved/rejected

### UI/UX Edge Cases
- **Empty States**: Proper messaging when no data is available
- **Loading States**: Loading indicators during async operations
- **Error Handling**: User-friendly error messages
- **Mobile Responsiveness**: Proper layout on all screen sizes
- **Long Text**: Text truncation and proper wrapping

### Data Integrity
- **Concurrent Updates**: Handles multiple users updating same data
- **Storage Limits**: Graceful handling of localStorage limits
- **Data Corruption**: Validation and fallback for corrupted data
- **Missing References**: Handles deleted employees with existing requests

## 🚀 Potential Improvements

### Short-term Improvements
1. **Enhanced Authentication**
   - Password-based authentication
   - Session management
   - Password reset functionality

2. **Advanced Filtering**
   - Date range filters
   - Department-wise filtering
   - Multi-status selection

3. **Notifications**
   - Email notifications for approvals
   - In-app notification system
   - Reminder notifications

### Medium-term Improvements
1. **Backend Integration**
   - REST API integration
   - Database persistence
   - Real-time updates with WebSockets

2. **Advanced Features**
   - Leave calendar view
   - Bulk operations for HR
   - Leave policy configuration
   - Reporting and analytics

3. **User Experience**
   - Dark mode support
   - Keyboard shortcuts
   - Advanced search functionality
   - Export functionality (PDF, Excel)

### Long-term Improvements
1. **Enterprise Features**
   - Multi-tenant support
   - Advanced role management
   - Integration with HR systems
   - Audit trails and compliance

2. **Mobile Application**
   - Native mobile apps
   - Push notifications
   - Offline support

3. **AI/ML Features**
   - Predictive analytics
   - Automated leave recommendations
   - Pattern recognition for leave abuse

4. **Advanced Workflows**
   - Multi-level approval chains
   - Conditional approvals
   - Integration with calendar systems
   - Time tracking integration

## 📱 Screenshots

### Login Screen
- Clean, professional login interface
- Demo account quick access
- Responsive design for all devices

### Employee Dashboard
- Personal leave balance overview
- Recent requests status
- Upcoming approved leaves
- Quick apply for leave button

### HR Dashboard
- Comprehensive leave statistics
- Pending requests requiring attention
- Team leave overview
- Quick approval actions

### Leave Management
- Filterable leave request list
- Detailed request information
- Status-based color coding
- Mobile-optimized layout

### Employee Management (HR)
- Employee grid with search
- Add/edit employee functionality
- Department and role management
- Leave balance tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**