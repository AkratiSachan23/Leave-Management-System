import React, { useState } from 'react';
import { Employee, LeaveType } from '../types';
import { leaveService } from '../services/leaveService';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface LeaveFormProps {
  currentUser: Employee | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const LeaveForm: React.FC<LeaveFormProps> = ({
  currentUser,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: '' as LeaveType | '',
    reason: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const leaveTypeOptions = [
    { value: 'annual', label: 'Annual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'emergency', label: 'Emergency Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateWorkDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  const workDays = calculateWorkDays(formData.startDate, formData.endDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setErrors({ general: 'User not found' });
      return;
    }

    if (!formData.leaveType) {
      setErrors({ leaveType: 'Please select a leave type' });
      return;
    }

    setLoading(true);
    setErrors({});

    const response = leaveService.applyLeave({
      employeeId: currentUser.id,
      startDate: formData.startDate,
      endDate: formData.endDate,
      leaveType: formData.leaveType as LeaveType,
      reason: formData.reason.trim()
    });

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
      title="Apply for Leave"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <Select
          label="Leave Type"
          value={formData.leaveType}
          onChange={(e) => handleInputChange('leaveType', e.target.value)}
          options={leaveTypeOptions}
          error={errors.leaveType}
          required
          placeholder="Select leave type"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            error={errors.startDate}
            required
            min={new Date().toISOString().split('T')[0]}
          />

          <Input
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            error={errors.endDate}
            required
            min={formData.startDate || new Date().toISOString().split('T')[0]}
          />
        </div>

        {workDays > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Duration:</span> {workDays} working day{workDays !== 1 ? 's' : ''}
              {currentUser && workDays > currentUser.leaveBalance && (
                <span className="block text-red-600 mt-1">
                  Warning: This exceeds your available balance of {currentUser.leaveBalance} days
                </span>
              )}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Leave <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.reason ? 'border-red-500' : ''
            }`}
            rows={4}
            placeholder="Please provide a detailed reason for your leave request"
            required
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
          )}
        </div>

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
            disabled={!formData.startDate || !formData.endDate || !formData.leaveType || !formData.reason.trim()}
          >
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};