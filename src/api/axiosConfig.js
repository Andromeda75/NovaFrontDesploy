import axios from 'axios';

// Configuración base de la API
const API_URL = process.env.REACT_APP_API_URL || 'https://novabackdesploy-1.onrender.com/api';

// Crear instancia de axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 30000 // 30 segundos
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Enviar en ambos formatos para compatibilidad
            config.headers['x-auth-token'] = token;
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        console.log(`📤 ${config.method.toUpperCase()} ${config.url}`, config.data || '');
        return config;
    },
    (error) => {
        console.error('❌ Error en interceptor de request:', error);
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
    (response) => {
        console.log(`📥 ${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
        return response;
    },
    (error) => {
        console.error('❌ Error en respuesta:', error.response?.status, error.response?.data || error.message);
        
        // Si el token expiró o es inválido
        if (error.response?.status === 401) {
            console.log('🔑 Token inválido o expirado, redirigiendo a login...');
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            // Redirigir a login si estamos en el navegador
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;