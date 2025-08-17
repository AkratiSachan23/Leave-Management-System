import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import { LeaveRequest, Employee, LeaveBalance } from '../types';
import { leaveService } from '../services/leaveService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { LeaveForm } from './LeaveForm';
import { LeaveApprovalModal } from './LeaveApprovalModal';

interface LeaveManagementProps {
  currentUser: Employee | null;
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({ currentUser }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    setLoading(true);
    
    // Load leave requests based on user role
    const requestsResponse = currentUser.role === 'hr'
      ? leaveService.getAllLeaveRequests()
      : leaveService.getAllLeaveRequests(currentUser.id);

    if (requestsResponse.success) {
      setLeaveRequests(requestsResponse.data!);
    }

    // Load leave balance for employee
    if (currentUser.role === 'employee') {
      const balanceResponse = leaveService.getLeaveBalance(currentUser.id);
      if (balanceResponse.success) {
        setLeaveBalance(balanceResponse.data!);
      }
    }

    setLoading(false);
  };

  const handleApproval = async (requestId: string, approved: boolean, comments?: string) => {
    if (!currentUser) return;

    const response = approved
      ? leaveService.approveLeave(requestId, currentUser.id, comments)
      : leaveService.rejectLeave(requestId, currentUser.id, comments);

    if (response.success) {
      loadData();
      setSelectedRequest(null);
    } else {
      alert(response.error);
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    } as const;
    return variants[status as keyof typeof variants] || 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'approved':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      default:
        return Clock;
    }
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
          <h2 className="text-2xl font-bold text-gray-900">
            {isHR ? 'Leave Requests Management' : 'My Leave Requests'}
          </h2>
          <p className="text-gray-600">
            {isHR ? 'Review and manage employee leave requests' : 'Apply for and track your leave requests'}
          </p>
        </div>
        {!isHR && (
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            Apply for Leave
          </Button>
        )}
      </div>

      {/* Leave Balance Card (Employee Only) */}
      {!isHR && leaveBalance && (
        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{leaveBalance.annual}</p>
              <p className="text-sm text-gray-600">Annual Allocation</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{leaveBalance.remaining}</p>
              <p className="text-sm text-gray-600">Remaining</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{leaveBalance.used}</p>
              <p className="text-sm text-gray-600">Used</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{leaveBalance.sick}</p>
              <p className="text-sm text-gray-600">Sick Leave</p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Filter size={20} className="text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="ml-1">
                    ({leaveRequests.filter(req => req.status === status).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Leave Requests */}
      {filteredRequests.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {statusFilter === 'all' 
                ? (isHR ? 'No leave requests found' : 'You haven\'t applied for any leave yet')
                : `No ${statusFilter} requests found`
              }
            </p>
            {!isHR && statusFilter === 'all' && (
              <Button onClick={() => setShowForm(true)} className="mt-4">
                <Plus size={16} className="mr-2" />
                Apply for Leave
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const StatusIcon = getStatusIcon(request.status);
            return (
              <Card key={request.id}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-start lg:items-center space-x-4">
                    <div className="flex-shrink-0">
                      <StatusIcon 
                        size={24} 
                        className={`${
                          request.status === 'pending' ? 'text-yellow-600' :
                          request.status === 'approved' ? 'text-green-600' :
                          'text-red-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {isHR ? request.employeeName : 'Leave Request'}
                        </h3>
                        <div className="flex space-x-2">
                          <Badge variant={getStatusBadge(request.status)}>
                            {request.status}
                          </Badge>
                          <Badge variant="info" size="sm">
                            {request.leaveType}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Duration:</span> {' '}
                          {new Date(request.startDate).toLocaleDateString()} - {' '}
                          {new Date(request.endDate).toLocaleDateString()} ({request.days} days)
                        </p>
                        <p>
                          <span className="font-medium">Reason:</span> {request.reason}
                        </p>
                        <p>
                          <span className="font-medium">Applied:</span> {' '}
                          {new Date(request.appliedDate).toLocaleDateString()}
                        </p>
                        {request.approvedBy && request.approvedDate && (
                          <p>
                            <span className="font-medium">
                              {request.status === 'approved' ? 'Approved' : 'Rejected'} by:
                            </span> {' '}
                            {request.approvedBy} on {new Date(request.approvedDate).toLocaleDateString()}
                          </p>
                        )}
                        {request.comments && (
                          <p>
                            <span className="font-medium">Comments:</span> {request.comments}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons for HR */}
                  {isHR && request.status === 'pending' && (
                    <div className="flex space-x-2 lg:ml-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        Review
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Leave Form Modal */}
      {showForm && (
        <LeaveForm
          currentUser={currentUser}
          onSuccess={() => {
            setShowForm(false);
            loadData();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Leave Approval Modal */}
      {selectedRequest && (
        <LeaveApprovalModal
          request={selectedRequest}
          onApprove={(comments) => handleApproval(selectedRequest.id, true, comments)}
          onReject={(comments) => handleApproval(selectedRequest.id, false, comments)}
          onCancel={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};