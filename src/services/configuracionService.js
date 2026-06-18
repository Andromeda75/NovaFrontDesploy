import api from '../api/axiosConfig';

export const configuracionService = {
    // Categorías
    getCategorias: async () => {
        const response = await api.get('/admin/categorias');
        return response.data;
    },

    createCategoria: async (nombre) => {
        const response = await api.post('/admin/categorias', { nombre });
        return response.data;
    },

    updateCategoria: async (id, nombre) => {
        const response = await api.put(`/admin/categorias/${id}`, { nombre });
        return response.data;
    },

    deleteCategoria: async (id) => {
        const response = await api.delete(`/admin/categorias/${id}`);
        return response.data;
    },

    deleteAllCategorias: async () => {
        const response = await api.delete('/admin/categorias/all');
        return response.data;
    },

    // Políticas
    getPoliticas: async () => {
        const response = await api.get('/admin/politicas');
        return response.data;
    },

    updatePolitica: async (titulo) => {
        const response = await api.put('/admin/politicas', { titulo });
        return response.data;
    },

    // Documento
    uploadDocumento: async (file) => {
        const formData = new FormData();
        formData.append('documento', file);
        const response = await api.post('/admin/politicas/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getDocumentoInfo: async () => {
        const response = await api.get('/admin/politicas/documento-info');
        return response.data;
    },

    deleteDocumento: async () => {
        const response = await api.delete('/admin/politicas/documento');
        return response.data;
    }
};