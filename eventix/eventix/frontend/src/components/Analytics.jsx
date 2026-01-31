import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Analytics.css';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign, Award, Activity } from 'lucide-react';

const Analytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalReservations: 0,
    totalUsers: 0,
    totalRevenue: 0,
    bestEvent: null,
    topReservations: [],
    eventData: [],
    revenueData: [],
    categoryData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [eventsRes, reservationsRes, usersRes, categoriesRes] = await Promise.all([
        api.get('/events'),
        api.get('/admin/reservations'),
        api.get('/users'),
        api.get('/categories')
      ]);

      const events = eventsRes.data || [];
      const reservations = reservationsRes.data || [];
      const users = usersRes.data || [];
      const categories = categoriesRes.data || [];

      // Calculate total revenue
      const totalRevenue = reservations.reduce((sum, res) => {
        const eventPrice = events.find(e => e.id === res.event_id)?.priceBase || 0;
        return sum + (eventPrice * (res.seats_reserved || 1));
      }, 0);

      // Find best event
      const eventReservationCount = {};
      reservations.forEach(res => {
        eventReservationCount[res.event_id] = (eventReservationCount[res.event_id] || 0) + res.seats_reserved;
      });

      const bestEventId = Object.entries(eventReservationCount).sort((a, b) => b[1] - a[1])[0]?.[0];
      const bestEvent = bestEventId ? events.find(e => e.id === parseInt(bestEventId)) : null;

      // Prepare event data for bar chart
      const eventChartData = events
        .map(event => ({
          name: event.name.substring(0, 15),
          reservations: reservations.filter(r => r.event_id === event.id).length,
          seats: reservations
            .filter(r => r.event_id === event.id)
            .reduce((sum, r) => sum + (r.seats_reserved || 0), 0)
        }))
        .sort((a, b) => b.reservations - a.reservations)
        .slice(0, 8);

      // Prepare revenue trend data (by event)
      const revenueChartData = events
        .map(event => {
          const eventRevenue = reservations
            .filter(r => r.event_id === event.id)
            .reduce((sum, r) => sum + (event.priceBase * (r.seats_reserved || 0)), 0);
          return {
            name: event.name.substring(0, 15),
            revenue: parseFloat(eventRevenue.toFixed(2))
          };
        })
        .filter(item => item.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8);

      // Prepare category distribution data
      const categoryData = categories.map(category => {
        const categoryReservations = reservations.filter(res => {
          const event = events.find(e => e.id === res.event_id);
          return event?.category_id === category.id;
        }).length;
        return {
          name: category.name,
          value: categoryReservations
        };
      }).filter(item => item.value > 0);

      // Get top 5 reservations
      const topReservations = reservations
        .sort((a, b) => (b.seats_reserved || 0) - (a.seats_reserved || 0))
        .slice(0, 5);

      setStats({
        totalEvents: events.length,
        totalReservations: reservations.length,
        totalUsers: users.length,
        totalRevenue: totalRevenue.toFixed(2),
        bestEvent,
        topReservations,
        eventData: eventChartData,
        revenueData: revenueChartData,
        categoryData
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const colors = ['#F4793A', '#FF9800', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722', '#00BCD4'];

  const StatCard = ({ icon: Icon, label, value, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="stat-card-analytics"
    >
      <div className="stat-icon-analytics">
        <Icon size={32} />
      </div>
      <div className="stat-content-analytics">
        <div className="stat-label-analytics">{label}</div>
        <div className="stat-value-analytics">{value}</div>
        {trend && <div className="stat-trend-analytics">↑ {trend}% this month</div>}
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
    <div className="analytics-page">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="analytics-header"
      >
        <div>
          <span className="analytics-label">SYSTEM INSIGHTS</span>
          <h1 className="analytics-title">ANALYTICS <span style={{ color: 'var(--primary)' }}>CENTER</span></h1>
          <p className="analytics-subtitle">Real-time data visualization and performance metrics</p>
        </div>
        <div className="analytics-badge">
          <Activity size={20} />
          <span>LIVE</span>
        </div>
      </motion.header>

      <div className="stats-grid-analytics">
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
          value={`$${parseFloat(stats.totalRevenue).toLocaleString()}`}
          trend={31}
        />
      </div>

      <div className="charts-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="chart-card"
        >
          <h3 className="chart-title">📊 RESERVATIONS BY EVENT</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats.eventData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #F4793A',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="reservations" fill="#F4793A" name="Reservations" radius={[8, 8, 0, 0]} />
              <Bar dataKey="seats" fill="#FF9800" name="Seats Booked" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="chart-card"
        >
          <h3 className="chart-title">💰 REVENUE BY EVENT</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={stats.revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #F4793A',
                  borderRadius: '8px'
                }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#F4793A" 
                strokeWidth={3}
                dot={{ fill: '#F4793A', r: 5 }}
                activeDot={{ r: 7 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {stats.categoryData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="chart-card"
          >
            <h3 className="chart-title">🎭 RESERVATIONS BY CATEGORY</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={120}
                  fill="#F4793A"
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #F4793A',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      <div className="analytics-sections">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="best-event-card-analytics"
        >
          <div className="best-event-header-analytics">
            <Award size={24} />
            <h2>BEST PERFORMING EVENT</h2>
          </div>
          {stats.bestEvent ? (
            <div className="best-event-content-analytics">
              <div className="best-event-title-analytics">{stats.bestEvent.name}</div>
              <div className="best-event-details-analytics">
                <div className="detail-analytics">
                  <span className="detail-label-analytics">📍 LOCATION</span>
                  <span className="detail-value-analytics">{stats.bestEvent.location}</span>
                </div>
                <div className="detail-analytics">
                  <span className="detail-label-analytics">💰 PRICE</span>
                  <span className="detail-value-analytics">${stats.bestEvent.priceBase}</span>
                </div>
                <div className="detail-analytics">
                  <span className="detail-label-analytics">📅 DATE</span>
                  <span className="detail-value-analytics">
                    {new Date(stats.bestEvent.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-analytics">
                  <span className="detail-label-analytics">🎫 AVAILABLE SEATS</span>
                  <span className="detail-value-analytics">{stats.bestEvent.availableSeats}</span>
                </div>
              </div>
              <div className="best-event-description-analytics">
                {stats.bestEvent.description}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
              No events created yet
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="top-reservations-card-analytics"
        >
          <h2 className="section-title-analytics">📋 TOP RESERVATIONS</h2>
          <div className="reservations-table-analytics">
            <div className="table-header-analytics">
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
                  className="table-row-analytics"
                >
                  <div className="col col-1">{res.userName || `User #${res.user_id}`}</div>
                  <div className="col col-2">{res.eventName || `Event #${res.event_id}`}</div>
                  <div className="col col-3">
                    <span className="seats-badge-analytics">{res.seats_reserved} 🎫</span>
                  </div>
                  <div className="col col-4">
                    {new Date(res.reservationDate).toLocaleDateString()}
                  </div>
                  <div className="col col-5">
                    <span className={`status-badge-analytics status-${res.status?.toLowerCase() || 'pending'}`}>
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

export default Analytics;
