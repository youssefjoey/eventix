import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService, reservationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Users, ArrowLeft, Plus, Minus, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventService.getEventById(eventId);
        setEvent(response.data);
      } catch (err) {
        setError("Event loading failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleReservation = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const response = await reservationService.createReservation({
        user_id: user.id,
        event_id: parseInt(eventId),
        seats_reserved: quantity
      });
      const reservationId = response.data.id;
      setSuccess(true);
      setTimeout(() => navigate(`/payment/${reservationId}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reservation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"></div></div>;
  if (!event) return <div className="container" style={{ padding: '150px 0', textAlign: 'center' }}><h2>LOG NOT FOUND</h2></div>;

  const totalPrice = (event.priceBase * quantity).toFixed(2);

  return (
    <div className="container" style={{ paddingTop: '160px', paddingBottom: '150px' }}>
      <button
        onClick={() => navigate('/events')}
        className="btn-secondary"
        style={{ marginBottom: '5rem', padding: '0.8rem 1.8rem', fontSize: '0.7rem', border: 'none', background: 'var(--bg-surface)' }}>
        <ArrowLeft size={16} /> COLLECTION
      </button>

      { }
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <motion.div
          className="event-image"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ height: '600px', marginBottom: '5rem', background: '#000', borderRadius: '40px', overflow: 'hidden', boxShadow: 'var(--shadow-heavy)' }}
        >
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1540575861501-7ad05823c9f5?auto=format&fit=crop&q=80&w=800";
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, var(--primary), #1a1a2e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '1.5rem'
            }}>
              No Image Available
            </div>
          )}
        </motion.div>

        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.4em', marginBottom: '2rem', display: 'block' }}>RESERVE ACCESS</span>
          <h1 style={{ fontSize: '6rem', marginBottom: '4rem' }}>{event.name}</h1>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '5rem', marginBottom: '5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-dim)' }}>
              <MapPin size={20} color="var(--primary)" />
              <span style={{ fontWeight: 600 }}>{event.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-dim)' }}>
              <Clock size={20} color="var(--primary)" />
              <span style={{ fontWeight: 600 }}>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-dim)' }}>
              <Users size={20} color="var(--primary)" />
              <span style={{ fontWeight: 600 }}>{event.availableSeats} LEFT</span>
            </div>
          </div>

          <p style={{ fontSize: '1.4rem', color: 'var(--text-dim)', lineHeight: '1.8', fontWeight: 300, maxWidth: '800px', margin: '0 auto' }}>
            {event.description || "A curated experience designed for the most exclusive attendees. Secure your place in this high-fidelity gathering before slots are exhausted."}
          </p>
        </div>

        { }
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '480px', margin: '8rem auto 0', padding: '4rem' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>RESERVATION</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>SECURED GATEWAY ACTIVE</p>
          </div>

          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.2em', marginBottom: '2rem', textAlign: 'center' }}>QUANTITY</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2.5rem' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="btn-secondary"
                style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0 }}
              ><Minus size={18} /></button>
              <span style={{ fontSize: '2.8rem', fontWeight: 800 }}>{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(event.availableSeats, quantity + 1))}
                className="btn-secondary"
                style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0 }}
              ><Plus size={18} /></button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-bold)', paddingTop: '3.5rem', marginBottom: '4rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.2em', marginBottom: '1rem' }}>TOTAL PRICE</div>
            <div style={{ fontSize: '4rem', fontWeight: 900, color: '#fff' }}>${totalPrice}</div>
          </div>

          {error && <p style={{ color: '#f85149', fontSize: '0.85rem', marginBottom: '2rem', textAlign: 'center' }}>{error}</p>}

          <button
            className="btn-primary"
            style={{ width: '100%', padding: '1.5rem' }}
            onClick={handleReservation}
            disabled={submitting || success}
          >
            {submitting ? 'PROCESSING...' : success ? 'ACCESS GRANTED' : 'RESERVE NOW'}
          </button>

          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <ShieldCheck size={14} /> ENCRYPTED TRANSACTION
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EventDetail;
