import api from '../api/axiosConfig';

export const reviewService = {

    // Obtener mis reseñas (donde soy el destinatario)
    getMyReviews: async () => {
        const response = await api.get('/review/mis-resenas');
        return response.data;
    },

    // Obtener reseñas de un usuario por ID
    getReviewByUser: async (id) => {
        const response = await api.get(`/review/usuario/${id}`);
        return response.data;
    },

    // Publicar reseña
    postReview: async (data) => {
        const response = await api.post('/review', data);
        return response.data;
    },

    // Editar reseña
    putReview: async (id, data) => {
        const response = await api.put(`/review/${id}`, data);
        return response.data;
    },

    // Eliminar reseña
    deleteReview: async (id) => {
        const response = await api.delete(`/review/${id}`);
        return response.data;
    },

     // Obtener promedio de calificaciones de un usuario
    getPromedioByUser: async (id) => {
        const response = await api.get(`/review/promedio/${id}`);
        return response.data;
    },

    
};