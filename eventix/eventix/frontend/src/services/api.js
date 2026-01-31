import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});


api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });
    return Promise.reject(error);
  }
);


export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', null, {
    params: { email, password }
  }),
};


export const eventService = {
  getAllEvents: () => api.get('/events'),
  getEventById: (id) => api.get(`/events/${id}`),
  getEventsByCategory: (categoryId) => api.get(`/events/byCategory/${categoryId}`),
  searchEvents: (query) => api.get('/events', { params: { search: query } }),
};


export const categoryService = {
  getAllCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get(`/categories/${id}`),
};


export const reservationService = {
  createReservation: (data) => api.post('/reservations', data),
  getReservationsByUser: (userId) => api.get(`/reservations/${userId}`),
  getReservationById: (id) => api.get(`/reservations/detail/${id}`),
  cancelReservation: (id) => api.delete(`/reservations/${id}`),
};


export const paymentService = {
  createPayment: (data) => api.post('/payments', data),
  getPaymentByReservation: (reservationId) => api.get(`/payments/reservation/${reservationId}`),
};


export const ticketService = {
  getTicketByReservation: (reservationId) => api.get(`/tickets/reservation/${reservationId}`),
  getAllTicketsByReservation: (reservationId) => api.get(`/tickets/byReservation/${reservationId}`),
  getTicketByCode: (code) => api.get(`/tickets/code/${code}`),
  getAllTickets: () => api.get('/tickets'),
};


export const userService = {
  getUserById: (id) => api.get(`/users/${id}`),
  getAllUsers: () => api.get('/users'),
  checkIsAdmin: (userId) => api.get(`/users/${userId}/is-admin`),
};


export const adminService = {

  createEvent: (data) => api.post('/admin/events', data),
  updateEvent: (id, data) => api.put(`/admin/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),


  createCategory: (data) => api.post('/admin/categories', data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),


  getAllReservations: () => api.get('/admin/reservations'),
  cancelReservation: (id) => api.delete(`/admin/reservations/${id}`),
};

export default api;
