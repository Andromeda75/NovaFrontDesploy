import api from '../api/axiosConfig';

export const notificacionService = {
    // Obtener todas las notificaciones del usuario
    getNotificaciones: async () => {
        const response = await api.get('/subastas/notificaciones');
        return response.data;
    },

    // Marcar una notificación como leída
    marcarComoLeida: async (id) => {
        const response = await api.put(`/subastas/notificaciones/${id}/leer`);
        return response.data;
    },

    // Marcar todas las notificaciones como leídas
    marcarTodasComoLeidas: async () => {
        const response = await api.put('/subastas/notificaciones/marcar-todas');
        return response.data;
    },

    // Obtener información de pago de una subasta ganada
    getPagoGanador: async (subastaId) => {
        const response = await api.get(`/subastas/${subastaId}/pago`);
        return response.data;
    }
};