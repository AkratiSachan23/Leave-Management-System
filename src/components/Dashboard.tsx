import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, XCircle, TrendingUp, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { DashboardData, Employee } from '../types';
import { leaveService } from '../services/leaveService';

interface DashboardProps {
  currentUser: Employee | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const response = leaveService.getDashboardData();
    if (response.success) {
      setDashboardData(response.data!);
    }
    setLoading(false);
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
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const { stats, recentRequests, upcomingLeaves, lowBalanceEmployees } = dashboardData;

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Approved Requests',
      value: stats.approvedRequests,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Average Leave/Employee',
      value: stats.averageLeavePerEmployee,
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    } as const;
    return variants[status as keyof typeof variants] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {currentUser?.name || 'User'}!
        </h1>
        <p className="text-blue-100">
          Here's an overview of the leave management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <Icon size={24} className={stat.textColor} />
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Requests */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Leave Requests</h3>
            <Calendar size={20} className="text-gray-400" />
          </div>
          
          {recentRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent requests</p>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                  <div>
                    <p className="font-medium text-gray-900">{request.employeeName}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">{request.days} days</p>
                  </div>
                  <Badge variant={getStatusBadge(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Leaves */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Approved Leaves</h3>
            <CheckCircle size={20} className="text-gray-400" />
          </div>
          
          {upcomingLeaves.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No upcoming leaves</p>
          ) : (
            <div className="space-y-3">
              {upcomingLeaves.map((request) => (
                <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-green-50 rounded-lg space-y-2 sm:space-y-0">
                  <div>
                    <p className="font-medium text-gray-900">{request.employeeName}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">{request.days} days • {request.leaveType}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Low Balance Employees (HR Only) */}
      {currentUser?.role === 'hr' && lowBalanceEmployees.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Employees with Low Leave Balance</h3>
            <Users size={20} className="text-gray-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowBalanceEmployees.map((employee) => (
              <div key={employee.id} className="p-3 bg-red-50 rounded-lg">
                <p className="font-medium text-gray-900">{employee.name}</p>
                <p className="text-sm text-gray-600">{employee.department}</p>
                <p className="text-xs text-red-600 font-medium">
                  {employee.leaveBalance} days remaining
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};