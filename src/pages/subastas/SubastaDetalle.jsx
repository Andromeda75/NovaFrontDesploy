import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card, Modal } from 'react-bootstrap';
import { perfilService } from '../../services/perfilService';
import { subastaService } from '../../services/subastaService';
import { pujaService } from '../../services/pujaService';
import { authService } from '../../services/authService';
import { favoriteService } from "../../services/favoriteService";
import MensajeModal from '../../components/modals/MensajeModal.jsx';
import { useModal } from '../../components/modals/useModal.jsx';

import api from '../../api/axiosConfig';

function formatearPrecio(precio) {
    if (precio == null || isNaN(precio)) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(precio);
}

const SubastaDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { modal, showModalMessage, hideModal } = useModal();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [subasta, setSubasta] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [montoPuja, setMontoPuja] = useState('');
    const [pujando, setPujando] = useState(false);
    
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const timerRef = useRef(null);

    const [mostrarValidacionPago, setMostrarValidacionPago] = useState(false);
    const [metodosPago, setMetodosPago] = useState([]);
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(null);
    const [procesandoPago, setProcesandoPago] = useState(false);
    const [esGanador, setEsGanador] = useState(false);
    const [pagoRealizado, setPagoRealizado] = useState(false);

    const [portadaActiva, setPortadaActiva] = useState('');

    const [isFavorite, setIsFavorite] = useState(false);

    const verificarGanador = async () => {
        try {
            const response = await api.get(`/subastas/${id}/ganador`);
            setEsGanador(response.data.esGanador);
            setPagoRealizado(response.data.pago_realizado);
            
            if (response.data.esGanador && !response.data.pago_realizado) {
                const metodos = await api.get(`/subastas/${id}/metodos-pago`);
                setMetodosPago(metodos.data);
                if (metodos.data.length > 0) {
                    setMetodoPagoSeleccionado(metodos.data[0].id);
                }
            }
        } catch (err) {
            console.error('Error verificando ganador:', err);
        }
    };

    const handleValidarPago = async () => {
        if (!metodoPagoSeleccionado) {
            showModalMessage('Atención', 'Por favor, selecciona un método de pago', 'warning');
            return;
        }
        
        setProcesandoPago(true);
        try {
            const response = await api.post(`/subastas/${id}/validar-pago`, {
                metodo_pago_id: metodoPagoSeleccionado
            });
            
            showModalMessage('¡Pago exitoso!', `Pago realizado exitosamente. Comisión aplicada: $${response.data.comision.toFixed(2)} MXN`, 'success');
            setPagoRealizado(true);
            setMostrarValidacionPago(false);
            cargarDatos();
        } catch (err) {
            console.error('Error al validar pago:', err);
            showModalMessage('Error', err.response?.data?.message || 'Error al procesar el pago', 'error');
        } finally {
            setProcesandoPago(false);
        }
    };

    useEffect(() => {
        cargarDatos();
        verificarGanador();
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [id]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const subastaData = await subastaService.getSubastaById(id);

            const media = [];
        
            if (subastaData.foto1_url) media.push(subastaData.foto1_url);
            if (subastaData.foto2_url) media.push(subastaData.foto2_url);
            if (subastaData.foto3_url) media.push(subastaData.foto3_url);
            if (subastaData.video_url) media.push(subastaData.video_url);
        
            subastaData.media = media;
  
            
            if (!subastaData.estadoPrincipal) {
                if (subastaData.estado_nombre === 'Activa') {
                    subastaData.estadoPrincipal = 'ACTIVA';
                } else if (subastaData.estado_nombre === 'Finalizada') {
                    subastaData.estadoPrincipal = 'FINALIZADA';
                } else {
                    subastaData.estadoPrincipal = 'EN ESPERA';
                }
            }
            
            console.log('Subasta cargada:', subastaData);
            setSubasta(subastaData);
            setPortadaActiva(subastaData.media[0]);

            if (subastaData?.vendedor_id) {
                const perfilData = await perfilService.getPerfilPublico(subastaData.vendedor_id);
                setPerfil(perfilData);
            }

            const favoritoData = await favoriteService.checkFavorite(
                "subasta",
                id
            );

            setIsFavorite(favoritoData.isFavorite);

        } catch (err) {
            console.error('Error cargando datos:', err);
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleFavorito = async (subastaId) => {
        try {
            if (isFavorite) {
                await favoriteService.deleteFavorite({
                    tipo: "subasta",
                    referencia_id: subastaId
                });
                setIsFavorite(false);
                showModalMessage('Favoritos', 'Eliminado de favoritos', 'success');
                console.log("Eliminado de favoritos");
            } else {
                await favoriteService.postFavorite({
                    tipo: "subasta",
                    referencia_id: subastaId
                });
                setIsFavorite(true);
                showModalMessage('Favoritos', 'Agregado a favoritos', 'success');
                console.log("Agregado a favoritos");
            }
        } catch (error) {
            console.error(error);
            showModalMessage('Error', 'Error al agregar favorito', 'error');
        }
    };

    const cambiarImagen = (imgSeleccionada, index) => {
      const nuevasMedia = [...subasta.media];

      nuevasMedia[index] = portadaActiva;

      setSubasta({
        ...subasta,
        media: nuevasMedia
      });

      setPortadaActiva(imgSeleccionada);
    };


    const handleRealizarPuja = async () => {
        const monto = parseFloat(montoPuja);
        
        if (isNaN(monto) || monto <= 0) {
            showModalMessage('Atención', 'Por favor, ingresa un monto válido', 'warning');
            return;
        }

        const pujaActualNum = parseFloat(subasta.puja_actual_mxn) || parseFloat(subasta.precio_inicial_mxn) || 0;
        const pujaMinimaNum = parseFloat(subasta.puja_minima_mxn) || 0;
        const montoMinimo = pujaActualNum + pujaMinimaNum;
        
        if (monto < montoMinimo) {
            showModalMessage('Atención', `La puja mínima es de ${formatearPrecio(montoMinimo)}`, 'warning');
            return;
        }

        setPujando(true);
        
        try {
            await pujaService.realizarPuja(id, monto);
            await cargarDatos();
            
            setSuccessMessage(`¡Puja realizada con éxito! Tu oferta de ${formatearPrecio(monto)} ha sido registrada.`);
            setShowSuccessModal(true);
            setMontoPuja('');
            
            timerRef.current = setTimeout(() => {
                setShowSuccessModal(false);
                cargarDatos();
            }, 4000);
            
        } catch (err) {
            console.error('Error al realizar puja:', err);
            showModalMessage('Error', err.response?.data?.message || 'Error al realizar la puja', 'error');
        } finally {
            setPujando(false);
        }
    };

    const handleCerrarModal = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setShowSuccessModal(false);
        cargarDatos();
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (error || !subasta) {
        return (
            <div className="alert alert-danger m-3">
                {error || 'Subasta no encontrada'}
                <button className="btn btn-sm btn-outline-danger ms-3" onClick={() => navigate(-1)}>
                    Volver
                </button>
            </div>
        );
    }

    const user = authService.getCurrentUser();
    const esMiSubasta = user?.id === subasta.vendedor_id;
    const pujaActualNum = parseFloat(subasta.puja_actual_mxn) || parseFloat(subasta.precio_inicial_mxn) || 0;
    const pujaMinimaNum = parseFloat(subasta.puja_minima_mxn) || 0;
    const montoMinimoPuja = pujaActualNum + pujaMinimaNum;
    const esActiva = subasta.estadoPrincipal === 'ACTIVA';

    return (
        <div className="bg-color-white d-flex flex-column">
            <Container fluid="xxl" className="my-4 flex-grow-1 px-lg-5">
                <Button 
                    variant="link" 
                    className="text-decoration-none color-2 p-0 mb-3 fw-bold" 
                    onClick={() => navigate(-1)}
                >
                    <i className="bi bi-arrow-left me-2"></i> Volver
                </Button>

                <Row className="g-4">
                    <Col lg={7}>
                        <div className="bg-color-5 rounded-4 mb-3 d-flex align-items-center justify-content-center shadow-sm" style={{ 
                            minHeight: '550px', 
                            backgroundImage: `url(${portadaActiva})`, 
                            backgroundSize: 'cover',       
                            backgroundPosition: 'center',  
                            backgroundRepeat: 'no-repeat',
                            }}>
                        <span className="text-white opacity-50 fs-4" ></span>
                        </div>
                        <Row className="g-2 ">
                        {subasta.media?.map((img, index) => (
                            <Col xs={4} key={index}>
                            <div 
                                className="bg-color-5 rounded-3 shadow-sm cursor-pointer"
                                onClick={() => cambiarImagen(img, index)}
                                style={{ 
                                height: '140px',
                                backgroundImage: `url(${img})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                cursor: 'pointer'
                                }}
                            >
                            </div>
                            </Col>
                        ))}
                        </Row>
                    </Col>

                    <Col lg={5}>
                        <Card className="shadow-sm rounded-5 p-4">
                            <div className="d-flex align-items-center mb-4">
                                <div className="d-flex justify-content-center align-items-center shadow-sm me-3" 
                                    style={{ width: "55px", height: "55px", backgroundColor: "#E8B767", borderRadius: "8px" }}>
                                    <i className="bi bi-person color-1 fs-5"></i>
                                </div>
                                <div>
                                    <Link
                                        to={`/profile/public/${subasta.vendedor_id}`}
                                        className="text-decoration-none"
                                    >
                                        <h5 className="mb-1 color-1 fw-bold">
                                            {esMiSubasta ? "Tú" : subasta.vendedor_nombre}
                                        </h5>
                                    </Link>
                                    <div className="d-inline-flex align-items-center gap-2">
                                        <div className="d-flex justify-content-center align-items-center rounded-circle" 
                                            style={{ width: "25px", height: "25px", backgroundColor: "#FFD700" }}>
                                            <i className="bi bi-star-fill text-white"></i>
                                        </div>
                                        <small className="fw-bold color-2">{perfil?.calificacion_promedio || subasta.vendedor_calificacion || 0} / 5.0</small>
                                    </div>
                                </div>
                                {!esMiSubasta &&
                                    <div className='pe-2 ms-auto'>
                                        <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} color-1 fw-bold"`} 
                                            style={{ fontSize: '30px', cursor: 'pointer' }}
                                            onClick={() => handleFavorito(id)}
                                        ></i>
                                    </div>
                                }
                            </div>

                            <span className="color-3 fw-bold small text-uppercase mb-1">{subasta.categoria}</span>
                            <h1 className="display-6 color-1 fw-bold mb-3">{subasta.titulo}</h1>

                            <div className="bg-light p-3 rounded-4 my-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <small className="text-muted d-block small fw-bold">PUJA ACTUAL</small>
                                        <h4 className="color-1 fw-bold m-0">{formatearPrecio(pujaActualNum)}</h4>
                                    </div>
                                    <div className="text-end">
                                        <small className="text-muted d-block small fw-bold">CIERRA EN</small>
                                        <h4 className="text-muted fw-normal m-0">{subasta.tiempo || 'Finalizada'}</h4>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                                    <small className="text-muted">PUJA MÍNIMA: {formatearPrecio(pujaMinimaNum)}</small>
                                    <small className="text-muted">
                                        <i className="bi bi-ticket-perforated me-1"></i> Costo: 6 Tickets
                                    </small>
                                </div>
                            </div>

                            {!esMiSubasta && esActiva && (
                                <div className="mb-4">
                                    <label className="fw-bold mb-2">Tu puja (MXN)</label>
                                    <div className="d-flex gap-2">
                                        <input
                                            type="number"
                                            className="form-control form-control-lg"
                                            placeholder={formatearPrecio(montoMinimoPuja)}
                                            value={montoPuja}
                                            onChange={(e) => setMontoPuja(e.target.value)}
                                            min={montoMinimoPuja}
                                            step={pujaMinimaNum}
                                        />
                                        <Button 
                                            className="btn-2 px-4"
                                            onClick={handleRealizarPuja}
                                            disabled={pujando}
                                        >
                                            {pujando ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Pujando...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-arrow-up-right me-2"></i> PUJAR
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <small className="text-muted mt-2 d-block">
                                        Mínimo: {formatearPrecio(montoMinimoPuja)}
                                    </small>
                                </div>
                            )}

                            {!esActiva && (
                                <div className="alert alert-secondary text-center">
                                    <i className="bi bi-clock-history me-2"></i>
                                    Esta subasta ya {subasta.estadoPrincipal === 'FINALIZADA' ? 'finalizó' : 'no está activa'}
                                </div>
                            )}

                            {esMiSubasta && esActiva && (
                                <div className="alert alert-info text-center">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Eres el vendedor de esta subasta. No puedes pujar en tu propia obra.
                                </div>
                            )}

                            {esGanador && !pagoRealizado && subasta.estadoPrincipal === 'FINALIZADA' && (
                                <div className="mt-4">
                                    <Button 
                                        className="btn-success w-100 py-2 fw-bold"
                                        onClick={() => setMostrarValidacionPago(true)}
                                    >
                                        <i className="bi bi-credit-card me-2"></i>
                                        VALIDAR PAGO Y CONFIRMAR COMPRA
                                    </Button>
                                </div>
                            )}

                            <div className="mt-4">
                                <h6 className="fw-bold color-1">Descripción detallada</h6>
                                <p className="color-2 small lh-base">
                                    {subasta.descripcion}
                                </p>
                            </div>

                            <Card className="border-0 shadow-sm rounded-4 mt-4">
                                <h6 className="color-1 fw-bold mb-3">
                                    <i className="bi bi-clock-history me-2"></i> Historial de pujas
                                </h6>
                                {subasta.historial_pujas && subasta.historial_pujas.length > 0 ? (
                                    subasta.historial_pujas.map((puja, idx) => (
                                        <div key={idx} className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light rounded-circle me-2 d-flex align-items-center justify-content-center"
                                                    style={{ width: '35px', height: '35px' }}>
                                                    <i className="bi bi-person text-muted"></i>
                                                </div>
                                                <div>
                                                    <p className="m-0 small fw-bold">
                                                        {user?.id === puja.usuario_id ? "Tú" : puja.nombre}
                                                    </p>
                                                    <small className="text-muted" style={{ fontSize: '10px' }}>{puja.tiempo}</small>
                                                </div>
                                            </div>
                                            <span className="fw-bold color-1">{puja.montoFormateado || formatearPrecio(puja.monto)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted text-center small">No hay pujas aún. ¡Sé el primero!</p>
                                )}
                            </Card>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <Modal 
                show={showSuccessModal} 
                onHide={handleCerrarModal}
                centered
                backdrop="static"
                keyboard={false}
            >
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '25px', overflow: 'hidden' }}>
                    <div className="p-4 text-center text-white" style={{ background: 'linear-gradient(to right, #2a140a, #8d4925)' }}>
                        <i className="bi bi-check-circle-fill fs-1 mb-2"></i>
                        <h3 className="fw-bold mb-0">¡Puja realizada!</h3>
                    </div>
                    <Modal.Body className="text-center p-4">
                        <div className="py-3">
                            <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                                style={{ width: '70px', height: '70px' }}>
                                <i className="bi bi-trophy-fill fs-1 text-success"></i>
                            </div>
                            <p className="fs-5">{successMessage}</p>
                            <div className="alert alert-info mt-3">
                                <i className="bi bi-info-circle me-2"></i>
                                La página se actualizará automáticamente...
                            </div>
                        </div>
                    </Modal.Body>
                    <div className="modal-footer border-0 justify-content-center pb-4">
                        <Button 
                            className="btn-linear-gradient px-4"
                            onClick={handleCerrarModal}
                        >
                            Entendido
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal 
                show={mostrarValidacionPago} 
                onHide={() => setMostrarValidacionPago(false)}
                centered
            >
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '25px', overflow: 'hidden' }}>
                    <div className="p-4 text-center text-white" style={{ background: 'linear-gradient(to right, #2a140a, #8d4925)' }}>
                        <i className="bi bi-shield-check fs-1 mb-2"></i>
                        <h3 className="fw-bold mb-0">Validar Pago</h3>
                        <p className="mb-0 small opacity-75">Monto a pagar: {formatearPrecio(subasta.puja_actual_mxn)}</p>
                    </div>
                    <Modal.Body className="p-4">
                        <div className="mb-4">
                            <label className="fw-bold mb-2">Selecciona un método de pago</label>
                            {metodosPago.length > 0 ? (
                                metodosPago.map(metodo => (
                                    <div 
                                        key={metodo.id}
                                        className={`border rounded-4 p-3 mb-2 d-flex align-items-center cursor-pointer ${metodoPagoSeleccionado === metodo.id ? 'border-success bg-success bg-opacity-10' : ''}`}
                                        onClick={() => setMetodoPagoSeleccionado(metodo.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="bg-white border rounded p-2 me-3">
                                            <i className="bi bi-credit-card fs-3"></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <p className="m-0 fw-bold">{metodo.nombre_titular}</p>
                                            <small className="text-muted">{metodo.numero_tarjeta_enmascarado} - Vence: {new Date(metodo.fecha_expiracion).toLocaleDateString()}</small>
                                        </div>
                                        <div className="form-check">
                                            <input 
                                                type="radio" 
                                                className="form-check-input" 
                                                checked={metodoPagoSeleccionado === metodo.id}
                                                onChange={() => setMetodoPagoSeleccionado(metodo.id)}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="alert alert-warning">
                                    No tienes métodos de pago registrados. 
                                    <a href="/perfil/configuracion">Agrega uno aquí</a>
                                </div>
                            )}
                        </div>
                        <div className="bg-light p-3 rounded-4 mb-4">
                            <div className="d-flex justify-content-between mb-2">
                                <span>Monto de la subasta:</span>
                                <span className="fw-bold">{formatearPrecio(subasta.puja_actual_mxn)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 text-danger">
                                <span>Comisión (8%):</span>
                                <span className="fw-bold">-{formatearPrecio(subasta.puja_actual_mxn * 0.08)}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between">
                                <span className="fw-bold">Total a pagar:</span>
                                <span className="fw-bold fs-5">{formatearPrecio(subasta.puja_actual_mxn)}</span>
                            </div>
                        </div>
                        <div className="d-flex gap-3">
                            <Button 
                                variant="outline-secondary" 
                                className="flex-grow-1 rounded-pill py-2"
                                onClick={() => setMostrarValidacionPago(false)}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                className="btn-2 flex-grow-1 rounded-pill py-2"
                                onClick={handleValidarPago}
                                disabled={procesandoPago || metodosPago.length === 0}
                            >
                                {procesandoPago ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Procesando...
                                    </>
                                ) : (
                                    'Confirmar Pago'
                                )}
                            </Button>
                        </div>
                    </Modal.Body>
                </div>
            </Modal>

            <MensajeModal
                show={modal.show}
                onHide={hideModal}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </div>
    );
};

export default SubastaDetalle;