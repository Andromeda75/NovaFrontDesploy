import api from '../api/axiosConfig';

export const ticketsAdminService = {
    // Obtener todos los paquetes de tickets
    getPaquetes: async () => {
        const response = await api.get('/admin/paquetes-tickets');
        return response.data;
    },

    // Crear nuevo paquete
    createPaquete: async (data) => {
        const response = await api.post('/admin/paquetes-tickets', data);
        return response.data;
    },

    // Actualizar paquete
    updatePaquete: async (id, data) => {
        const response = await api.put(`/admin/paquetes-tickets/${id}`, data);
        return response.data;
    },

    // Eliminar paquete
    deletePaquete: async (id) => {
        const response = await api.delete(`/admin/paquetes-tickets/${id}`);
        return response.data;
    },

    // Obtener reglas de consumo
    getReglasConsumo: async () => {
        const response = await api.get('/admin/reglas-consumo');
        return response.data;
    },

    // Actualizar regla de consumo
    updateReglaConsumo: async (id, costo) => {
        const response = await api.put(`/admin/reglas-consumo/${id}`, { costo_tickets: costo });
        return response.data;
    },

    // Obtener ingresos por tickets
    getIngresosTickets: async () => {
        const response = await api.get('/admin/ingresos-tickets');
        return response.data;
    }
};