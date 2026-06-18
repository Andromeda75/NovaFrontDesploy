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

    // Cambiar Estado de la Subasta
    cambiarEstado: async (id, data) => {
        const response = await api.put(`/subastas/${id}/estado`, data);
        return response.data;
    },

    eliminarSubasta: async (id) => {
        const response = await api.delete(`/subastas/${id}`);
        return response.data;
    },

    // ========== NUEVOS MÉTODOS AGREGADOS ==========

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

    
};