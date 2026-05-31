import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorSearch from './pages/DoctorSearch';
import DoctorProfile from './pages/DoctorProfile';

// Patient Dashboard Pages
import Appointments from './pages/patient/Appointments';
import PaymentUpload from './pages/patient/PaymentUpload';
import MedicalHistory from './pages/patient/MedicalHistory';

// Doctor Dashboard Pages
import Schedule from './pages/doctor/Schedule';
import Patients from './pages/doctor/Patients';
import Diagnosis from './pages/doctor/Diagnosis';

// Assistant Dashboard Pages
import PaymentsQueue from './pages/assistant/PaymentsQueue';

// Admin / Super Admin Pages
import Analytics from './pages/admin/Analytics';
import Approvals from './pages/admin/Approvals';
import Users from './pages/admin/Users';

import './App.css';

// Dashboard Layout Wrapper
const DashboardLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content page-fade-in" style={{ width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

// Public Layout Wrapper
const PublicLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content page-fade-in" style={{ width: '100%' }}>
        {children}
      </main>
    </div>
  );
};

// Landing page — full-bleed, no dashboard padding
const LandingLayout = ({ children }) => {
  return (
    <div className="app-container landing-app">
      <Navbar variant="landing" />
      <main className="landing-main">{children}</main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingLayout><Home /></LandingLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
          <Route path="/doctors" element={<PublicLayout><DoctorSearch /></PublicLayout>} />
          <Route path="/doctors/:id" element={<PublicLayout><DoctorProfile /></PublicLayout>} />

          {/* Patient Routes */}
          <Route path="/patient/appointments" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <DashboardLayout><Appointments /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/patient/payments" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <DashboardLayout><PaymentUpload /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/patient/history" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <DashboardLayout><MedicalHistory /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Doctor Routes */}
          <Route path="/doctor/schedule" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DashboardLayout><Schedule /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/doctor/patients" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DashboardLayout><Patients /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/doctor/diagnosis" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DashboardLayout><Diagnosis /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Assistant Routes */}
          <Route path="/assistant/payments" element={
            <ProtectedRoute allowedRoles={['assistant']}>
              <DashboardLayout><PaymentsQueue /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Admin & Super Admin Routes */}
          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DashboardLayout><Analytics /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/approvals" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DashboardLayout><Approvals /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DashboardLayout><Users /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Fallback Catch-All Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
