import api from '../api/axiosConfig';

export const peticionesService = {

    // Obtener Peticiones
    getPeticiones: async () => {
        const response = await api.get('/peticiones/publicas');
        return response.data;
    },

    // Obtener Peticiones de Todos
    getPeticionesAll: async () => {
        const response = await api.get('/peticiones/todos');
        return response.data;
    },

    // Obtener artículo por ID
    getPeticionesById: async (id) => {
        const response = await api.get(`/peticiones/${id}`);
        return response.data;
    },

    // Obtener mis propias peticiones (requiere auth)
    getMisPeticiones: async () => {
        const response = await api.get('/peticiones/mis-peticiones');
        return response.data;
    },

    // Publicar Peticiones
    postPeticiones: async (data) => {
        const response = await api.post('/peticiones', data);
        return response.data;
    },

    // Actualizar petición
    putPeticion: async (id, data) => {
        const response = await api.put(`/peticiones/${id}`, data);
        return response.data;
    },

    cambiarEstado: async (id, estado) => {
        const response = await api.put(`/peticiones/${id}/estado`, { estado });
        return response.data;
    },


    // Eliminar petición
    deletePeticion: async (id) => {
        const response = await api.delete(`/peticiones/${id}`);
        return response.data;
    },

}