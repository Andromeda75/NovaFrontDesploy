import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import { authService } from '../../../services/authService';
import { favoriteService } from "../../../services/favoriteService.js";

function formatearFecha(fecha) {
  if (!fecha) return '';

  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatearPrecio(precio) {
  if (precio == null) return '';

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(precio);
}

function SubastaCardv2({ id, vendedor_id, vendedor_nombre, titulo, img1, tiempo, pujas, pujaMinima, categoria, estadoPrincipal, precio, isPage }) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  const user = authService.getCurrentUser();
  const isMySubasta = user?.id === vendedor_id;

  useEffect(() => {

    const verificarFavorito = async () => {

        try {

          const favoritoData = await favoriteService.checkFavorite(
            "subasta",
            id
          );

          setIsFavorite(favoritoData.isFavorite);

        } catch (error) {

          console.error("Error verificando favorito:", error);

        }

      };

      verificarFavorito();

  }, [id]);

  const handleFavorito = async (subastaId) => {

    try {

      if (isFavorite) {

        await favoriteService.deleteFavorite({
            tipo: "subasta",
            referencia_id: subastaId
        });

        setIsFavorite(false);

        console.log("Eliminado de favoritos");
      } else {

        await favoriteService.postFavorite({
             tipo: "subasta",
             referencia_id: subastaId
         });

         setIsFavorite(true);

        //  alert("Agregado a favoritos");
        console.log("Agregado a favoritos");

      }

      } catch (error) {

          console.error(error);

          alert("Error al agregar favorito");

      }

  };


  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
      {isPage && (
        <div className="p-3 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-light rounded-circle" style={{ width: '35px', height: '35px', display: 'grid', placeItems: 'center' }}>
                  <i className="bi bi-person text-muted"></i>
              </div>
              <Link
                  to={`/profile/public/${vendedor_id}`}
                  className="text-decoration-none"
              >
                <small className="fw-bold color-1">
                  {isMySubasta ? "Tú" : vendedor_nombre}
                </small>
              </Link>
              <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success text-uppercase" style={{ fontSize: '10px' }}>{ estadoPrincipal }</span>
            </div>
            {!isMySubasta && 
              <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} text-danger fs-5 color-2`} 
                style={{ cursor: 'pointer' }}
                onClick={() => handleFavorito(id)}
              ></i>
            }
        </div>
      )}
    <Link 
      to={`/subasta/${id}`} 
      className="text-decoration-none"
    >
      <div className="bg-secondary bg-opacity-10 position-relative" style={{ 
            height: '200px',
            backgroundImage: `url(${img1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
          <div className="position-absolute bottom-0 start-0 m-3 text-white px-3 py-1 rounded-pill small" style={{ backgroundColor: '#632c00', fontSize: '0.75rem' }}>
              <i className="bi bi-clock me-1"></i>
              <span className=" ms-1 me-1">{tiempo}</span>
              <span className="fz-15 ms-1 "style={{ color: '#ffffffa7' }}>Restante</span>
          </div>
      </div>
      <div className="card-body">
          <div className="d-flex justify-content-between mb-1">
          <small className="color-3 fw-bold text-uppercase">{ categoria }</small>
          <small className="text-muted"><i className="bi bi-people me-1"></i>{pujas} pujas</small>
          </div>
          <h5 className="fw-bold color-1">{ titulo }</h5>
          <div className="row mt-3 pt-3 border-top g-0 align-items-center">
          <div className="col-6">
              <small className="text-muted d-block" style={{ fontSize: '10px' }}>PUJA ACTUAL</small>
              <span className="fw-bold color-2">{formatearPrecio(precio)} MXN</span>
          </div>
          <div className="col-6 text-end">
              <small className="text-muted d-block" style={{ fontSize: '10px' }}>COSTO PUJA</small>
              <span className="badge rounded-pill border border-warning color-1 px-3 py-2" style={{ backgroundColor: '#f0e6d2' }}>
              <i className="bi bi-ticket-perforated me-1"></i> 6
              </span>
          </div>
          <div className="col-12 d-flex justify-content-start text-end">
              <small className=" text-muted d-block fz-15 me-1" >Puja Mínima:</small>
              <small className=" text-muted d-block color-2 fz-15 ms-1">{formatearPrecio(pujaMinima)} MXN</small>
          </div>
          
          </div>
      </div>
    </Link>
  </div>
  );
}

export default SubastaCardv2;
      
      
      
      
