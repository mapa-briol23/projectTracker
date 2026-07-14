import api from './axios';

function getAll() {
  return api.get('/users');
}

export default { getAll };
