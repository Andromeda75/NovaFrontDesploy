// services/catalogoService.js
import api from '../api/axiosConfig';

export const catalogoService = {
    // Obtener catálogos del usuario
    getMisCatalogos: async () => {
        const response = await api.get('/catalogos/mis-catalogos');
        return response.data;
    },

    getCatalogosByUser: async (id) => {
        const response = await api.get(`/catalogos/usuario/${id}`);
        return response.data;
    },

    // Obtener catálogos públicos
    getCatalogosPublicos: async () => {
        const response = await api.get('/catalogos/publicos');
        return response.data;
    },

    // Obtener catálogo por ID
    getCatalogoById: async (id) => {
        const response = await api.get(`/catalogos/${id}`);
        return response.data;
    },

    // Crear catálogo
    crearCatalogo: async (data) => {
        const response = await api.post('/catalogos', data);
        return response.data;
    },

    // Actualizar catálogo
    actualizarCatalogo: async (id, data) => {
        const response = await api.put(`/catalogos/${id}`, data);
        return response.data;
    },

    // Eliminar catálogo
    eliminarCatalogo: async (id) => {
        const response = await api.delete(`/catalogos/${id}`);
        return response.data;
    },

    // Obtener categorías
    getCategorias: async () => {
        const response = await api.get('/catalogos/categorias/listado');
        return response.data;
    }
};