// frontend/src/services/configuracionService.js
import api from '../api/axiosConfig';

export const configuracionService = {
    // ========== CATEGORÍAS ==========
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

    // ========== POLÍTICAS (TÍTULO) ==========
    getPoliticas: async () => {
        const response = await api.get('/admin/politicas');
        return response.data;
    },

    updatePolitica: async (titulo) => {
        const response = await api.put('/admin/politicas', { titulo });
        return response.data;
    },

    // ========== DOCUMENTO (TÉRMINOS Y CONDICIONES EN BASE64) ==========
    
    // Subir documento (convierte archivo a Base64 y lo envía)
    uploadDocumento: async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const base64 = e.target.result;
                    const response = await api.post('/admin/terminos/upload', {
                        documento: base64,
                        nombre: file.name
                    });
                    resolve(response.data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    },

    // Obtener información del documento
    getDocumentoInfo: async () => {
        const response = await api.get('/admin/terminos/info');
        return response.data;
    },

    // Obtener documento público (sin autenticación)
    getDocumentoPublico: async () => {
        const response = await api.get('/admin/terminos/publico');
        return response.data;
    },

    // Eliminar documento
    deleteDocumento: async () => {
        const response = await api.delete('/admin/terminos');
        return response.data;
    },

    // Verificar si existe documento
    existeDocumento: async () => {
        const response = await api.get('/admin/terminos/existe');
        return response.data;
    }
};