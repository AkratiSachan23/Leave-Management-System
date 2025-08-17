import React, { useState } from 'react';
import { LogIn, User, Building } from 'lucide-react';
import { Employee } from '../types';
import { employeeService } from '../services/employeeService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface LoginProps {
  onLogin: (user: Employee) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoUsers = [
    { email: 'admin@company.com', role: 'HR Manager', name: 'Sarah Johnson' },
    { email: 'john@company.com', role: 'Employee', name: 'John Smith' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate authentication - in real app, this would validate credentials
    const employeesResponse = employeeService.getAllEmployees();
    if (employeesResponse.success) {
      const employee = employeesResponse.data!.find(emp => 
        emp.email.toLowerCase() === email.toLowerCase() && emp.status === 'active'
      );

      if (employee) {
        onLogin(employee);
      } else {
        setError('Employee not found or inactive. Please contact HR.');
      }
    } else {
      setError('Failed to authenticate. Please try again.');
    }

    setLoading(false);
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
  };

  // Initialize demo data if empty
  React.useEffect(() => {
    const response = employeeService.getAllEmployees();
    if (response.success && response.data!.length === 0) {
      // Create demo employees
      employeeService.createEmployee({
        name: 'Sarah Johnson',
        email: 'admin@company.com',
        department: 'HR',
        joiningDate: '2023-01-15',
        role: 'hr'
      });

      employeeService.createEmployee({
        name: 'John Smith',
        email: 'john@company.com',
        department: 'Engineering',
        joiningDate: '2023-03-01',
        role: 'employee'
      });

      employeeService.createEmployee({
        name: 'Emily Davis',
        email: 'emily@company.com',
        department: 'Marketing',
        joiningDate: '2023-02-10',
        role: 'employee'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
            <Building size={32} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Leave Management System</h1>
          <p className="text-blue-100">Sign in to manage your leave requests</p>
        </div>

        {/* Login Form */}
        <Card className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              error={error}
              required
              autoComplete="email"
            />

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={!email.trim()}
            >
              <LogIn size={16} className="mr-2" />
              Sign In
            </Button>
          </form>

          {/* Demo Users */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">Quick Demo Access:</p>
            <div className="space-y-2">
              {demoUsers.map((user) => (
                <button
                  key={user.email}
                  onClick={() => handleDemoLogin(user.email)}
                  className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role} • {user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Features */}
        <div className="text-center text-blue-100 text-sm">
          <p className="mb-2">✨ Features included:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>• Employee Management</div>
            <div>• Leave Applications</div>
            <div>• HR Approvals</div>
            <div>• Balance Tracking</div>
          </div>
        </div>
      </div>
    </div>
  );
};