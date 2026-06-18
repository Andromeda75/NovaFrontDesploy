import api from '../api/axiosConfig';
  
export const favoriteService = {

    getFavorites: async () => {
        const response = await api.get('/favorite');
        return response.data;
    },
    
    // Verificar si ya esta en favoritos
    checkFavorite: async (tipo, referencia_id) => {

        const response = await api.get('/favorite/check', {
            params: {
                tipo,
                referencia_id
            }
        });

        return response.data;
    },

    // Publicar Favorita
    postFavorite: async (data) => {
        const response = await api.post('/favorite', data);
        return response.data;
    },

    deleteFavorite: async (data) => {
        const response = await api.delete('/favorite', {data});
        return response.data;
    },

};