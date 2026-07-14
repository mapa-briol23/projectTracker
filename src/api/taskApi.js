import api from './axios';

function getByProject(projectId) {
  return api.get(`/tasks/project/${projectId}`);
}

function create(projectId, data) {
  return api.post(`/tasks/project/${projectId}`, data);
}

function update(id, data) {
  return api.put(`/tasks/${id}`, data);
}

function remove(id) {
  return api.delete(`/tasks/${id}`);
}

export default { getByProject, create, update, remove };
