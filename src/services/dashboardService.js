import api from '../api/axiosConfig';

export const dashboardService = {
    // Obtener estadísticas generales
    getEstadisticas: async () => {
        const response = await api.get('/admin/dashboard/estadisticas');
        return response.data;
    },

    // Obtener datos para la gráfica de rendimiento
    getRendimiento: async (periodo = '7dias') => {
        const response = await api.get(`/admin/dashboard/rendimiento?periodo=${periodo}`);
        return response.data;
    },

    // Obtener distribución por categorías
    getDistribucionCategorias: async () => {
        const response = await api.get('/admin/dashboard/distribucion-categorias');
        return response.data;
    },

    // Obtener total de obras
    getTotalObras: async () => {
        const response = await api.get('/admin/dashboard/total-obras');
        return response.data;
    }
};