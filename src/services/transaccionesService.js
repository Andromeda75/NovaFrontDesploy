
import api from '../api/axiosConfig';

export const transaccionesService = {
    getCompras: async () => {
        const response = await api.get('/transacciones/compras');
        return response.data;
    },
    getVentas: async () => {
        const response = await api.get('/transacciones/ventas');
        return response.data;
    },
    getHistorialTickets: async () => {
        const response = await api.get('/tickets/historial');
        return response.data;
    },
    getSaldoTickets: async () => {
        const response = await api.get('/tickets/saldo');
        return response.data;
    }
};