import api from './axios';

export const getColumns = (boardId) => api.get(`/columns/board/${boardId}`);
export const getCardsInColumn = (columnId) => api.get(`/columns/${columnId}/cards`);
export const createCard = (data) => api.post('/cards/', data);
export const updateCard = (id, data) => api.patch(`/cards/${id}`, data);
export const deleteCard = (id) => api.delete(`/cards/${id}`);
