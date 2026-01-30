import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar" style={{
      background: 'rgba(18, 18, 18, 0.7)',
      backdropFilter: 'blur(40px) saturate(150%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      height: '64px',
      width: 'max-content',
      margin: '0 auto',
      borderRadius: '100px',
      position: 'fixed',
      top: '30px',
      left: 0, right: 0,
      zIndex: 1000,
      padding: '0 0.5rem',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
    }}>
      <div className="navbar-container" style={{ gap: '1.5rem', height: '100%', padding: '0 1rem' }}>
        <Link to="/" className="navbar-logo" style={{ transform: 'scale(1)', display: 'flex', alignItems: 'center' }}>
          <Zap size={22} color="var(--primary)" fill="var(--primary)" />
        </Link>

        {}
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>

        <div className="navbar-links" style={{ gap: '1.5rem' }}>
          <Link to="/events" className="navbar-link" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>EXPLORE</Link>
          <Link to="/categories" className="navbar-link" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>GENRES</Link>
          {user && <Link to="/my-tickets" className="navbar-link" style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>TICKETS</Link>}
          {user?.role === 'ADMIN' && <Link to="/admin" className="navbar-link" style={{ fontSize: '0.7rem', fontWeight: 900, color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '100px' }}>ADMIN HUB</Link>}
        </div>

        <div className="navbar-auth" style={{ gap: '0.5rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div className="user-avatar" style={{
                width: '32px', height: '32px',
                borderRadius: '50%', background: 'var(--primary)',
                color: '#000', fontSize: '0.8rem', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
              }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <button
                className="btn-secondary"
                onClick={logout}
                style={{ height: '32px', padding: '0 1rem', fontSize: '0.6rem', border: 'none', borderRadius: '100px', background: 'rgba(255,255,255,0.05)' }}>
                OUT
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className="btn-primary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.7rem', height: '36px' }}>
                ACCESS
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
