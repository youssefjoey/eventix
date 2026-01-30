import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationService, ticketService, eventService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Tickets.css';
import { Download, Share2, Copy, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MyTickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const fetchTickets = async () => {
      try {
        const reservationsRes = await reservationService.getReservationsByUser(user.id);
        const reservations = reservationsRes.data;

        if (!reservations || reservations.length === 0) {
          setTickets([]);
          setEvents({});
          setLoading(false);
          return;
        }

        const ticketsData = [];
        const eventsData = {};

        for (const reservation of reservations) {
          if (!eventsData[reservation.event_id]) {
            try {
              const eventRes = await eventService.getEventById(reservation.event_id);
              eventsData[reservation.event_id] = eventRes.data;
            } catch (eventError) {
              console.error(`Error fetching event ${reservation.event_id}:`, eventError.message);
            }
          }

          try {
            const ticketRes = await ticketService.getAllTicketsByReservation(reservation.id);
            const ticketsArray = Array.isArray(ticketRes.data) ? ticketRes.data : [ticketRes.data];
            ticketsArray.forEach(ticket => {
              ticketsData.push({
                ...ticket,
                reservation_id: reservation.id,
                event_id: reservation.event_id,
                seats_reserved: reservation.seats_reserved
              });
            });
          } catch (error) {
            console.error(`Error fetching tickets for reservation ${reservation.id}:`, error.message);
            // Don't create placeholder tickets - wait for real tickets to be saved to database
          }
        }

        setTickets(ticketsData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, navigate]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadTicket = (ticket) => {
    const ticketContent = `EVENT TICKET\n============\nEvent: ${events[ticket.event_id]?.name}\nCode: ${ticket.ticketCode}`;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(ticketContent));
    element.setAttribute('download', `ticket-${ticket.ticketCode}.txt`);
    element.click();
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"></div></div>;

  return (
    <div className="container" style={{ paddingBottom: '150px', paddingTop: '160px' }}>
      <header className="page-header" style={{ textAlign: 'center', marginBottom: '8rem' }}>
        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'block' }}>SECURED ACCESS</span>
        <h1 style={{ fontSize: '6rem' }}>MY <span style={{ color: 'var(--primary)' }}>PASSES</span></h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '2rem', fontStyle: 'italic' }}>Your exclusive collection of curated access points.</p>
      </header>

      {tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: '3rem' }}>NO RESERVATIONS FOUND.</p>
          <button onClick={() => navigate('/events')} className="btn-primary">EXPLORE FEED</button>
        </div>
      ) : (
        <div className="tickets-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '4rem', justifyContent: 'center' }}>
          {tickets.map((ticket, index) => {
            const event = events[ticket.event_id];
            return (
              <motion.div
                key={ticket.id}
                className="ticket"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="ticket-header">
                  <div className="ticket-event-name">{event ? event.name : `EVENT #${ticket.event_id}`}</div>
                  <div className="ticket-status">ACTIVE</div>
                </div>

                <div className="ticket-body">
                  <div className="ticket-detail">
                    <div className="ticket-label">LOCATION</div>
                    <div className="ticket-value">{event?.location}</div>
                  </div>
                  <div className="ticket-detail">
                    <div className="ticket-label">DATE</div>
                    <div className="ticket-value">{event ? new Date(event.date).toLocaleDateString() : '---'}</div>
                  </div>
                  <div className="ticket-divider"></div>
                  <div className="ticket-code">
                    <div className="ticket-code-label">IDENTIFIER</div>
                    <div className="ticket-code-value">{ticket.ticketCode}</div>
                  </div>
                </div>

                <div className="ticket-footer">
                  <button onClick={() => handleCopyCode(ticket.ticketCode)}>
                    {copiedCode === ticket.ticketCode ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </button>
                  <button onClick={() => handleDownloadTicket(ticket)}>
                    <Download size={16} />
                  </button>
                  <button><Share2 size={16} /></button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
