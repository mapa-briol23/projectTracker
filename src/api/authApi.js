import api from './axios';

function login(email, password) {
  return api.post('/auth/login', { email, password }, { withCredentials: true });
}

function logout() {
  return api.post('/auth/logout', {}, { withCredentials: true });
}

function getMe() {
  return api.get('/auth/me');
}

export default { login, logout, getMe };
