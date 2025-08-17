import React, { useState, useEffect } from 'react';
import { Employee } from './types';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { LeaveManagement } from './components/LeaveManagement';
import { HRDashboard } from './components/HRDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('lms_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Save user to localStorage when user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('lms_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('lms_current_user');
    }
  }, [currentUser]);

  const handleLogin = (user: Employee) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  // Show login if no current user
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} />;
      case 'employees':
        return <EmployeeList currentUser={currentUser} />;
      case 'leaves':
        return <LeaveManagement currentUser={currentUser} />;
      case 'hr-dashboard':
        return currentUser.role === 'hr' ? <HRDashboard currentUser={currentUser} /> : <Dashboard currentUser={currentUser} />;
      default:
        return <Dashboard currentUser={currentUser} />;
    }
  };

  const currentUserInfo = {
    name: currentUser.name,
    role: currentUser.role,
    email: currentUser.email
  };

  return (
    <Layout
      currentView={currentView}
      onViewChange={handleViewChange}
      currentUser={currentUserInfo}
      onLogout={handleLogout}
    >
      {renderCurrentView()}
    </Layout>
  );
}

export default App;