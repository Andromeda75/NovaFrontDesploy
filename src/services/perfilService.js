import api from '../api/axiosConfig';

export const perfilService = {

    // Obtener a todos los usuarios
    getUsers: async () => {
        const response = await api.get('/usuarios');
        return response.data;
    },

    // Obtener perfil del usuario autenticado
    getPerfil: async () => {
        const response = await api.get('/usuarios/perfil');
        return response.data;
    },

    // Obtener perfil público de cualquier usuario por ID
    getPerfilPublico: async (id) => {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    },

    // Actualizar perfil del usuario autenticado
    // Recibe: { nombre_completo, ubicacion, direccion, interes, descripcion, 
    //           instagram_handle, twitter_handle, facebook_handle, telefono }
    updatePerfil: async (data) => {
        const response = await api.put('/usuarios/perfil', data);
        return response.data;
    },

    // Obtener estadísticas del usuario (tickets, subastas, artículos, catálogos)
    getEstadisticas: async () => {
        const response = await api.get('/usuarios/estadisticas');
        return response.data;
    },

    // Obtener ingresos por período (7dias, 14dias, 30dias, mes)
    getIngresos: async (periodo = '7dias') => {
        const response = await api.get(`/usuarios/ingresos?periodo=${periodo}`);
        return response.data;
    },

    // Obtener ventas por período
    getVentas: async (periodo = '7dias') => {
        const response = await api.get(`/usuarios/ventas?periodo=${periodo}`);
        return response.data;
    },

    // Obtener métodos de pago del usuario
    getMetodosPago: async () => {
        const response = await api.get('/usuarios/metodos-pago');
        return response.data;
    },

    // Agregar nuevo método de pago
    // Recibe: { nombre_titular, numero_tarjeta, fecha_expiracion, cvc, es_principal }
    addMetodoPago: async (data) => {
        const response = await api.post('/usuarios/metodos-pago', data);
        return response.data;
    },

    // Eliminar método de pago por ID
    deleteMetodoPago: async (id) => {
        const response = await api.delete(`/usuarios/metodos-pago/${id}`);
        return response.data;
    },

    // Cambiar email del usuario (requiere contraseña actual)
    // Recibe: { nuevo_email, contrasena_actual }
    cambiarEmail: async (data) => {
        const response = await api.put('/usuarios/cambiar-email', data);
        return response.data;
    },

    // Cambiar contraseña del usuario (requiere contraseña actual)
    // Recibe: { contrasena_actual, nueva_contrasena }
    cambiarPassword: async (data) => {
        const response = await api.put('/usuarios/cambiar-password', data);
        return response.data;
    }
};