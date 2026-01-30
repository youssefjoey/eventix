import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import '../styles/EventPages.css';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="home-container" style={{ background: 'var(--bg-dark)' }}>
      <section className="hero" style={{ minHeight: '90vh', paddingTop: '200px', paddingBottom: '100px', paddingLeft: '4rem', paddingRight: '4rem' }}>
        <div className="container" style={{ padding: 0 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          >
            <span style={{
              color: 'var(--primary)',
              fontWeight: 800,
              fontSize: '0.7rem',
              letterSpacing: '0.4rem',
              display: 'block',
              marginBottom: '2rem'
            }}>A PRESTIGE COLLECTION</span>

            <h1 style={{ marginBottom: '3.5rem', maxWidth: '1000px', lineHeight: '0.85' }}>
              RESERVE <br />
              <span style={{ color: 'var(--primary)', fontWeight: 300 }}>EXCLUSIVE.</span>
            </h1>

            <p style={{ fontSize: '1.4rem', maxWidth: '600px', fontWeight: 300, color: 'var(--text-dim)', lineHeight: '1.6', marginBottom: '5rem' }}>
              An editorial approach to high-fidelity gatherings. Secure your credentials for the world’s most sought-after milestones.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate('/events')}>
                BROWSE FEED
              </button>
              <button className="btn-secondary" onClick={() => navigate('/register')}>
                JOIN CLUB
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--border-bold)', padding: '150px 0', background: 'var(--bg-black)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
            <div style={{ background: 'transparent' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 900, marginBottom: '2rem', fontSize: '1.4rem' }}>01</div>
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 500, fontFamily: 'Unbounded' }}>SYNCED</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: '1.6' }}>Real-time inventory orchestration across all secure dimension points.</p>
            </div>
            <div style={{ background: 'transparent' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 900, marginBottom: '2rem', fontSize: '1.4rem' }}>02</div>
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 500, fontFamily: 'Unbounded' }}>PRIVATE</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: '1.6' }}>Military-grade encryption protecting every fragment of your digital identity.</p>
            </div>
            <div style={{ background: 'transparent' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 900, marginBottom: '2rem', fontSize: '1.4rem' }}>03</div>
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 500, fontFamily: 'Unbounded' }}>ELITE</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: '1.6' }}>Access to a closed network of events that transcend standard availability.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '180px 0', textAlign: 'center', background: 'var(--bg-dark)' }}>
        <div className="container">
          <h2 style={{ fontSize: '7rem', marginBottom: '5rem', letterSpacing: '-0.06em' }}>READY?</h2>
          <button className="btn-primary" style={{ padding: '1.5rem 5rem', fontSize: '1rem' }} onClick={() => navigate('/login')}>
            INITIATE SESSION
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
