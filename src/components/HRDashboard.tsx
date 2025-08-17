import React, { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { LeaveRequest, Employee, DashboardData } from '../types';
import { leaveService } from '../services/leaveService';
import { employeeService } from '../services/employeeService';
import { LeaveApprovalModal } from './LeaveApprovalModal';

interface HRDashboardProps {
  currentUser: Employee | null;
}

export const HRDashboard: React.FC<HRDashboardProps> = ({ currentUser }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    const dashboardResponse = leaveService.getDashboardData();
    if (dashboardResponse.success) {
      setDashboardData(dashboardResponse.data!);
    }

    const requestsResponse = leaveService.getAllLeaveRequests();
    if (requestsResponse.success) {
      const pending = requestsResponse.data!.filter(req => req.status === 'pending');
      setPendingRequests(pending);
    }

    setLoading(false);
  };

  const handleApproval = async (requestId: string, approved: boolean, comments?: string) => {
    if (!currentUser) return;

    const response = approved
      ? leaveService.approveLeave(requestId, currentUser.id, comments)
      : leaveService.rejectLeave(requestId, currentUser.id, comments);

    if (response.success) {
      loadDashboardData();
      setSelectedRequest(null);
    } else {
      alert(response.error);
    }
  };

  const quickApprove = async (requestId: string) => {
    if (!currentUser) return;
    handleApproval(requestId, true);
  };

  const quickReject = async (requestId: string) => {
    if (!currentUser) return;
    
    const comments = prompt('Please provide a reason for rejection:');
    if (comments !== null) {
      handleApproval(requestId, false, comments);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load HR dashboard data</p>
      </div>
    );
  }

  const { stats } = dashboardData;

  const statCards = [
    {
      title: 'Pending Approvals',
      value: stats.pendingRequests,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      urgent: stats.pendingRequests > 5
    },
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Approved This Month',
      value: stats.approvedRequests,
      icon: CheckCircle2,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Days Taken',
      value: stats.totalLeavesTaken,
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-2">HR Dashboard</h1>
        <p className="text-emerald-100">
          Manage leave requests and monitor team availability
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={stat.urgent ? 'ring-2 ring-yellow-400' : ''}>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10 relative`}>
                  <Icon size={24} className={stat.textColor} />
                  {stat.urgent && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                  )}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pending Requests Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Pending Leave Requests</h3>
          <div className="flex items-center space-x-2">
            <FileText size={20} className="text-gray-400" />
            <Badge variant="warning">{pendingRequests.length} Pending</Badge>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
            <p className="text-gray-500">All caught up! No pending requests.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{request.employeeName}</h4>
                      <div className="flex space-x-2">
                        <Badge variant="info" size="sm">{request.leaveType}</Badge>
                        <Badge variant="warning" size="sm">{request.days} days</Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Dates:</span> {' '}
                        {new Date(request.startDate).toLocaleDateString()} - {' '}
                        {new Date(request.endDate).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                      <p>
                        <span className="font-medium">Applied:</span> {' '}
                        {new Date(request.appliedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      Review
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => quickApprove(request.id)}
                    >
                      Quick Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => quickReject(request.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Approved Leaves */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recently Approved</h3>
            <CheckCircle2 size={20} className="text-green-500" />
          </div>
          
          {dashboardData.recentRequests.filter(req => req.status === 'approved').length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recently approved leaves</p>
          ) : (
            <div className="space-y-3">
              {dashboardData.recentRequests
                .filter(req => req.status === 'approved')
                .slice(0, 3)
                .map((request) => (
                <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-green-50 rounded-lg space-y-2 sm:space-y-0">
                  <div>
                    <p className="font-medium text-gray-900">{request.employeeName}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="success" size="sm">{request.days} days</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Leaves */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Team Leaves</h3>
            <Calendar size={20} className="text-blue-500" />
          </div>
          
          {dashboardData.upcomingLeaves.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No upcoming leaves</p>
          ) : (
            <div className="space-y-3">
              {dashboardData.upcomingLeaves.slice(0, 3).map((request) => (
                <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-blue-50 rounded-lg space-y-2 sm:space-y-0">
                  <div>
                    <p className="font-medium text-gray-900">{request.employeeName}</p>
                    <p className="text-sm text-gray-600">
                      Starts {new Date(request.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="info" size="sm">{request.days} days</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

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