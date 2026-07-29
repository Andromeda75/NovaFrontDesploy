// src/pages/profile/admin/ClaveXRol.jsx
import { useState, useEffect } from 'react';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';  // ← SIN Modal
import { authService } from '../../../services/authService';  // ← RUTA CORRECTA
import { useNavigate } from 'react-router-dom';

const ClaveXRol = () => {  // ← SIN props (show, onHide, etc.)
    const [clave, setClave] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [rolAsignado, setRolAsignado] = useState(null);
    const [rolActual, setRolActual] = useState(null);
    const navigate = useNavigate();

    // Cargar rol actual
    useEffect(() => {
        const cargarRol = async () => {
            try {
                const rolData = await authService.getMiRol();
                setRolActual(rolData);
            } catch (error) {
                console.error('Error cargando rol:', error);
            }
        };
        cargarRol();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!clave.trim()) {
            setError('Por favor, ingresa una clave');
            setLoading(false);
            return;
        }

        try {
            const response = await authService.validarClave(clave);
            
            if (response.success) {
                setSuccess(response.message);
                setRolAsignado({
                    rol_id: response.rol_id,
                    rol_nombre: response.rol_nombre
                });

                // Disparar evento para actualizar otros componentes
                window.dispatchEvent(new CustomEvent('rolActualizado', {
                    detail: { 
                        rol_id: response.rol_id, 
                        rol_nombre: response.rol_nombre 
                    }
                }));

                // Si el usuario ya tenía el rol
                if (response.ya_tiene_rol) {
                    setTimeout(() => {
                        setClave('');
                        setRolAsignado(null);
                        setSuccess('');
                    }, 3000);
                } else {
                    // Redirigir según el nuevo rol después de 2 segundos
                    setTimeout(() => {
                        setClave('');
                        setRolAsignado(null);
                        setSuccess('');
                        
                        if (response.rol_id === 1) {
                            const userId = authService.getCurrentUserId();
                            navigate(`/admin/${userId}`);
                        } else {
                            navigate('/');
                        }
                    }, 2000);
                }
            } else {
                setError(response.message || 'Clave inválida');
            }
        } catch (err) {
            console.error('Error validando clave:', err);
            setError(err.response?.data?.message || 'Error al validar la clave');
        } finally {
            setLoading(false);
        }
    };

    const rolesInfo = {
        1: { color: 'danger', icon: 'bi-shield-lock', label: 'Administrador', bg: '#dc3545' },
        2: { color: 'secondary', icon: 'bi-person', label: 'Usuario', bg: '#6c757d' },
        3: { color: 'warning', icon: 'bi-palette', label: 'Artista', bg: '#ffc107' },
        4: { color: 'info', icon: 'bi-shield', label: 'Moderador', bg: '#0dcaf0' }
    };

    const getRolInfo = (rolId) => {
        return rolesInfo[rolId] || rolesInfo[2];
    };

    return (
        <div className="container-fluid p-0 animate__animated animate__fadeIn">
            <h1 className="fw-bold display-5 color-1 mb-0" style={{ fontSize: '28px' }}>
                <i className="bi bi-key me-2"></i>
                Clave por Rol
            </h1>
            <p className="text-muted mb-4 color-2" style={{ fontSize: '18px' }}>
                Activa roles especiales mediante claves de acceso.
            </p>

            {/* Rol actual */}
            {rolActual && (
                <div className="alert alert-info d-flex align-items-center gap-3 mb-4" style={{ borderRadius: '15px' }}>
                    <i className="bi bi-shield-check fs-4"></i>
                    <div>
                        <strong>Rol actual:</strong>
                        <span className="badge rounded-pill ms-2 px-3 py-2" style={{
                            backgroundColor: getRolInfo(rolActual.rol_id).bg,
                            color: rolActual.rol_id === 3 ? '#000' : '#fff'
                        }}>
                            <i className={`bi ${getRolInfo(rolActual.rol_id).icon} me-1`}></i>
                            {rolActual.rol_nombre || 'Usuario'}
                        </span>
                    </div>
                </div>
            )}

            <div className="row">
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px' }}>
                        <h4 className="fw-bold color-2 mb-3">
                            <i className="bi bi-key me-2"></i>
                            Activar Rol por Clave
                        </h4>
                        <p className="text-muted mb-4">
                            Ingresa una clave para activar un rol especial en tu cuenta.
                        </p>

                        <form onSubmit={handleSubmit}>
                            {error && (
                                <Alert variant="danger" dismissible onClose={() => setError('')}>
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert variant="success" className="text-center">
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    {success}
                                    {rolAsignado && (
                                        <div className="mt-2">
                                            <span className="badge rounded-pill px-3 py-2" style={{ 
                                                backgroundColor: getRolInfo(rolAsignado.rol_id).bg,
                                                color: rolAsignado.rol_id === 3 ? '#000' : '#fff',
                                                fontSize: '14px'
                                            }}>
                                                <i className={`bi ${getRolInfo(rolAsignado.rol_id).icon} me-2`}></i>
                                                {rolAsignado.rol_nombre}
                                            </span>
                                        </div>
                                    )}
                                </Alert>
                            )}

                            <div className="mb-3">
                                <label className="fw-bold small color-2 mb-2">Clave de Acceso</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                        <i className="bi bi-key color-2 fs-5"></i>
                                    </span>
                                    <input
                                        type="password"
                                        className="form-control border-start-0 py-3"
                                        placeholder="Ingresa tu clave..."
                                        value={clave}
                                        onChange={(e) => setClave(e.target.value)}
                                        disabled={loading || success}
                                        autoFocus
                                    />
                                </div>
                                <small className="text-muted">
                                    Ejemplos: ADMIN2024, ARTISTA2024, MODERADOR2024, USER2024
                                </small>
                            </div>

                            <Button
                                type="submit"
                                className="w-100 rounded-pill py-3 fw-bold"
                                style={{ 
                                    backgroundColor: success ? '#28a745' : '#8d4925',
                                    border: 'none'
                                }}
                                disabled={loading || !!success}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Validando...
                                    </>
                                ) : success ? (
                                    <>
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        ¡Clave Válida!
                                    </>
                                ) : (
                                    'Validar Clave'
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px' }}>
                        <h4 className="fw-bold color-2 mb-3">
                            <i className="bi bi-info-circle me-2"></i>
                            Roles Disponibles
                        </h4>
                        <p className="text-muted mb-4">
                            Cada clave activa un rol específico con diferentes permisos.
                        </p>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="bg-color-2 text-white">
                                    <tr>
                                        <th>Clave</th>
                                        <th>Rol</th>
                                        <th>Permisos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code className="bg-light p-1 rounded">ADMIN2024</code></td>
                                        <td><span className="badge bg-danger">Administrador</span></td>
                                        <td>Acceso total al sistema</td>
                                    </tr>
                                    <tr>
                                        <td><code className="bg-light p-1 rounded">ARTISTA2024</code></td>
                                        <td><span className="badge bg-warning text-dark">Artista</span></td>
                                        <td>Crear subastas, artículos y catálogos</td>
                                    </tr>
                                    <tr>
                                        <td><code className="bg-light p-1 rounded">MODERADOR2024</code></td>
                                        <td><span className="badge bg-info">Moderador</span></td>
                                        <td>Verificar y moderar contenido</td>
                                    </tr>
                                    <tr>
                                        <td><code className="bg-light p-1 rounded">USER2024</code></td>
                                        <td><span className="badge bg-secondary">Usuario</span></td>
                                        <td>Ver y comprar obras</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="alert alert-warning mt-3">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            <strong>Importante:</strong> Las claves distinguen entre mayúsculas y minúsculas.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClaveXRol;