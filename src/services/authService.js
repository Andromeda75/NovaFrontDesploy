import api from '../api/axiosConfig';

export const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
            localStorage.setItem('rol_id', response.data.usuario.rol_id);
            localStorage.setItem('user_id', response.data.usuario.id);
        }
        return response.data;
    },

    login: async (email, contrasena) => {
        const response = await api.post('/auth/login', { email, contrasena });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
            localStorage.setItem('rol_id', response.data.usuario.rol_id);
            localStorage.setItem('user_id', response.data.usuario.id);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('rol_id');
        localStorage.removeItem('user_id');
    },

    getCurrentUser: () => {
        const usuario = localStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) : null;
    },

    getCurrentRol: () => {
        return localStorage.getItem('rol_id');
    },

    getCurrentUserId: () => {
        return localStorage.getItem('user_id');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    isAdmin: () => {
        return localStorage.getItem('rol_id') === '1';
    },

    getPendientes: async () => {
        const response = await api.get('/auth/pendientes');
        return response.data;
    },
};