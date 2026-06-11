import api from './axios';

export const getBoards = () => api.get('/boards/');
export const getBoard = (id) => api.get(`/boards/${id}`);
export const createBoard = (data) => api.post('/boards/', data);
export const updateBoard = (id, data) => api.patch(`/boards/${id}`, data);
export const deleteBoard = (id) => api.delete(`/boards/${id}`);
