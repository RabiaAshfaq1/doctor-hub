import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Calendar,
  CreditCard,
  FileText,
  UserCheck,
  Users,
  BarChart2,
  Clock,
  Clipboard,
  PlusSquare
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const renderLinks = () => {
    switch (user.role) {
      case 'patient':
        return (
          <>
            <NavLink to="/patient/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Calendar size={18} />
              <span>Appointments</span>
            </NavLink>
            <NavLink to="/patient/payments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <CreditCard size={18} />
              <span>Payment Upload</span>
            </NavLink>
            <NavLink to="/patient/history" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              <span>Medical History</span>
            </NavLink>
          </>
        );
      case 'doctor':
        return (
          <>
            <NavLink to="/doctor/schedule" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Calendar size={18} />
              <span>My Schedule</span>
            </NavLink>
            <NavLink to="/doctor/patients" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>Patient Records</span>
            </NavLink>
            <NavLink to="/doctor/diagnosis" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <PlusSquare size={18} />
              <span>Add Diagnosis</span>
            </NavLink>
          </>
        );
      case 'assistant':
        return (
          <>
            <NavLink to="/assistant/payments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Clock size={18} />
              <span>Verification Queue</span>
            </NavLink>
          </>
        );
      case 'admin':
      case 'super_admin':
        return (
          <>
            <NavLink to="/admin/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <BarChart2 size={18} />
              <span>Analytics Dashboard</span>
            </NavLink>
            <NavLink to="/admin/approvals" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <UserCheck size={18} />
              <span>Doctor Approvals</span>
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>User Management</span>
            </NavLink>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="sidebar">
      <div style={{ padding: '0.5rem 1.25rem 1.5rem 1.25rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <p className="text-lead" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', tracking: '0.05em', color: 'var(--text-light)' }}>
          {user.role} workspace
        </p>
      </div>
      {renderLinks()}
    </aside>
  );
};

export default Sidebar;
