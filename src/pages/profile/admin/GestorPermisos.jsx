// src/pages/profile/admin/GestorPermisos.jsx
import React, { useState, useEffect } from 'react';
import { Button, Form, Table, Modal, Alert, Badge, Spinner } from 'react-bootstrap';
import { permisosService } from '../../../services/permisosService';
import { authService } from '../../../services/authService';

const GestorPermisos = () => {
    const [roles, setRoles] = useState([]);
    const [permisos, setPermisos] = useState([]);
    const [permisosPorRol, setPermisosPorRol] = useState({});
    const [rolSeleccionado, setRolSeleccionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showModalPermiso, setShowModalPermiso] = useState(false);
    const [mensaje, setMensaje] = useState({ show: false, type: '', text: '' });
    const [nuevoPermiso, setNuevoPermiso] = useState({
        clave: '',
        nombre: '',
        descripcion: '',
        modulo: ''
    });

    // Cargar datos al montar
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [rolesData, permisosData] = await Promise.all([
                permisosService.getRoles(),
                permisosService.getPermisos()
            ]);

            if (rolesData.success) setRoles(rolesData.roles);
            if (permisosData.success) setPermisos(permisosData.permisos);

            // Cargar permisos de cada rol
            const permisosMap = {};
            for (const rol of rolesData.roles) {
                const data = await permisosService.getPermisosByRol(rol.id_rol);
                if (data.success) {
                    permisosMap[rol.id_rol] = data.permisos.filter(p => p.tiene_permiso === 1);
                }
            }
            setPermisosPorRol(permisosMap);

            if (rolesData.roles.length > 0) {
                setRolSeleccionado(rolesData.roles[0].id_rol);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            mostrarMensaje('error', 'Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const mostrarMensaje = (type, text) => {
        setMensaje({ show: true, type, text });
        setTimeout(() => setMensaje({ show: false, type: '', text: '' }), 4000);
    };

    const handleAsignarPermiso = async (rolId, permisoId) => {
        try {
            const response = await permisosService.asignarPermiso(rolId, permisoId);
            if (response.success) {
                mostrarMensaje('success', 'Permiso asignado correctamente');
                await cargarDatos();
            }
        } catch (error) {
            console.error('Error asignando permiso:', error);
            mostrarMensaje('error', error.response?.data?.message || 'Error al asignar permiso');
        }
    };

    const handleQuitarPermiso = async (rolId, permisoId) => {
        try {
            const response = await permisosService.quitarPermiso(rolId, permisoId);
            if (response.success) {
                mostrarMensaje('success', 'Permiso removido correctamente');
                await cargarDatos();
            }
        } catch (error) {
            console.error('Error quitando permiso:', error);
            mostrarMensaje('error', error.response?.data?.message || 'Error al quitar permiso');
        }
    };

    const handleCrearPermiso = async () => {
        if (!nuevoPermiso.clave || !nuevoPermiso.nombre) {
            mostrarMensaje('error', 'Clave y nombre son obligatorios');
            return;
        }

        try {
            const response = await permisosService.crearPermiso(nuevoPermiso);
            if (response.success) {
                mostrarMensaje('success', 'Permiso creado correctamente');
                setShowModalPermiso(false);
                setNuevoPermiso({ clave: '', nombre: '', descripcion: '', modulo: '' });
                await cargarDatos();
            }
        } catch (error) {
            console.error('Error creando permiso:', error);
            mostrarMensaje('error', error.response?.data?.message || 'Error al crear permiso');
        }
    };

    const getPermisosByModulo = () => {
        const modulos = {};
        permisos.forEach(p => {
            const modulo = p.modulo || 'General';
            if (!modulos[modulo]) modulos[modulo] = [];
            modulos[modulo].push(p);
        });
        return modulos;
    };

    const getRolesColors = () => {
        const colors = {
            1: { bg: '#dc3545', text: 'white', label: 'Admin' },
            2: { bg: '#6c757d', text: 'white', label: 'Usuario' },
            3: { bg: '#ffc107', text: 'dark', label: 'Artista' },
            4: { bg: '#0dcaf0', text: 'dark', label: 'Moderador' }
        };
        return colors;
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div className="container-fluid p-0 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="fw-bold color-1 mb-0" style={{ fontSize: '28px' }}>
                        <i className="bi bi-shield-check me-2"></i>
                        Gestor de Permisos
                    </h1>
                    <p className="text-muted color-2" style={{ fontSize: '18px' }}>
                        Administra los permisos de cada rol en el sistema
                    </p>
                </div>
                <button
                    className="btn-linear-gradient py-2 px-4"
                    style={{ borderRadius: '8px' }}
                    onClick={() => setShowModalPermiso(true)}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    Nuevo Permiso
                </button>
            </div>

            {mensaje.show && (
                <Alert variant={mensaje.type} dismissible onClose={() => setMensaje({ show: false, type: '', text: '' })}>
                    {mensaje.text}
                </Alert>
            )}

            <div className="row g-4">
                {/* Selector de Rol */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '15px' }}>
                        <div className="d-flex flex-wrap gap-3">
                            <label className="fw-bold color-2 me-2 align-self-center">Seleccionar Rol:</label>
                            {roles.map(rol => {
                                const colors = getRolesColors();
                                const color = colors[rol.id_rol] || { bg: '#6c757d', text: 'white' };
                                return (
                                    <button
                                        key={rol.id_rol}
                                        className={`btn rounded-pill px-4 py-2 fw-bold ${rolSeleccionado === rol.id_rol ? 'shadow' : ''}`}
                                        style={{
                                            backgroundColor: rolSeleccionado === rol.id_rol ? color.bg : '#f0f0f0',
                                            color: rolSeleccionado === rol.id_rol ? color.text : '#333',
                                            border: `2px solid ${color.bg}`
                                        }}
                                        onClick={() => setRolSeleccionado(rol.id_rol)}
                                    >
                                        <i className={`bi ${rol.id_rol === 1 ? 'bi-shield-lock' : 
                                                          rol.id_rol === 3 ? 'bi-palette' : 
                                                          rol.id_rol === 4 ? 'bi-shield' : 'bi-person'} me-2`}></i>
                                        {rol.rol}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Permisos del Rol Seleccionado */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px' }}>
                        <h4 className="fw-bold color-2 mb-3">
                            Permisos del Rol
                            {rolSeleccionado && (
                                <Badge className="ms-2" style={{ 
                                    backgroundColor: getRolesColors()[rolSeleccionado]?.bg || '#6c757d',
                                    color: getRolesColors()[rolSeleccionado]?.text || 'white',
                                    fontSize: '14px'
                                }}>
                                    {roles.find(r => r.id_rol === rolSeleccionado)?.rol || 'Rol'}
                                </Badge>
                            )}
                        </h4>

                        {rolSeleccionado && (
                            <div className="table-responsive">
                                <Table hover>
                                    <thead className="bg-color-2 text-white">
                                        <tr>
                                            <th>Permiso</th>
                                            <th>Clave</th>
                                            <th>Módulo</th>
                                            <th className="text-center">Estado</th>
                                            <th className="text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {permisos.map(permiso => {
                                            const tiene = permisosPorRol[rolSeleccionado]?.some(p => p.id_permiso === permiso.id_permiso) || false;
                                            return (
                                                <tr key={permiso.id_permiso}>
                                                    <td>
                                                        <strong>{permiso.nombre}</strong>
                                                        <br />
                                                        <small className="text-muted">{permiso.descripcion}</small>
                                                    </td>
                                                    <td><code className="bg-light p-1 rounded">{permiso.clave}</code></td>
                                                    <td>
                                                        <Badge bg="secondary">{permiso.modulo || 'General'}</Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge bg={tiene ? 'success' : 'danger'}>
                                                            {tiene ? '✅ Activo' : '❌ Inactivo'}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        {tiene ? (
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                className="rounded-pill"
                                                                onClick={() => handleQuitarPermiso(rolSeleccionado, permiso.id_permiso)}
                                                            >
                                                                <i className="bi bi-x-circle me-1"></i>
                                                                Quitar
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                className="rounded-pill"
                                                                onClick={() => handleAsignarPermiso(rolSeleccionado, permiso.id_permiso)}
                                                            >
                                                                <i className="bi bi-check-circle me-1"></i>
                                                                Asignar
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Resumen de Permisos por Módulo */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px' }}>
                        <h4 className="fw-bold color-2 mb-3">
                            <i className="bi bi-folder me-2"></i>
                            Permisos por Módulo
                        </h4>
                        {Object.entries(getPermisosByModulo()).map(([modulo, lista]) => (
                            <div key={modulo} className="mb-3">
                                <h6 className="fw-bold color-1">{modulo}</h6>
                                <div className="d-flex flex-wrap gap-1">
                                    {lista.map(p => (
                                        <Badge 
                                            key={p.id_permiso} 
                                            bg="secondary" 
                                            className="me-1 mb-1"
                                            style={{ fontSize: '10px' }}
                                        >
                                            {p.nombre}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="card border-0 shadow-sm p-4 mt-4" style={{ borderRadius: '20px' }}>
                        <h4 className="fw-bold color-2 mb-3">
                            <i className="bi bi-info-circle me-2"></i>
                            Resumen
                        </h4>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Total de Roles:</span>
                            <strong>{roles.length}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Total de Permisos:</span>
                            <strong>{permisos.length}</strong>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>Asignaciones:</span>
                            <strong>
                                {Object.values(permisosPorRol).reduce((acc, arr) => acc + arr.length, 0)}
                            </strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para crear permiso */}
            <Modal show={showModalPermiso} onHide={() => setShowModalPermiso(false)} centered>
                <div className="p-4 text-center text-white" style={{ background: 'linear-gradient(to right, #2a140a, #8d4925)' }}>
                    <i className="bi bi-plus-circle fs-1 mb-2"></i>
                    <h4 className="fw-bold mb-0">Nuevo Permiso</h4>
                </div>
                <Modal.Body className="p-4">
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Clave *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: usuarios.eliminar"
                                value={nuevoPermiso.clave}
                                onChange={(e) => setNuevoPermiso({ ...nuevoPermiso, clave: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Nombre *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: Eliminar Usuarios"
                                value={nuevoPermiso.nombre}
                                onChange={(e) => setNuevoPermiso({ ...nuevoPermiso, nombre: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Descripción del permiso..."
                                value={nuevoPermiso.descripcion}
                                onChange={(e) => setNuevoPermiso({ ...nuevoPermiso, descripcion: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Módulo</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: Usuarios"
                                value={nuevoPermiso.modulo}
                                onChange={(e) => setNuevoPermiso({ ...nuevoPermiso, modulo: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => setShowModalPermiso(false)}>
                        Cancelar
                    </Button>
                    <Button
                        style={{ backgroundColor: '#8d4925', border: 'none' }}
                        onClick={handleCrearPermiso}
                    >
                        <i className="bi bi-check2 me-2"></i>
                        Crear Permiso
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default GestorPermisos;