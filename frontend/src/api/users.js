import api from './axios';

export const getUsers = () => api.get('/users/');
export const updateUserRole = (userId, role) => api.put(`/users/${userId}/role`, { role });
export const deleteUser = (userId) => api.delete(`/users/${userId}`);
