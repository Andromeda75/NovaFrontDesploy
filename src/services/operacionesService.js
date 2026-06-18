import api from '../api/axiosConfig';

export const operacionesService = {
    // Obtener todas las transacciones (subastas, artículos, peticiones)
    getTransacciones: async (tipo = null) => {
        const url = tipo ? `/admin/transacciones?tipo=${tipo}` : '/admin/transacciones';
        const response = await api.get(url);
        return response.data;
    },

    // Obtener transacciones por tipo específico
    getTransaccionesPorTipo: async (tipo) => {
        const response = await api.get(`/admin/transacciones/${tipo}`);
        return response.data;
    },

    // Obtener depósitos y garantías
    getDepositosGarantias: async () => {
        const response = await api.get('/admin/depositos-garantias');
        return response.data;
    }
};