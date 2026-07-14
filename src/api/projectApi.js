import api from './axios';

function getAll(params) {
  return api.get('/projects', { params });
}

function getById(id) {
  return api.get(`/projects/${id}`);
}

function create(data) {
  return api.post('/projects', data);
}

function update(id, data) {
  return api.put(`/projects/${id}`, data);
}

function remove(id) {
  return api.delete(`/projects/${id}`);
}

export default { getAll, getById, create, update, remove };
