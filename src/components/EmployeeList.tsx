import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { Employee } from '../types';
import { employeeService } from '../services/employeeService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { EmployeeForm } from './EmployeeForm';

interface EmployeeListProps {
  currentUser: Employee | null;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ currentUser }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [employees, searchTerm]);

  const loadEmployees = () => {
    setLoading(true);
    const response = employeeService.getAllEmployees();
    if (response.success) {
      setEmployees(response.data!);
    }
    setLoading(false);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDeactivateEmployee = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      const response = employeeService.deactivateEmployee(id);
      if (response.success) {
        loadEmployees();
      } else {
        alert(response.error);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEmployee(null);
    loadEmployees();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const isHR = currentUser?.role === 'hr';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
          <p className="text-gray-600">Manage employee information and details</p>
        </div>
        {isHR && (
          <Button onClick={handleAddEmployee}>
            <Plus size={16} className="mr-2" />
            Add Employee
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees by name, email, or department..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Employee Grid */}
      {filteredEmployees.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <UserX size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No employees found matching your search' : 'No employees found'}
            </p>
            {isHR && !searchTerm && (
              <Button onClick={handleAddEmployee} className="mt-4">
                <Plus size={16} className="mr-2" />
                Add First Employee
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.department}</p>
                  </div>
                </div>
                <Badge variant={employee.status === 'active' ? 'success' : 'default'}>
                  {employee.status}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Email:</span>
                  <span className="ml-2 truncate">{employee.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Role:</span>
                  <span className="ml-2 capitalize">{employee.role}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Joined:</span>
                  <span className="ml-2">{new Date(employee.joiningDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Leave Balance:</span>
                  <span className="ml-2">{employee.leaveBalance} days</span>
                </div>
              </div>

              {isHR && (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditEmployee(employee)}
                    className="flex-1"
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  {employee.status === 'active' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeactivateEmployee(employee.id)}
                      className="flex-1"
                    >
                      <UserX size={14} className="mr-1" />
                      Deactivate
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Employee Form Modal */}
      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};