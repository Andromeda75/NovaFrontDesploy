// frontend/src/services/permisosService.js
import api from '../api/axiosConfig';

export const permisosService = {
    // Obtener todos los roles
    getRoles: async () => {
        const response = await api.get('/permisos/roles');
        return response.data;
    },

    // Obtener todos los permisos
    getPermisos: async () => {
        const response = await api.get('/permisos/permisos');
        return response.data;
    },

    // Obtener permisos de un rol específico
    getPermisosByRol: async (rolId) => {
        const response = await api.get(`/permisos/roles/${rolId}/permisos`);
        return response.data;
    },

    // Asignar permiso a un rol
    asignarPermiso: async (rolId, permisoId) => {
        const response = await api.post(`/permisos/roles/${rolId}/permisos`, { permiso_id: permisoId });
        return response.data;
    },

    // Quitar permiso de un rol
    quitarPermiso: async (rolId, permisoId) => {
        const response = await api.delete(`/permisos/roles/${rolId}/permisos/${permisoId}`);
        return response.data;
    },

    // Crear nuevo permiso
    crearPermiso: async (data) => {
        const response = await api.post('/permisos/permisos', data);
        return response.data;
    },

    // Eliminar permiso
    eliminarPermiso: async (id) => {
        const response = await api.delete(`/permisos/permisos/${id}`);
        return response.data;
    },

    // Actualizar permiso
    actualizarPermiso: async (id, data) => {
        const response = await api.put(`/permisos/permisos/${id}`, data);
        return response.data;
    }
};