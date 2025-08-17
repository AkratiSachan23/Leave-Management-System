import React, { useState } from 'react';
import { Employee } from '../types';
import { employeeService } from '../services/employeeService';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface EmployeeFormProps {
  employee?: Employee | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    department: employee?.department || '',
    joiningDate: employee?.joiningDate || '',
    role: employee?.role || 'employee' as 'employee' | 'hr',
    leaveBalance: employee?.leaveBalance || 25
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const departmentOptions = [
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'HR', label: 'Human Resources' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Operations', label: 'Operations' }
  ];

  const roleOptions = [
    { value: 'employee', label: 'Employee' },
    { value: 'hr', label: 'HR Manager' }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const response = employee
      ? employeeService.updateEmployee(employee.id, formData)
      : employeeService.createEmployee(formData);

    if (response.success) {
      onSuccess();
    } else {
      if (response.errors) {
        const errorMap: Record<string, string> = {};
        response.errors.forEach(error => {
          errorMap[error.field] = error.message;
        });
        setErrors(errorMap);
      } else if (response.error) {
        setErrors({ general: response.error });
      }
    }

    setLoading(false);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={employee ? 'Edit Employee' : 'Add New Employee'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name}
          required
          placeholder="Enter employee's full name"
        />

        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          required
          placeholder="Enter employee's email"
        />

        <Select
          label="Department"
          value={formData.department}
          onChange={(e) => handleInputChange('department', e.target.value)}
          options={departmentOptions}
          error={errors.department}
          required
          placeholder="Select department"
        />

        <Input
          label="Joining Date"
          type="date"
          value={formData.joiningDate}
          onChange={(e) => handleInputChange('joiningDate', e.target.value)}
          error={errors.joiningDate}
          required
          max={new Date().toISOString().split('T')[0]}
        />

        <Select
          label="Role"
          value={formData.role}
          onChange={(e) => handleInputChange('role', e.target.value)}
          options={roleOptions}
          error={errors.role}
          required
        />

        <Input
          label="Annual Leave Balance (Days)"
          type="number"
          value={formData.leaveBalance}
          onChange={(e) => handleInputChange('leaveBalance', parseInt(e.target.value))}
          error={errors.leaveBalance}
          required
          min={0}
          max={365}
          helperText="Annual leave allowance for this employee"
        />

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            {employee ? 'Update Employee' : 'Add Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};