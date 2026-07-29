// frontend/src/utils/formatters.js

/**
 * Formatea un número a 1 decimal para mostrar calificaciones
 * @param {number|string} valor - El valor a formatear
 * @returns {string} - Valor formateado con 1 decimal
 */
export const formatearCalificacion = (valor) => {
    if (valor === undefined || valor === null || isNaN(valor)) return '0.0';
    return Number(valor).toFixed(1);
};

/**
 * Formatea un precio en moneda MXN
 * @param {number} precio - El precio a formatear
 * @returns {string} - Precio formateado en MXN
 */
export const formatearPrecio = (precio) => {
    if (precio == null || isNaN(precio)) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(precio);
};

/**
 * Formatea una fecha a formato local
 * @param {string|Date} fecha - La fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Obtiene iniciales de un nombre
 * @param {string} nombre - El nombre completo
 * @returns {string} - Iniciales en mayúsculas
 */
export const getInitials = (nombre) => {
    if (!nombre) return '?';
    const nombres = nombre.split(' ');
    if (nombres.length === 1) return nombres[0].charAt(0).toUpperCase();
    return (nombres[0].charAt(0) + nombres[nombres.length - 1].charAt(0)).toUpperCase();
};