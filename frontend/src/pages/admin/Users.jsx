import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, Mail, Phone, Clock, UserCheck } from 'lucide-react';
import api from '../../api/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchName, setSearchName] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = '/admin/users';
      if (roleFilter) {
        url += `?role=${roleFilter}`;
      }
      const response = await api.get(url);
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error('Error fetching users list:', err);
      setError('Could not retrieve user directory records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchName.toLowerCase()) ||
    u.email.toLowerCase().includes(searchName.toLowerCase())
  );

  return (
    <div className="page-fade-in" style={{ width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="h2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UsersIcon size={24} style={{ color: 'var(--primary)' }} />
          <span>User Directory</span>
        </h1>
        <p className="text-lead" style={{ fontSize: '0.95rem', marginTop: '0.1rem' }}>
          Explore and filter account profiles registered on the Doctor Hub portal.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters bar */}
      <div className="search-header" style={{ padding: '1.25rem 1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
              <Search size={12} /> Search User Name or Email
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. John Doe"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '180px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Filter by Role</label>
            <select
              className="form-control"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="assistant">Assistants</option>
              <option value="admin">Admins</option>
              <option value="super_admin">Super Admins</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading user directory...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <UsersIcon size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
          <h3 className="h3">No Users Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            No accounts match the search keywords or filters.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Profile Details</th>
                <th>Role Identity</th>
                <th>Phone Number</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Mail size={12} />
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      u.role === 'patient' ? 'badge-success' :
                      u.role === 'doctor' ? 'badge-info' :
                      u.role === 'assistant' ? 'badge-warning' : 'badge-error'
                    }`} style={{ textTransform: 'capitalize' }}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {u.phone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}>
                        <Phone size={12} style={{ color: 'var(--text-light)' }} />
                        <span>{u.phone}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>-</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      <Clock size={12} />
                      <span>{new Date(u.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
