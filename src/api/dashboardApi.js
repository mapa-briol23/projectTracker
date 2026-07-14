import api from './axios';

function getStats() {
  return api.get('/dashboard/stats');
}

export default { getStats };
