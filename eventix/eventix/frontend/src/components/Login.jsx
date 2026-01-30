import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(email, password);
      setSuccess('Access Granted. Sychnronizing...');
      login(response.data);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      >
        <div className="auth-header">
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.3em', display: 'block', marginBottom: '1.5rem' }}>SECURE ACCESS</span>
          <h2>RE-ENTRY <br /><span style={{ color: 'var(--primary)' }}>SESSION</span></h2>
          <p>Login to manage your reservations and collection.</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(63, 185, 80, 0.1)', border: '1px solid rgba(63, 185, 80, 0.2)', color: '#3fb950', padding: '1.2rem', borderRadius: '20px', marginBottom: '2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>IDENTIFIER</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
            />
          </div>

          <div className="form-group">
            <label>SECURITY KEY</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1.5rem', padding: '1.5rem' }}
          >
            {loading ? 'SYNCING...' : 'INITIATE ACCESS'}
          </button>
        </form>

        <div className="auth-footer">
          New to Eventix? <Link to="/register">Create Account</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
