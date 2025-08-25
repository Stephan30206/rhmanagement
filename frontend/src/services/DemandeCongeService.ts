import api from './api';

export const DemandeCongeService = {
    getAll: () => api.get('/demandes-conge'),
    getById: (id: number) => api.get(`/demandes-conge/${id}`),
    create: (data: any) => api.post('/demandes-conge', data),
    update: (id: number, data: any) => api.put(`/demandes-conge/${id}`, data),
    delete: (id: number) => api.delete(`/demandes-conge/${id}`),
    getByEmployeId: (employeId: number) => api.get(`/demandes-conge/employe/${employeId}`),
};