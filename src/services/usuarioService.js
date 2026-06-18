import api from '../api/axiosConfig';

export const usuarioService = {
    // Obtener perfil propio
    getPerfil: async () => {
        const response = await api.get('/usuarios/perfil');
        return response.data;
    },

    updatePerfil: async (data) => {
        const response = await api.put('/usuarios/perfil', data);
        return response.data;
    },

    getPerfilPublico: async (id) => {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    },

    getStats: async (id) => {
        const response = await api.get(`/usuarios/${id}/stats`);
        return response.data;
    }
};