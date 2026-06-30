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

function CatalogoCardv1({ id, propietario_id, autor_nombre, categoria, titulo, portada_url, fecha_publicacion, isPage }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const user = authService.getCurrentUser();
  const isMyCatalog = user?.id === propietario_id

  useEffect(() => {

    const verificarFavorito = async () => {

        try {

          const favoritoData = await favoriteService.checkFavorite(
            "catalogo",
            id
          );

          setIsFavorite(favoritoData.isFavorite);

        } catch (error) {

          console.error("Error verificando favorito:", error);

        }

      };

      verificarFavorito();

  }, [id]);

  const handleFavorito = async (catalogoId) => {

    try {

      if (isFavorite) {

        await favoriteService.deleteFavorite({
            tipo: "catalogo",
            referencia_id: catalogoId
        });

        setIsFavorite(false);

        console.log("Eliminado de favoritos");
      } else {

        await favoriteService.postFavorite({
             tipo: "catalogo",
             referencia_id: catalogoId
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
                  to={`/profile/public/${propietario_id}`}
                  className="text-decoration-none"
              >
                <small className="fw-bold color-1">
                  {isMyCatalog ? "Tú" : autor_nombre}
                </small>
            </Link>
          </div>
            {!isMyCatalog && 
              <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} text-danger fs-5 color-2`} 
                style={{ cursor: 'pointer' }}
                onClick={() => handleFavorito(id)}
              ></i>
            }
        </div>
      )}
    <Link 
      to={`/catalogo/${id}`} 
      className="text-decoration-none"
    >
      <div className="bg-secondary bg-opacity-10" style={{ 
            height: '200px',
            backgroundImage: `url(${portada_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
      </div>
      <div className="card-body">
          <small className="color-3 fw-bold text-uppercase d-block mb-1">{ categoria }</small>
          <h5 className="fw-bold color-1">{ titulo }</h5>
          <div className="row mt-4 pt-2 border-top">
          <div className="col-7">
              <small className="text-muted d-block" style={{ fontSize: '10px' }}>FECHA PUBLICACIÓN</small>
              <span className="fw-bold color-1" style={{ fontSize: '0.9rem' }}>{formatearFecha(fecha_publicacion)}</span>
          </div>
          {/* <div className="col-5 text-end">
              <small className="text-muted d-block" style={{ fontSize: '10px' }}>PRECIO</small>
              <span className="fw-bold color-2" style={{ fontSize: '0.9rem' }}>$1,100.00 MXN</span>
          </div> */}
          </div>
      </div>
    </Link>
  </div>
  );
}

export default CatalogoCardv1;
      
      
      
      
