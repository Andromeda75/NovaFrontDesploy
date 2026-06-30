import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Form, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import imgA from '../../assets/img/illustrations/professor_walk_cycle_no_hat.png';

import { perfilService } from '../../services/perfilService';
import { authService } from '../../services/authService';
import { catalogoService } from '../../services/catalogoService';
import { favoriteService } from "../../services/favoriteService";

function formatearFecha(fecha) {
  if (!fecha) return '';

  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

const CatalogoDetalle = () => {
  const [view, setView] = useState('detalle'); // 'detalle' o 'pago'
  const navigate = useNavigate(); // 

  const [isFavorite, setIsFavorite] = useState(false);

  const handleVolver = () => {
    if (view === 'detalle') {
      // navigate('/profile/public'); // Cambiado a '/' en lugar de '/profile/public'
      navigate(-1); // ← vuelve a la página anterior
    } else {
      setView('detalle');
    }
  };

  const { id } = useParams();

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [perfil, setPerfil] = useState([]);
    const [catalogo, setCatalogo] = useState([]);
    const [portadaActiva, setPortadaActiva] = useState('');

    // console.log(catalogo);

    const cargarDatos = async () => {
        setLoading(true);
        try {

          const catalogoData = await catalogoService.getCatalogoById(id);

          // convertir JSON string a array
          if (catalogoData.imagenes_extra) {
            catalogoData.imagenes_extra = JSON.parse(
              catalogoData.imagenes_extra
            );
          }

          setCatalogo(catalogoData);
          setPortadaActiva(catalogoData.portada_url);

          if (catalogoData?.propietario_id) {
            const perfilData = await perfilService.getPerfilPublico(
              catalogoData.propietario_id
            );
            setPerfil(perfilData);
          }

          const favoritoData = await favoriteService.checkFavorite(
            "catalogo",
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

    const handleFavorito = async (catalogoId) => {

        try {

            if (isFavorite) {

                await favoriteService.deleteFavorite({
                    tipo: "catalogo",
                    referencia_id: catalogoId
                });

                setIsFavorite(false);

                // alert("Eliminado de favoritos");
                console.log("Eliminado de favoritos");
            } else {

                await favoriteService.postFavorite({
                    tipo: "catalogo",
                    referencia_id: catalogoId
                });

                setIsFavorite(true);

                // alert("Agregado a favoritos");
                console.log("Agregado a favoritos");

            }

        } catch (error) {

            console.error(error);

            alert("Error al agregar favorito");

        }

    };

    const user = authService.getCurrentUser();
    const isMyCatalog = user?.id === catalogo.propietario_id

    const cambiarImagen = (imgSeleccionada, index) => {
      // copiar array
      const nuevasImagenes = [...catalogo.imagenes_extra];

      // intercambiar
      nuevasImagenes[index] = portadaActiva;

      // actualizar estado
      setCatalogo({
        ...catalogo,
        imagenes_extra: nuevasImagenes
      });

      setPortadaActiva(imgSeleccionada);
    };

    // Función para verificar si el usuario es ganador
const verificarGanador = async () => {
    try {
        const response = await subastaService.getGanador(id);
        setEsGanador(response.esGanador);
        setPagoRealizado(response.pago_realizado);
        
        // Si es ganador y no ha pagado, cargar métodos de pago
        if (response.esGanador && !response.pago_realizado) {
            const metodos = await subastaService.getMetodosPago(id);
            setMetodosPago(metodos);
            if (metodos.length > 0) {
                setMetodoPagoSeleccionado(metodos[0].id);
            }
        }
    } catch (err) {
        console.error('Error verificando ganador:', err);
    }
};

// Función para validar pago
const handleValidarPago = async () => {
    if (!metodoPagoSeleccionado) {
        alert('Por favor, selecciona un método de pago');
        return;
    }
    
    setProcesandoPago(true);
    try {
        const response = await subastaService.validarPago(id, metodoPagoSeleccionado);
        
        alert(`Pago realizado exitosamente. Comisión aplicada: $${response.comision.toFixed(2)} MXN`);
        setPagoRealizado(true);
        setMostrarValidacionPago(false);
        cargarDatos();
    } catch (err) {
        console.error('Error al validar pago:', err);
        alert(err.response?.data?.message || 'Error al procesar el pago');
    } finally {
        setProcesandoPago(false);
    }
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

    if (error) {
        return (
        <div className="alert alert-danger m-3">
            {error}
        </div>
        );
    }
  

  return (
    <div className="d-flex flex-column">
      <Container fluid="xxl" className="my-4 flex-grow-1 px-lg-5">
        <Button 
          variant="link" 
          className="text-decoration-none color-2 p-0 mb-3 fw-bold" 
          onClick={handleVolver}
        >
          <i className="bi bi-arrow-left me-2"></i>
          {view === 'detalle' ? "Volver" : "Volver al producto"}
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
            >
            </div>
            <Row className="g-2">
              {catalogo.imagenes_extra?.map((img, index) => (
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
                 <div className="d-flex justify-content-center align-items-center shadow-sm me-3" style={{width: "55px", height: "55px", backgroundColor: "#E8B767", borderRadius: "8px"}}>
                   <i className="bi bi-person color-1 fs-5"></i>
                 </div>
                    <div>
                      <Link
                          to={`/profile/public/${catalogo.propietario_id}`}
                          className="text-decoration-none"
                      >
                        <h5 className="mb-1 color-1 fw-bold">{ isMyCatalog ? "Tú" : catalogo.autor_nombre }</h5>
                      </Link>
                      <div className="d-inline-flex align-items-center gap-2">
                          <div className="d-flex justify-content-center align-items-center rounded-circle" style={{width: "25px", height: "25px", backgroundColor: "#FFD700"}}>
                              <i className="bi bi-star-fill text-white"></i>
                          </div>
                          <small className="fw-bold color-2">{ perfil.calificacion_promedio } / 5.0</small>
                      </div>
                    </div>
                    {!isMyCatalog &&
                        <div className='pe-2 ms-auto'>
                            <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} color-1 fw-bold"`} 
                                style={{ fontSize: '30px', cursor: 'pointer' }}
                                onClick={() => handleFavorito(id)}
                            ></i>
                        </div>
                    }
              </div>
                  
                  <span className="color-3 fw-bold small text-uppercase mb-1">{ catalogo.categoria }</span>
                  <h1 className="display-6 color-1 fw-bold mb-3">{ catalogo.titulo }</h1>
                  <p className="text-muted small">Fecha de publicación: {formatearFecha(catalogo.fecha_publicacion)}</p>
                  <div className="mt-auto">
                    <h6 className="fw-bold color-1">Descripción detallada</h6>
                    <p className="color-2 small lh-base">
                      { catalogo.descripcion }
                    </p>
                  </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CatalogoDetalle;