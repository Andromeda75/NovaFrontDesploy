import api from '../api/axiosConfig';

export const notificacionService = {
    // Obtener todas las notificaciones del usuario
    getNotificaciones: async () => {
        try {
            const response = await api.get('/subastas/notificaciones');
            return response.data;
        } catch (error) {
            console.error('❌ Error en getNotificaciones:', error.response?.data || error.message);
            throw error;
        }
    },

    // Marcar una notificación como leída
    marcarComoLeida: async (id) => {
        try {
            const response = await api.put(`/subastas/notificaciones/${id}/leer`);
            return response.data;
        } catch (error) {
            console.error('❌ Error en marcarComoLeida:', error.response?.data || error.message);
            throw error;
        }
    },

    // Marcar todas las notificaciones como leídas
    marcarTodasComoLeidas: async () => {
        try {
            const response = await api.put('/subastas/notificaciones/marcar-todas');
            return response.data;
        } catch (error) {
            console.error('❌ Error en marcarTodasComoLeidas:', error.response?.data || error.message);
            throw error;
        }
    },

    // Obtener información de pago de una subasta ganada
    getPagoGanador: async (subastaId) => {
        try {
            const response = await api.get(`/subastas/${subastaId}/pago`);
            return response.data;
        } catch (error) {
            console.error('❌ Error en getPagoGanador:', error.response?.data || error.message);
            throw error;
        }
    }
};