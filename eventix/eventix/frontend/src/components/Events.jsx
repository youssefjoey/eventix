import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { eventService, categoryService, reservationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/EventPages.css';
import { Search, ArrowRight, X, Plus, Minus, MapPin, Clock, ShieldCheck } from 'lucide-react';

const Events = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [activeEvent, setActiveEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reserveError, setReserveError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, categoriesRes] = await Promise.all([
          eventService.getAllEvents(),
          categoryService.getAllCategories()
        ]);
        setEvents(eventsRes.data || []);
        setCategories(categoriesRes.data || []);
        setFilteredEvents(eventsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = events;
    if (selectedCategory) {
      filtered = filtered.filter(event => event.category_id === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredEvents(filtered);
  }, [selectedCategory, searchQuery, events]);

  const openEventModal = (event) => {
    if (!user) { navigate('/login'); return; }
    setActiveEvent(event);
    setQuantity(1);
    setSuccess(false);
    setReserveError(null);
  };

  const handleReservation = async () => {
    try {
      setSubmitting(true);
      setReserveError(null);
      const response = await reservationService.createReservation({
        user_id: user.id,
        event_id: activeEvent.id,
        seats_reserved: quantity
      });
      const reservationId = response.data.id;
      setSuccess(true);
      setTimeout(() => {
        setActiveEvent(null);
        navigate(`/payment/${reservationId}`);
      }, 2000);
    } catch (err) {
      setReserveError(err.response?.data?.message || "Reservation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"></div></div>;

  return (
    <div className="container" style={{ paddingBottom: '100px', paddingTop: '100px' }}>
      <header className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'block' }}>CURATED FEED</span>
          <h1 style={{ fontSize: '5rem', marginBottom: '2rem' }}>EVENT <span style={{ color: 'var(--primary)' }}>LOG</span></h1>
          <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-dim)', fontStyle: 'italic' }}>Access the most exclusive gatherings worldwide.</p>
        </motion.div>
      </header>

      <div className="search-section">
        <div className="search-bar">
          <Search size={18} color="var(--text-muted)" style={{ marginLeft: '1.5rem' }} />
          <input
            type="text"
            placeholder="Search events, venues, vibes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="events-grid">
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.id}
            className="event-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
          >
            <div className="event-image">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.name}
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
                  fontSize: '1.2rem'
                }}>
                  No Image
                </div>
              )}
            </div>
            <div className="event-body">
              <div className="event-category">
                {categories.find(c => c.id === event.category_id)?.name || 'ACCESS'}
              </div>
              <h3 className="event-name">{event.name}</h3>

              <div className="event-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ width: '4px', height: '4px', background: 'var(--primary)', borderRadius: '50%' }}></span>
                  {event.availableSeats} AVAILABLE SEATS
                </div>
              </div>

              <div className="event-price">${event.priceBase}</div>

              <div className="event-footer">
                <button
                  className="btn-primary"
                  onClick={() => openEventModal(event)}
                >
                  RESERVE <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeEvent && (
          <div className="modal-overlay" onClick={() => setActiveEvent(null)}>
            <motion.div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <button className="modal-close" onClick={() => setActiveEvent(null)}>
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.3em', display: 'block', marginBottom: '1.5rem' }}>RESERVE ACCESS</span>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'Unbounded' }}>{activeEvent.name}</h3>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} /> {activeEvent.location}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={14} /> {new Date(activeEvent.date).toLocaleDateString()}</div>
                </div>

                <div style={{ marginBottom: '3.5rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.6rem', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>QUANTITY</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="btn-secondary"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0 }}
                    ><Minus size={16} /></button>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(activeEvent.availableSeats, quantity + 1))}
                      className="btn-secondary"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0 }}
                    ><Plus size={16} /></button>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-bold)', paddingTop: '3rem', marginBottom: '3.5rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.6rem', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>TOTAL PRICE</div>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)' }}>${(activeEvent.priceBase * quantity).toFixed(2)}</div>
                </div>

                {reserveError && <p style={{ color: '#f85149', fontSize: '0.8rem', marginBottom: '2rem' }}>{reserveError}</p>}

                <button
                  className="btn-primary"
                  style={{ width: '100%', padding: '1.2rem' }}
                  onClick={handleReservation}
                  disabled={submitting || success}
                >
                  {submitting ? 'PROCESSING...' : success ? 'ACCESS SECURED' : 'CONFIRM RESERVATION'}
                </button>

                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  <ShieldCheck size={14} /> ENCRYPTED GATEWAY ACTIVE
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
