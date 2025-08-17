import React, { useState } from 'react';
import { Calendar, User, Clock, FileText } from 'lucide-react';
import { LeaveRequest } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface LeaveApprovalModalProps {
  request: LeaveRequest;
  onApprove: (comments?: string) => void;
  onReject: (comments?: string) => void;
  onCancel: () => void;
}

export const LeaveApprovalModal: React.FC<LeaveApprovalModalProps> = ({
  request,
  onApprove,
  onReject,
  onCancel
}) => {
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(comments.trim() || undefined);
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await onReject(comments.trim() || undefined);
    setLoading(false);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Review Leave Request"
      size="lg"
    >
      <div className="space-y-6">
        {/* Request Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Request Details</h4>
            <Badge variant="info">{request.leaveType}</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <User size={16} className="text-gray-400" />
              <span className="font-medium">Employee:</span>
              <span>{request.employeeName}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-gray-400" />
              <span className="font-medium">Duration:</span>
              <span>{request.days} working days</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="font-medium">Start Date:</span>
              <span>{new Date(request.startDate).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="font-medium">End Date:</span>
              <span>{new Date(request.endDate).toLocaleDateString()}</span>
            </div>
            
            <div className="md:col-span-2 flex items-start space-x-2">
              <FileText size={16} className="text-gray-400 mt-0.5" />
              <div>
                <span className="font-medium">Reason:</span>
                <p className="text-gray-600 mt-1">{request.reason}</p>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 border-t pt-2">
            Applied on {new Date(request.appliedDate).toLocaleDateString()} at{' '}
            {new Date(request.appliedDate).toLocaleTimeString()}
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments (Optional)
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Add any comments or notes about this request..."
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t">
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
            type="button"
            variant="danger"
            onClick={handleReject}
            loading={loading && loading}
            className="flex-1"
          >
            Reject
          </Button>
          <Button
            type="button"
            onClick={handleApprove}
            loading={loading}
            className="flex-1"
          >
            Approve
          </Button>
        </div>
      </div>
    </Modal>
  );
};