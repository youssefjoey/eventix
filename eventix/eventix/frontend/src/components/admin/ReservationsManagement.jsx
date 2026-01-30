import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/Management.css';

const ReservationsManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/reservations');
      console.log('✅ Reservations fetched:', response.data);
      
      const reservationsData = Array.isArray(response.data) ? response.data : [];
      setReservations(reservationsData);
    } catch (error) {
      console.error('❌ Error fetching reservations:', error);
      setReservations([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id) => {
    if (!window.confirm('🗑️ Are you sure you want to cancel this reservation?')) return;

    try {
      console.log('📤 Cancelling Reservation:', id);
      await api.delete(`/admin/reservations/${id}`);
      console.log('✅ Reservation cancelled successfully!');
      fetchReservations();
    } catch (error) {
      console.error('❌ Error cancelling reservation:', error);
      alert('Failed to cancel reservation: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <div>
          <h2>🎫 Reservations Management</h2>
          <p className="subtitle">View and manage all ticket reservations</p>
        </div>
      </div>

      <div className={`reservations-grid ${loading ? 'loading' : ''}`}>
        {reservations.map(reservation => (
          <div key={reservation.id} className="reservation-card">
            <div className="card-header">
              <h3>Reservation #{reservation.id}</h3>
              <span className={`status-badge ${reservation.status?.toLowerCase()}`}>
                {reservation.status || 'ACTIVE'}
              </span>
            </div>
            <div className="card-details">
              <div className="detail-item">
                <span className="label">👤 User:</span>
                <span>{reservation.userName || `User #${reservation.user_id}`}</span>
              </div>
              <div className="detail-item">
                <span className="label">📅 Event:</span>
                <span>{reservation.eventName || `Event #${reservation.event_id}`}</span>
              </div>
              <div className="detail-item">
                <span className="label">🎫 Seats Reserved:</span>
                <span>{reservation.seats_reserved}</span>
              </div>
              <div className="detail-item">
                <span className="label">📅 Reservation Date:</span>
                <span>{reservation.reservationDate ? new Date(reservation.reservationDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            <div className="card-actions">
              <button
                onClick={() => handleCancelReservation(reservation.id)}
                className="btn btn-danger"
              >
                ❌ Cancel Reservation
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReservationsManagement;

