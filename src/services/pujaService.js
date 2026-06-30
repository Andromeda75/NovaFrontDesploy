import api from '../api/axiosConfig';

export const pujaService = {
    // Realizar una puja
    realizarPuja: async (subastaId, monto) => {
        const response = await api.post(`/subastas/${subastaId}/pujar`, { monto });
        return response.data;
    },

    // Obtener historial de pujas de una subasta
    getHistorialPujas: async (subastaId) => {
        const response = await api.get(`/subastas/${subastaId}/pujas`);
        return response.data;
    }
};