import api from '../api/axiosConfig';

export const articuloService = {

    // Obtener artículos por Revisar
    getArticulosAll: async () => {
        const response = await api.get('/articulos');
        return response.data;
    },

    // Obtener mis artículos
    getMisArticulos: async () => {
        const response = await api.get('/articulos/mis-articulos');
        return response.data;
    },

    getArticulosByUser: async (id) => {
        const response = await api.get(`/articulos/usuario/${id}`);
        return response.data;
    },

    // Obtener artículo por ID
    getArticuloById: async (id) => {
        const response = await api.get(`/articulos/${id}`);
        return response.data;
    },

    // Crear artículo (envía Base64 directamente en JSON)
    crearArticulo: async (data) => {
        const response = await api.post('/articulos', {
            titulo: data.titulo,
            categoria_id: data.categoria_id,
            descripcion: data.descripcion,
            precio_mxn: data.precio_mxn,
            imagenes: data.imagenes,
            video: data.video,
            documento: data.documento
        });
        return response.data;
    },

    // Actualizar artículo
    actualizarArticulo: async (id, data) => {
        const response = await api.put(`/articulos/${id}`, {
            titulo: data.titulo,
            categoria_id: data.categoria_id,
            descripcion: data.descripcion,
            precio_mxn: data.precio_mxn,
            imagenes: data.imagenes,
            video: data.video,
            documento: data.documento
        });
        return response.data;
    },

    // Cambiar Estado del Articulo
    cambiarEstado: async (id, data) => {
        const response = await api.put(`/articulos/${id}/estado`, data);
        return response.data;
    },

    // Eliminar artículo
    eliminarArticulo: async (id) => {
        const response = await api.delete(`/articulos/${id}`);
        return response.data;
    },

    // Comprar artículo
    comprarArticulo: async (id, metodo_pago_id) => {
        const response = await api.post(`/articulos/${id}/comprar`, { metodo_pago_id });
        return response.data;
    },

    // Obtener métodos de pago
    getMetodosPago: async () => {
        const response = await api.get('/articulos/metodos-pago');
        return response.data;
    }
};