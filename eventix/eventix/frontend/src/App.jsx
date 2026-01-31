import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Events from './components/Events';
import EventDetail from './components/EventDetail';
import MyTickets from './components/MyTickets';
import Categories from './components/Categories';
import AdminDashboard from './components/AdminDashboard';
import Analytics from './components/Analytics';
import Payment from './components/Payment';
import Starfield from './components/Starfield';
import './styles/Global.css';

const PageWrapper = ({ children }) => (
  <motion.main
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.main>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Only allow ADMIN role to access admin routes
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const HomeRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // If not logged in, show login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, show home page
  return children;
};

function AppContent() {
  const location = useLocation();

  return (
    <>
      <Starfield />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><HomeRoute><Home /></HomeRoute></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/events" element={<PageWrapper><Events /></PageWrapper>} />
          <Route path="/categories" element={<PageWrapper><Categories /></PageWrapper>} />
          <Route path="/event/:eventId" element={<PageWrapper><ProtectedRoute><EventDetail /></ProtectedRoute></PageWrapper>} />
          <Route path="/payment/:reservationId" element={<PageWrapper><ProtectedRoute><Payment /></ProtectedRoute></PageWrapper>} />
          <Route path="/my-tickets" element={<PageWrapper><ProtectedRoute><MyTickets /></ProtectedRoute></PageWrapper>} />
          <Route path="/analytics" element={<PageWrapper><AdminRoute><Analytics /></AdminRoute></PageWrapper>} />
          <Route path="/admin" element={<PageWrapper><AdminRoute><AdminDashboard /></AdminRoute></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;


