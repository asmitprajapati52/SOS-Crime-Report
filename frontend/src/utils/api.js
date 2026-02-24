import axios from 'axios';


const API = axios.create({
  baseURL: "https://sos-crime-report.onrender.com/api"
});



API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sahayataToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const reportAPI = {
  getAll: (params) => API.get('/reports', { params }),
  getById: (id) => API.get(`/reports/${id}`),
  create: (data) => API.post('/reports', data),
  validate: (id, comment) => API.post(`/reports/${id}/validate`, { comment }),
  getMy: () => API.get('/reports/my/all'),
  getStats: () => API.get('/reports/stats/all'),
  getDensity: () => API.get('/reports/density/areas')
};

export const sosAPI = {
  create: (data) => API.post('/sos', data),
  getAll: (params) => API.get('/sos', { params }),
  getMy: () => API.get('/sos/my/all'),
  getNearby: (params) => API.get('/sos/nearby/active', { params }),
  updateStatus: (id, data) => API.put(`/sos/${id}/status`, data),
  respond: (id, data) => API.post(`/sos/${id}/respond`, data)
};

export const authAPI = {
  verifyOTP: (otp) => API.post('/auth/verify-otp', { otp }),
  resendOTP: () => API.post('/auth/resend-otp'),
  addEmergencyContact: (data) => API.post('/auth/emergency-contacts', data),
  getEmergencyContacts: () => API.get('/auth/emergency-contacts'),
  deleteEmergencyContact: (id) => API.delete(`/auth/emergency-contacts/${id}`)
};

export default API;
