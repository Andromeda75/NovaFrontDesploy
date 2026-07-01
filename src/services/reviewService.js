import api from '../api/axiosConfig';

export const reviewService = {

    // Obtener mis reseñas (donde soy el destinatario)
    getMyReviews: async () => {
        try {
            console.log('📡 [reviewService] Solicitando mis reseñas...');
            const response = await api.get('/review/mis-resenas');
            console.log('✅ [reviewService] Reseñas recibidas:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [reviewService] Error al obtener mis reseñas:', error);
            console.error('❌ [reviewService] Detalles:', error.response?.data);
            throw error;
        }
    },

    // Obtener reseñas de un usuario por ID
    getReviewByUser: async (id) => {
        try {
            console.log(`📡 [reviewService] Solicitando reseñas del usuario ${id}...`);
            const response = await api.get(`/review/usuario/${id}`);
            console.log(`✅ [reviewService] Reseñas del usuario ${id}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`❌ [reviewService] Error al obtener reseñas del usuario ${id}:`, error);
            throw error;
        }
    },

    // Publicar reseña
    postReview: async (data) => {
        try {
            console.log('📝 [reviewService] Creando reseña:', data);
            const response = await api.post('/review', data);
            console.log('✅ [reviewService] Reseña creada:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [reviewService] Error al crear reseña:', error);
            throw error;
        }
    },

    // Editar reseña
    putReview: async (id, data) => {
        try {
            console.log(`📝 [reviewService] Editando reseña ${id}:`, data);
            const response = await api.put(`/review/${id}`, data);
            console.log('✅ [reviewService] Reseña actualizada:', response.data);
            return response.data;
        } catch (error) {
            console.error(`❌ [reviewService] Error al editar reseña ${id}:`, error);
            throw error;
        }
    },

    // Eliminar reseña
    deleteReview: async (id) => {
        try {
            console.log(`🗑️ [reviewService] Eliminando reseña ${id}...`);
            const response = await api.delete(`/review/${id}`);
            console.log('✅ [reviewService] Reseña eliminada:', response.data);
            return response.data;
        } catch (error) {
            console.error(`❌ [reviewService] Error al eliminar reseña ${id}:`, error);
            throw error;
        }
    },

    // Obtener promedio de calificaciones de un usuario
    getPromedioByUser: async (id) => {
        try {
            console.log(`📡 [reviewService] Solicitando promedio del usuario ${id}...`);
            const response = await api.get(`/review/promedio/${id}`);
            console.log('✅ [reviewService] Promedio recibido:', response.data);
            return response.data;
        } catch (error) {
            console.error(`❌ [reviewService] Error al obtener promedio del usuario ${id}:`, error);
            console.error('❌ [reviewService] Detalles:', error.response?.data);
            throw error;
        }
    },
};