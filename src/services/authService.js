import api from '../api/axiosConfig';

export const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            const usuarioData = {
                ...response.data.usuario,
                terminos_aceptados: response.data.usuario?.terminos_aceptados || false
            };
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('usuario', JSON.stringify(usuarioData));
            localStorage.setItem('rol_id', response.data.usuario.rol_id);
            localStorage.setItem('user_id', response.data.usuario.id);
        }
        return response.data;
    },

    login: async (email, contrasena) => {
        const response = await api.post('/auth/login', { email, contrasena });
        if (response.data.token) {
            const usuarioData = {
                ...response.data.usuario,
                terminos_aceptados: response.data.usuario?.terminos_aceptados || false
            };
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('usuario', JSON.stringify(usuarioData));
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

    validarClave: async (clave) => {
        const response = await api.post('/auth/validar-clave', { clave });
        
        // Si el servidor devuelve un usuario actualizado, actualizar localStorage
        if (response.data.success && response.data.usuario) {
            // Actualizar el usuario en localStorage
            const currentUser = JSON.parse(localStorage.getItem('usuario') || '{}');
            const updatedUser = {
                ...currentUser,
                ...response.data.usuario,
                rol_id: response.data.rol_id,
                rol_nombre: response.data.rol_nombre
            };
            localStorage.setItem('usuario', JSON.stringify(updatedUser));
            localStorage.setItem('rol_id', String(response.data.rol_id));
        }
        
        return response.data;
    },

    /**
     * Obtener el rol actual del usuario autenticado
     * @returns {Promise} - { rol_id, rol_nombre }
     */
    getMiRol: async () => {
        const response = await api.get('/auth/mi-rol');
        return response.data;
    },

    /**
     * Obtener lista de claves disponibles (solo admin)
     * @returns {Promise} - Lista de claves y sus roles
     */
    getClavesDisponibles: async () => {
        const response = await api.get('/auth/claves-disponibles');
        return response.data;
    },

    /**
     * Verificar si el usuario tiene un rol específico
     * @param {number|string} rolId - ID del rol a verificar
     * @returns {boolean}
     */
    tieneRol: (rolId) => {
        const userRol = localStorage.getItem('rol_id');
        return String(userRol) === String(rolId);
    },

    /**
     * Verificar si el usuario puede realizar una acción específica
     * @param {string} accion - 'crear_subasta', 'crear_articulo', 'admin_panel', etc.
     * @returns {boolean}
     */
    puede: (accion) => {
        const rol = localStorage.getItem('rol_id');
        
        const permisos = {
            // Admin (1) tiene todos los permisos
            'admin_panel': rol === '1',
            'ver_verificaciones': rol === '1' || rol === '4',
            
            // Artista (3) y Admin (1) pueden crear
            'crear_subasta': rol === '1' || rol === '3',
            'crear_articulo': rol === '1' || rol === '3',
            'crear_catalogo': rol === '1' || rol === '3',
            'crear_peticion': true, // Todos pueden crear peticiones
            
            // Moderador (4) y Admin (1) pueden moderar
            'moderar_contenido': rol === '1' || rol === '4',
        };
        
        return permisos[accion] || false;
    },

    // ========== MÉTODOS PARA TÉRMINOS ==========

    aceptarTerminos: async () => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await api.post(
                '/usuarios/aceptar-terminos',
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // ✅ SIEMPRE actualizar localStorage
            const currentUser = JSON.parse(localStorage.getItem('usuario'));
            if (currentUser) {
                currentUser.terminos_aceptados = true;
                localStorage.setItem('usuario', JSON.stringify(currentUser));
            }
            
            return response.data;
        } catch (error) {
            console.error('Error al aceptar términos:', error);
            
            // ✅ Si el backend dice que ya aceptó, igual actualizar
            if (error.response?.data?.message === 'Ya has aceptado los términos y condiciones anteriormente') {
                const currentUser = JSON.parse(localStorage.getItem('usuario'));
                if (currentUser) {
                    currentUser.terminos_aceptados = true;
                    localStorage.setItem('usuario', JSON.stringify(currentUser));
                }
            }
            
            throw error;
        }
    },

    terminosAceptados: () => {
        try {
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            // ✅ Comparar con true o 1
            return usuario?.terminos_aceptados === true || usuario?.terminos_aceptados === 1;
        } catch {
            return false;
        }
    },

    getCurrentUserCompleto: () => {
        try {
            const usuario = localStorage.getItem('usuario');
            const token = localStorage.getItem('token');
            const rol_id = localStorage.getItem('rol_id');
            const user_id = localStorage.getItem('user_id');
            
            if (usuario) {
                const userData = JSON.parse(usuario);
                return {
                    ...userData,
                    token,
                    rol_id,
                    user_id,
                    terminos_aceptados: userData?.terminos_aceptados === true || userData?.terminos_aceptados === 1
                };
            }
            return null;
        } catch {
            return null;
        }
    },

    actualizarUsuario: (usuarioData) => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('usuario'));
            const updatedUser = { ...currentUser, ...usuarioData };
            localStorage.setItem('usuario', JSON.stringify(updatedUser));
            if (usuarioData.rol_id) {
                localStorage.setItem('rol_id', usuarioData.rol_id);
            }
            if (usuarioData.id) {
                localStorage.setItem('user_id', usuarioData.id);
            }
            return updatedUser;
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            return null;
        }
    }
};

export default authService;
