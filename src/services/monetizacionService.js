import api from '../api/axiosConfig';

export const monetizacionService = {
    // Obtener configuración de comisión
    getComision: async () => {
        const response = await api.get('/admin/comision');
        return response.data;
    },

    // Actualizar comisión
    updateComision: async (porcentaje) => {
        const response = await api.put('/admin/comision', { porcentaje });
        return response.data;
    },

    // Obtener todas las publicidades
    getPublicidades: async () => {
        const response = await api.get('/admin/publicidades');
        return response.data;
    },

    // Obtener todas las publicidades
    getPublicidadPublica: async () => {
        const response = await api.get('/admin/publicidad/public');
        return response.data;
    },

    // Crear publicidad (con imagen)
    createPublicidad: async (data) => {
        const formData = new FormData();
        formData.append('nombre', data.nombre);
        formData.append('fechaInicio', data.fechaInicio);
        formData.append('fechaFin', data.fechaFin);
        formData.append('precio', data.precio);
        if (data.imagen && data.imagen instanceof File) {
            formData.append('imagen', data.imagen);
        } else if (data.imagen && typeof data.imagen === 'string' && data.imagen.startsWith('data:')) {
            // Convertir base64 a File
            const blob = await fetch(data.imagen).then(r => r.blob());
            formData.append('imagen', blob, 'banner.jpg');
        }
        
        const response = await api.post('/admin/publicidades', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Actualizar publicidad (con imagen)
    updatePublicidad: async (id, data) => {
        const formData = new FormData();
        formData.append('nombre', data.nombre);
        formData.append('fechaInicio', data.fechaInicio);
        formData.append('fechaFin', data.fechaFin);
        formData.append('precio', data.precio);
        formData.append('imagenActual', data.imagenActual || '');
        
        if (data.imagen && data.imagen instanceof File) {
            formData.append('imagen', data.imagen);
        } else if (data.imagen && typeof data.imagen === 'string' && data.imagen.startsWith('data:')) {
            const blob = await fetch(data.imagen).then(r => r.blob());
            formData.append('imagen', blob, 'banner.jpg');
        }
        
        const response = await api.put(`/admin/publicidades/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Eliminar publicidad
    deletePublicidad: async (id) => {
        const response = await api.delete(`/admin/publicidades/${id}`);
        return response.data;
    },

    // Obtener ingresos totales
    getIngresos: async () => {
        const response = await api.get('/admin/ingresos');
        return response.data;
    }
};