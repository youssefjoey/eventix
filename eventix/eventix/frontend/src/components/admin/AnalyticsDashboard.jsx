import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import '../../styles/AnalyticsDashboard.css';
import { TrendingUp, Users, Calendar, Zap, DollarSign, Award } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalReservations: 0,
    totalUsers: 0,
    totalRevenue: 0,
    bestEvent: null,
    topReservations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [eventsRes, reservationsRes, usersRes] = await Promise.all([
        api.get('/events'),
        api.get('/admin/reservations'),
        api.get('/users')
      ]);

      const events = eventsRes.data || [];
      const reservations = reservationsRes.data || [];
      const users = usersRes.data || [];

      // Calculate total revenue (assuming each seat has a base price)
      const totalRevenue = reservations.reduce((sum, res) => {
        const eventPrice = events.find(e => e.id === res.event_id)?.priceBase || 0;
        return sum + (eventPrice * (res.seats_reserved || 1));
      }, 0);

      // Find best event (most reservations)
      const eventReservationCount = {};
      reservations.forEach(res => {
        eventReservationCount[res.event_id] = (eventReservationCount[res.event_id] || 0) + res.seats_reserved;
      });

      const bestEventId = Object.entries(eventReservationCount).sort((a, b) => b[1] - a[1])[0]?.[0];
      const bestEvent = bestEventId ? events.find(e => e.id === parseInt(bestEventId)) : null;

      // Get top 5 reservations by seats
      const topReservations = reservations
        .sort((a, b) => (b.seats_reserved || 0) - (a.seats_reserved || 0))
        .slice(0, 5);

      setStats({
        totalEvents: events.length,
        totalReservations: reservations.length,
        totalUsers: users.length,
        totalRevenue: totalRevenue.toFixed(2),
        bestEvent,
        topReservations
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="stat-card"
    >
      <div className="stat-icon">
        <Icon size={32} />
      </div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {trend && <div className="stat-trend">↑ {trend}% this month</div>}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="dashboard-header"
      >
        <div>
          <span className="dashboard-label">REAL-TIME INSIGHTS</span>
          <h1 className="dashboard-title">ANALYTICS <span style={{ color: 'var(--primary)' }}>HUB</span></h1>
          <p className="dashboard-subtitle">Comprehensive system overview and performance metrics</p>
        </div>
        <div className="header-badge">
          <Zap size={20} />
          <span>LIVE</span>
        </div>
      </motion.header>

      <div className="stats-grid">
        <StatCard
          icon={Calendar}
          label="TOTAL EVENTS"
          value={stats.totalEvents}
          trend={12}
        />
        <StatCard
          icon={Users}
          label="TOTAL USERS"
          value={stats.totalUsers}
          trend={18}
        />
        <StatCard
          icon={TrendingUp}
          label="RESERVATIONS"
          value={stats.totalReservations}
          trend={24}
        />
        <StatCard
          icon={DollarSign}
          label="TOTAL REVENUE"
          value={`$${Math.round(parseFloat(stats.totalRevenue)).toLocaleString()}`}
          trend={31}
        />
      </div>

      <div className="dashboard-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="best-event-card"
        >
          <div className="best-event-header">
            <Award size={24} />
            <h2>BEST PERFORMING EVENT</h2>
          </div>
          {stats.bestEvent ? (
            <div className="best-event-content">
              <div className="best-event-title">{stats.bestEvent.name}</div>
              <div className="best-event-details">
                <div className="detail">
                  <span className="detail-label">📍 LOCATION</span>
                  <span className="detail-value">{stats.bestEvent.location}</span>
                </div>
                <div className="detail">
                  <span className="detail-label">💰 PRICE</span>
                  <span className="detail-value">${stats.bestEvent.priceBase}</span>
                </div>
                <div className="detail">
                  <span className="detail-label">📅 DATE</span>
                  <span className="detail-value">
                    {new Date(stats.bestEvent.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail">
                  <span className="detail-label">🎫 AVAILABLE SEATS</span>
                  <span className="detail-value">{stats.bestEvent.availableSeats}</span>
                </div>
              </div>
              <div className="best-event-description">
                {stats.bestEvent.description}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
              No events created yet
            </div>
          )}
        </motion.div>
      </div>

      <div className="dashboard-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="top-reservations-card"
        >
          <h2 className="section-title">📊 TOP RESERVATIONS</h2>
          <div className="reservations-table">
            <div className="table-header">
              <div className="col col-1">USER</div>
              <div className="col col-2">EVENT</div>
              <div className="col col-3">SEATS</div>
              <div className="col col-4">DATE</div>
              <div className="col col-5">STATUS</div>
            </div>
            {stats.topReservations.length > 0 ? (
              stats.topReservations.map((res, idx) => (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="table-row"
                >
                  <div className="col col-1">{res.userName || `User #${res.user_id}`}</div>
                  <div className="col col-2">{res.eventName || `Event #${res.event_id}`}</div>
                  <div className="col col-3">
                    <span className="seats-badge">{res.seats_reserved} 🎫</span>
                  </div>
                  <div className="col col-4">
                    {new Date(res.reservationDate).toLocaleDateString()}
                  </div>
                  <div className="col col-5">
                    <span className={`status-badge status-${res.status?.toLowerCase() || 'pending'}`}>
                      {res.status || 'PENDING'}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                No reservations yet
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
