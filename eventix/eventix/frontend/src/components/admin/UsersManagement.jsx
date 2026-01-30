import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/Management.css';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      console.log('✅ Users fetched:', response.data);
      
      const usersData = Array.isArray(response.data) ? response.data : [];
      setUsers(usersData);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <div>
          <h2>👥 Users Management</h2>
          <p className="subtitle">View all registered users</p>
        </div>
      </div>

      <div className={`users-table ${loading ? 'loading' : ''}`}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{user.name?.charAt(0)}</div>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role?.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className="status-badge active">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManagement;

