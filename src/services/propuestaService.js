import api from '../api/axiosConfig';
  
export const propuestaService = {

    // Obtener mis propias peticiones
    getOtrasPropuestas: async () => {
        const response = await api.get('/propuesta/otras-propuestas');
        return response.data;
    },

    // Obtener mis propias peticiones
    getMisPropuestas: async () => {
        const response = await api.get('/propuesta/mis-propuestas');
        return response.data;
    },

    // Publicar Favorita
    postPropuesta: async (data) => {
        const response = await api.post('/propuesta', data);
        return response.data;
    },

    cambiarEstado: async (id, estado) => {
        const response = await api.put(`/propuesta/${id}/estado`, { estado });
        return response.data;
    },

};