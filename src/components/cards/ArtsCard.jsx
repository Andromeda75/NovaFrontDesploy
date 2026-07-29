import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { favoriteService } from "../../services/favoriteService";
import { perfilService } from "../../services/perfilService";
import MensajeModal from '../modals/MensajeModal';
import { useModal } from '../../components/modals/useModal.jsx';

function ArtsCard({ id, nombre_completo, interes, descripcion, calificacion_promedio, foto_perfil_url }) {
  const { modal, showModalMessage, hideModal } = useModal();
  const [isFavorite, setIsFavorite] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null);

  useEffect(() => {
    const verificarFavorito = async () => {
      try {
        const favoritoData = await favoriteService.checkFavorite(
          "artista",
          id
        );
        setIsFavorite(favoritoData.isFavorite);
      } catch (error) {
        console.error("Error verificando favorito:", error);
      }
    };
    
    verificarFavorito();
    cargarFotoPerfil();
  }, [id]);

  const cargarFotoPerfil = async () => {
    try {
      // Si ya viene la foto desde las props, usarla
      if (foto_perfil_url) {
        setFotoPerfil(foto_perfil_url);
        return;
      }

      // Si no, obtener del backend usando el ID del artista
      const perfilData = await perfilService.getPerfilPublico(id);
      if (perfilData.foto_perfil_url) {
        setFotoPerfil(perfilData.foto_perfil_url);
      }
    } catch (error) {
      console.error('Error cargando foto del artista:', error);
    }
  };

  const handleFavorito = async (artistaId) => {
    try {
      if (isFavorite) {
        await favoriteService.deleteFavorite({
          tipo: "artista",
          referencia_id: artistaId
        });
        setIsFavorite(false);
        console.log("Eliminado de favoritos");
      } else {
        await favoriteService.postFavorite({
          tipo: "artista",
          referencia_id: artistaId
        });
        setIsFavorite(true);
        console.log("Agregado a favoritos");
      }
    } catch (error) {
      console.error(error);
      showModalMessage('Error', 'Error al agregar favorito', 'error');
    }
  };

  return (
    <>
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
        <div className="px-3 pt-3 pb-2 d-flex justify-content-between align-items-start">
          <div className="d-flex align-items-center gap-2">
            {/* Foto de perfil del artista - SIEMPRE del artista, no del usuario logueado */}
            <div className="overflow-hidden flex-shrink-0" 
              style={{ 
                width: "45px", 
                borderRadius: "10%",
                height: "45px", 
                backgroundColor: "#f3e1c7",
                display: "grid", 
                placeItems: "center" 
              }}>
              {fotoPerfil ? (
                <img 
                  src={fotoPerfil} 
                  alt={`Foto de ${nombre_completo || 'Artista'}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <i className="bi bi-person text-muted" style={{ fontSize: '1.5rem' }}></i>
              )}
            </div>

            <div className="d-flex flex-column">
              <Link
                to={`/profile/public/${id}`}
                className="text-decoration-none"
              >
                <small className="fw-bold color-1">{nombre_completo || 'Artista'}</small>
              </Link>
              <small className="color-2 fw-bold mt-1">
                <i className="bi bi-star-fill me-1 text-warning"></i>
                {calificacion_promedio || 0} / 5.0
              </small>
            </div>
          </div>
          <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} fs-5 color-2`} 
            style={{ cursor: 'pointer' }}
            onClick={() => handleFavorito(id)}
          ></i>
        </div>

        <div className="px-3 pb-3 pt-0">
          <small className="color-3 fw-bold d-block mb-1">{interes || 'Sin interés'}</small>
          <p
            className="text-muted small mb-2"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {descripcion || 'Sin descripción disponible'}
          </p>
          <div className="text-end">
            <Link to={`/profile/public/${id}`} className="text-decoration-none color-2 cursor-pointer">
              Ver perfil
            </Link>
          </div>
        </div>
      </div>

      <MensajeModal
        show={modal.show}
        onHide={hideModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </>
  );
}

export default ArtsCard;