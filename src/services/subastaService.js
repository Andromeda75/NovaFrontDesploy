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

    // Cambiar Estado de la Subasta (método antiguo - compatibilidad)
    cambiarEstado: async (id, data) => {
        const response = await api.put(`/subastas/${id}/estado`, data);
        return response.data;
    },

    eliminarSubasta: async (id) => {
        const response = await api.delete(`/subastas/${id}`);
        return response.data;
    },

    // ========== NUEVOS MÉTODOS PARA APROBACIÓN/RECHAZO ==========

    // ADMIN: Aprobar subasta (estado 8 - Activa)
    aprobarSubasta: async (id) => {
        const response = await api.put(`/subastas/${id}/aprobar`);
        return response.data;
    },

    // ADMIN: Rechazar subasta con observaciones (estado 10 - Rechazada)
    rechazarSubasta: async (id, observaciones) => {
        const response = await api.put(`/subastas/${id}/rechazar`, { observaciones });
        return response.data;
    },

    // USUARIO: Reenviar subasta rechazada (estado 10 → 7)
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

    // Obtener información del ganador
    getGanador: async (id) => {
        const response = await api.get(`/subastas/${id}/ganador`);
        return response.data;
    },

    // Obtener métodos de pago del usuario
    getMetodosPago: async (id) => {
        const response = await api.get(`/subastas/${id}/metodos-pago`);
        return response.data;
    },

    // Validar pago de subasta
    validarPago: async (id, metodo_pago_id) => {
        const response = await api.post(`/subastas/${id}/validar-pago`, { metodo_pago_id });
        return response.data;
    },

    // Obtener subastas por categoría
    getSubastasByCategoria: async (categoriaId) => {
        const response = await api.get(`/subastas/categoria/${categoriaId}`);
        return response.data;
    },

    // Obtener artículos por categoría
    getArticulosByCategoria: async (categoriaId) => {
        const response = await api.get(`/subastas/articulos/categoria/${categoriaId}`);
        return response.data;
    },

    // ========== NUEVO: Verificar y finalizar subastas vencidas (ADMIN) ==========
    verificarSubastasVencidas: async () => {
        const response = await api.post('/subastas/verificar-vencidas');
        return response.data;
    },
};

export default subastaService;