import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import EventsManagement from './admin/EventsManagement';
import CategoriesManagement from './admin/CategoriesManagement';
import UsersManagement from './admin/UsersManagement';
import ReservationsManagement from './admin/ReservationsManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    setUser(userData);
    checkAdminStatus(userData.id);
  }, [navigate]);

  const checkAdminStatus = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/is-admin`);
      setIsAdmin(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Admin check failed:', error);
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '160px 20px' }}>
        <h2 style={{ fontSize: '4rem', marginBottom: '2rem' }}>🔒 ACCESS <br />DENIED</h2>
        <p style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Insufficient clearance level to access System Operations.</p>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '4rem' }}>RETURN TO BASE</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '160px', paddingBottom: '100px' }}>
      <header style={{ marginBottom: '6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'block' }}>MISSION CONTROL</span>
          <h1 style={{ fontSize: '4.5rem' }}>ADMIN <span style={{ color: 'var(--primary)' }}>HUB</span></h1>
        </div>
        <div className="card" style={{ padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderRadius: '100px' }}>
          <div className="user-avatar" style={{ width: '40px', height: '40px', background: 'var(--primary)', color: '#000', fontSize: '1rem', fontWeight: 900 }}>{user?.name?.[0]}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.1em' }}>LEVEL 5 ACCESS</div>
          </div>
        </div>
      </header>

      <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'events', label: 'EVENTS' },
          { id: 'categories', label: 'GENRES' },
          { id: 'users', label: 'OPERATIONS' },
          { id: 'reservations', label: 'LOGS' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}
            style={{ flexGrow: 1, minWidth: '150px', borderRadius: '100px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="admin-content"
      >
        {activeTab === 'events' && <EventsManagement />}
        {activeTab === 'categories' && <CategoriesManagement />}
        {activeTab === 'users' && <UsersManagement />}
        {activeTab === 'reservations' && <ReservationsManagement />}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
