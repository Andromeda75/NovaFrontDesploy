import api from '../api/axiosConfig';

export const subastaService = {

    getSubastas: async () => {
        const response = await api.get('/subastas');
        return response.data;
    },

    getMisSubastas: async () => {
        const response = await api.get('/subastas/mis-subastas');
        return response.data;
    },

    getSubastasByUser: async (id) => {
        const response = await api.get(`/subastas/usuario/${id}`);
        return response.data;
    },

    getSubastaById: async (id) => {
        const response = await api.get(`/subastas/${id}`);
        return response.data;
    },

    crearSubasta: async (data) => {
        console.log('Enviando al backend:', data);
        const response = await api.post('/subastas', data);
        return response.data;
    },

    actualizarSubasta: async (id, data) => {
        const response = await api.put(`/subastas/${id}`, data);
        return response.data;
    },

    cambiarEstado: async (id, data) => {
        const response = await api.put(`/subastas/${id}/estado`, data);
        return response.data;
    },

    // ========== ELIMINAR SUBASTA (COMPATIBLE CON AMBAS RUTAS) ==========
    eliminarSubasta: async (id) => {
        try {
            // Primero intenta con la ruta específica
            const response = await api.delete(`/subastas/eliminar/${id}`);
            return response.data;
        } catch (error) {
            // Si falla con 404, intenta con la ruta original
            if (error.response?.status === 404) {
                const response = await api.delete(`/subastas/${id}`);
                return response.data;
            }
            // Si es otro error (403, 500, etc.), propagarlo
            throw error;
        }
    },

    // ========== NUEVOS MÉTODOS PARA APROBACIÓN/RECHAZO ==========
    aprobarSubasta: async (id) => {
        const response = await api.put(`/subastas/${id}/aprobar`);
        return response.data;
    },

    rechazarSubasta: async (id, observaciones) => {
        const response = await api.put(`/subastas/${id}/rechazar`, { observaciones });
        return response.data;
    },

    reenviarSubasta: async (id) => {
        const response = await api.put(`/subastas/${id}/reenviar`);
        return response.data;
    },

    // ========== ADMIN: OBTENER SUBASTAS PENDIENTES ==========
    getSubastasPendientesAdmin: async () => {
        const response = await api.get('/admin/subastas-pendientes');
        return response.data;
    },

    // ========== FIN NUEVOS MÉTODOS ==========

    getGanador: async (id) => {
        const response = await api.get(`/subastas/${id}/ganador`);
        return response.data;
    },

    getMetodosPago: async (id) => {
        const response = await api.get(`/subastas/${id}/metodos-pago`);
        return response.data;
    },

    validarPago: async (id, metodo_pago_id) => {
        const response = await api.post(`/subastas/${id}/validar-pago`, { metodo_pago_id });
        return response.data;
    },

    getSubastasByCategoria: async (categoriaId) => {
        const response = await api.get(`/subastas/categoria/${categoriaId}`);
        return response.data;
    },

    getArticulosByCategoria: async (categoriaId) => {
        const response = await api.get(`/subastas/articulos/categoria/${categoriaId}`);
        return response.data;
    },

    verificarSubastasVencidas: async () => {
        const response = await api.post('/subastas/verificar-vencidas');
        return response.data;
    },
};

export default subastaService;