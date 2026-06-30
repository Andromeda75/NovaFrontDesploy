import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card, Modal, Form } from 'react-bootstrap';
import { perfilService } from '../../services/perfilService';
import { articuloService } from '../../services/articuloService';
import { authService } from '../../services/authService';
import { favoriteService } from "../../services/favoriteService";
import MensajeModal from '../../components/modals/MensajeModal.jsx';
import { useModal } from '../../components/modals/useModal.jsx';

function formatearFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatearVencimiento(fecha) {
  if (!fecha) return 'N/A';
  if (fecha === '0000-00-00' || fecha === '0000-00-00T00:00:00.000Z') return 'N/A';
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('es-MX', {
      month: '2-digit',
      year: '2-digit'
    });
  } catch (e) {
    return 'N/A';
  }
}

function formatearPrecio(precio) {
  if (precio == null) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(precio);
}

const ArticuloDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { modal, showModalMessage, hideModal } = useModal();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [articulo, setArticulo] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [metodosPago, setMetodosPago] = useState([]);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [portadaActiva, setPortadaActiva] = useState('');
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const timerRef = useRef(null);

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    cargarDatos();
    cargarMetodosPago();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const articuloData = await articuloService.getArticuloById(id);
      
      const media = [];
      if (articuloData.foto1_url) media.push(articuloData.foto1_url);
      if (articuloData.foto2_url) media.push(articuloData.foto2_url);
      if (articuloData.foto3_url) media.push(articuloData.foto3_url);
      if (articuloData.video_url) media.push(articuloData.video_url);
      articuloData.media = media;

      setArticulo(articuloData);
      setPortadaActiva(media[0] || '');
  
      if (articuloData?.vendedor_id) {
        const perfilData = await perfilService.getPerfilPublico(articuloData.vendedor_id);
        setPerfil(perfilData);
      }

      const favoritoData = await favoriteService.checkFavorite(
        "articulo",
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

  const handleFavorito = async (articuloId) => {
    try {
      if (isFavorite) {
        await favoriteService.deleteFavorite({
          tipo: "articulo",
          referencia_id: articuloId
        });
        setIsFavorite(false);
        showModalMessage('Favoritos', 'Eliminado de favoritos', 'success');
        console.log("Eliminado de favoritos");
      } else {
        await favoriteService.postFavorite({
          tipo: "articulo",
          referencia_id: articuloId
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

  const cargarMetodosPago = async () => {
    try {

      const metodos = await perfilService.getMetodosPago();
      console.log('Métodos de pago (desde perfilService):', metodos);
      setMetodosPago(metodos);
      if (metodos && metodos.length > 0) {
        setMetodoPagoSeleccionado(metodos[0].id);
      }
    } catch (err) {
      console.error('Error cargando métodos de pago:', err);
    }
  };

  const handleConfirmarCompra = async () => {
    if (!metodoPagoSeleccionado) {
      showModalMessage('Atención', 'Por favor, selecciona un método de pago', 'warning');
      return;
    }

    setProcesando(true);
    try {
      const response = await articuloService.comprarArticulo(id, metodoPagoSeleccionado);
      
      setSuccessMessage(`¡Compra realizada con éxito! Total: ${formatearPrecio(response.monto_total)}`);
      setShowSuccessModal(true);
      
      timerRef.current = setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/perfil/historial?tab=Compras');
      }, 3000);
    } catch (err) {
      console.error('Error al comprar:', err);
      showModalMessage('Error', err.response?.data?.message || 'Error al procesar la compra', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const handleCerrarModal = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setShowSuccessModal(false);
    navigate('/perfil/historial?tab=Compras');
  };

  const cambiarImagen = (imgSeleccionada, index) => {
    if (!articulo?.media) return;
    const nuevasMedia = [...articulo.media];
    nuevasMedia[index] = portadaActiva;
    setArticulo({ ...articulo, media: nuevasMedia });
    setPortadaActiva(imgSeleccionada);
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

  if (error || !articulo) {
    return (
      <div className="alert alert-danger m-3">
        {error || 'Artículo no encontrado'}
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    );
  }

  const user = authService.getCurrentUser();
  const esMiArticulo = user?.id === articulo.vendedor_id;
  const yaVendido = articulo.estado_nombre === 'Vendido';
  const envio = articulo.precio_mxn * 0.10;
  const total = articulo.precio_mxn * 1.10;

  return (
    <div className="d-flex flex-column">
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
            <div 
              className="bg-color-5 rounded-4 mb-3 d-flex align-items-center justify-content-center shadow-sm" 
              style={{ 
                minHeight: '550px', 
                backgroundImage: `url(${portadaActiva})`, 
                backgroundSize: 'cover',       
                backgroundPosition: 'center',  
                backgroundRepeat: 'no-repeat',
              }}
            />
            <Row className="g-2">
              {articulo.media?.map((img, index) => (
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
                  />
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
                    to={`/profile/public/${articulo.vendedor_id}`}
                    className="text-decoration-none"
                    >
                    <h5 className="mb-1 color-1 fw-bold">{ esMiArticulo ? "Tú" : articulo.vendedor_nombre }</h5>
                  </Link>
                  <div className="d-inline-flex align-items-center gap-2">
                    <div className="d-flex justify-content-center align-items-center rounded-circle" 
                      style={{ width: "25px", height: "25px", backgroundColor: "#FFD700" }}>
                      <i className="bi bi-star-fill text-white"></i>
                    </div>
                    <small className="fw-bold color-2">{perfil?.calificacion_promedio || 0} / 5.0</small>
                  </div>
                </div>
                {!esMiArticulo &&
                  <div className='pe-2 ms-auto'>
                    <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} color-1 fw-bold"`} 
                      style={{ fontSize: '30px', cursor: 'pointer' }}
                      onClick={() => handleFavorito(id)}
                    ></i>
                  </div>
                } 
              </div>
              
              <span className="color-3 fw-bold small text-uppercase mb-1">{articulo.categoria}</span>
              <h1 className="display-6 color-1 fw-bold mb-3">{articulo.titulo}</h1>
              <p className="text-muted small">Fecha de publicación: {formatearFecha(articulo.fecha_publicacion)}</p>
              
              <div className="my-4 py-3 border-top border-bottom">
                <p className="m-0 text-muted">Precio:</p>
                <h2 className="color-1 fw-bold m-0">{formatearPrecio(articulo.precio_mxn)}</h2>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold color-1">Descripción detallada</h6>
                <p className="color-2 small lh-base">{articulo.descripcion}</p>
              </div>

              {!esMiArticulo && !yaVendido && (
                <>
                  <div className="mb-4">
                    <h6 className="fw-bold color-1 mb-3">Método de Pago</h6>
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
                            <small className="text-muted">{metodo.numero_tarjeta_enmascarado} - Vence: {formatearVencimiento(metodo.fecha_expiracion)}</small>
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
                      <span>Subtotal:</span>
                      <span className="fw-bold">{formatearPrecio(articulo.precio_mxn)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Envío estimado:</span>
                      <span className="fw-bold">{formatearPrecio(envio)}</span>
                    </div>
                    <div className="d-flex justify-content-between text-danger mb-2">
                      <span>Comisión (8%):</span>
                      <span className="fw-bold">-{formatearPrecio(articulo.precio_mxn * 0.08)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <span className="fw-bold">Total a pagar:</span>
                      <span className="fw-bold fs-5">{formatearPrecio(total)}</span>
                    </div>
                  </div>

                  <Button 
                    className="btn-2 w-100 py-2 fw-bold"
                    onClick={handleConfirmarCompra}
                    disabled={procesando || metodosPago.length === 0}
                  >
                    {procesando ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Procesando...
                      </>
                    ) : (
                      'CONFIRMAR Y PAGAR'
                    )}
                  </Button>
                </>
              )}

              {esMiArticulo && (
                <div className="alert alert-info text-center">
                  <i className="bi bi-info-circle me-2"></i>
                  Eres el vendedor de este artículo.
                </div>
              )}

              {yaVendido && (
                <div className="alert alert-success text-center">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Este artículo ya fue vendido.
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal de éxito - IGUAL que en SubastaDetalle */}
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
            <h3 className="fw-bold mb-0">¡Compra exitosa!</h3>
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
                Redirigiendo a tu historial de compras...
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

      {/* MODAL DE MENSAJES */}
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

export default ArticuloDetalle;