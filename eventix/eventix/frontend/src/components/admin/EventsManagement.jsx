import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/Management.css';

const EventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    totalCapacity: '',
    availableSeats: '',
    priceBase: '',
    categoryId: '',
    imageUrl: '',
    userId: JSON.parse(localStorage.getItem('user'))?.id
  });

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      console.log('✅ Events fetched:', response.data);
      console.log('📸 First event imageUrl:', response.data[0]?.imageUrl);
      console.log('📸 First event full data:', response.data[0]);
      // Handle response - ensure it's an array
      const eventsData = Array.isArray(response.data) ? response.data : [];
      setEvents(eventsData);
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      setEvents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      console.log('✅ Categories fetched:', response.data);
      // Handle response - ensure it's an array
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ File size must be less than 10MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('❌ Please upload an image file');
      return;
    }

    setUploadingImage(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const response = await api.post('/admin/upload-event-image', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Image uploaded successfully:', response.data);
      setFormData(prev => ({
        ...prev,
        imageUrl: response.data.imageUrl
      }));
      alert('✅ Image uploaded successfully!');
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      alert('Failed to upload image: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.date || !formData.categoryId) {
      alert('⚠️ Please fill all required fields');
      return;
    }

    try {
      console.log('📤 Creating Event:', formData);

      // Combine date and time fields into proper LocalDateTime format
      const dateTime = `${formData.date} 00:00`;
      const startDateTime = formData.startTime ? `${formData.date} ${formData.startTime}` : dateTime;
      const endDateTime = formData.endTime ? `${formData.date} ${formData.endTime}` : `${formData.date} 23:59`;

      const response = await api.post('/admin/events', {
        name: formData.name,
        description: formData.description,
        date: dateTime,
        startTime: startDateTime,
        endTime: endDateTime,
        location: formData.location,
        totalCapacity: parseInt(formData.totalCapacity),
        availableSeats: parseInt(formData.availableSeats || formData.totalCapacity),
        priceBase: parseFloat(formData.priceBase),
        imageUrl: formData.imageUrl,
        category_id: parseInt(formData.categoryId),
        user_id: parseInt(formData.userId)
      });

      console.log('✅ Event created successfully!');
      setShowForm(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('❌ Error creating event:', error);
      alert('Failed to create event: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();

    try {
      console.log('📤 Updating Event:', editingId, formData);

      // Combine date and time fields into proper LocalDateTime format
      const dateTime = `${formData.date} 00:00`;
      const startDateTime = formData.startTime ? `${formData.date} ${formData.startTime}` : dateTime;
      const endDateTime = formData.endTime ? `${formData.date} ${formData.endTime}` : `${formData.date} 23:59`;

      await api.put(`/admin/events/${editingId}`, {
        name: formData.name,
        description: formData.description,
        date: dateTime,
        startTime: startDateTime,
        endTime: endDateTime,
        location: formData.location,
        totalCapacity: parseInt(formData.totalCapacity),
        availableSeats: parseInt(formData.availableSeats),
        priceBase: parseFloat(formData.priceBase),
        imageUrl: formData.imageUrl,
        category_id: parseInt(formData.categoryId),
        user_id: parseInt(formData.userId)
      });

      console.log('✅ Event updated successfully!');
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('❌ Error updating event:', error);
      alert('Failed to update event: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('🗑️ Are you sure you want to delete this event?')) return;

    try {
      console.log('📤 Deleting Event:', id);
      await api.delete(`/admin/events/${id}`);
      console.log('✅ Event deleted successfully!');
      fetchEvents();
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleEditEvent = (event) => {
    setFormData({
      name: event.name,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      totalCapacity: event.totalCapacity,
      availableSeats: event.availableSeats,
      priceBase: event.priceBase,
      imageUrl: event.imageUrl || '',
      categoryId: event.categoryId,
      userId: event.userId
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      totalCapacity: '',
      availableSeats: '',
      priceBase: '',
      categoryId: '',
      imageUrl: '',
      userId: JSON.parse(localStorage.getItem('user'))?.id
    });
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <div>
          <h2>📅 Events Management</h2>
          <p className="subtitle">Create, update, and manage all events</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            if (!showForm) resetForm();
          }}
          className="btn btn-primary"
        >
          {showForm ? '❌ Cancel' : '➕ Create Event'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={editingId ? handleUpdateEvent : handleCreateEvent} className="event-form">
          <div className="form-grid">
            <input
              type="text"
              name="name"
              placeholder="Event Name *"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Category *</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
            <input
              type="time"
              name="startTime"
              placeholder="Start Time"
              value={formData.startTime}
              onChange={handleInputChange}
            />
            <input
              type="time"
              name="endTime"
              placeholder="End Time"
              value={formData.endTime}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="totalCapacity"
              placeholder="Total Capacity"
              value={formData.totalCapacity}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="availableSeats"
              placeholder="Available Seats"
              value={formData.availableSeats}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="priceBase"
              placeholder="Price"
              value={formData.priceBase}
              onChange={handleInputChange}
              step="0.01"
              required
            />
          </div>
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
          />

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              📸 Event Image
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px dashed var(--primary)',
                    borderRadius: '8px',
                    cursor: uploadingImage ? 'not-allowed' : 'pointer',
                    opacity: uploadingImage ? 0.6 : 1
                  }}
                />
                {uploadingImage && <p style={{ color: 'var(--primary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>⏳ Uploading image...</p>}
              </div>
              {formData.imageUrl && (
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '2px solid var(--primary)'
                }}>
                  <img
                    src={formData.imageUrl}
                    alt="Event preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-success">
            {editingId ? '💾 Update Event' : '✨ Create Event'}
          </button>
        </form>
      )}

      <div className={`events-grid ${loading ? 'loading' : ''}`}>
        {events.map(event => (
          <div key={event.id} className="event-card">
            <div className="card-header">
              <h3>{event.name}</h3>
              <span className="category-badge">{event.categoryId}</span>
            </div>
            <p className="card-desc">{event.description}</p>
            <div className="card-details">
              <div className="detail-item">
                <span className="label">📅 Date:</span>
                <span>{event.date}</span>
              </div>
              <div className="detail-item">
                <span className="label">⏰ Time:</span>
                <span>{event.startTime} - {event.endTime}</span>
              </div>
              <div className="detail-item">
                <span className="label">📍 Location:</span>
                <span>{event.location}</span>
              </div>
              <div className="detail-item">
                <span className="label">💰 Price:</span>
                <span>${event.priceBase}</span>
              </div>
              <div className="detail-item">
                <span className="label">🎫 Seats:</span>
                <span>{event.availableSeats} / {event.totalCapacity}</span>
              </div>
            </div>
            <div className="card-actions">
              <button
                onClick={() => handleEditEvent(event)}
                className="btn btn-secondary"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="btn btn-danger"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsManagement;

