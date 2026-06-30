import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import CatalogoCard from "../../../components/cards/catalogos/CatalogoCardv1.jsx";
import SubastaCard from "../../../components/cards/subastas/SubastaCardv2.jsx";
import ArticuloCard from "../../../components/cards/articulos/ArticuloCardv1.jsx";
import ArtsCard from "../../../components/cards/ArtsCard.jsx";

import card1 from '../../../assets/img/illustrations/hp720.jpg';
import imgSubasta from '../../../assets/img/illustrations/img1.jpg';
import imgArticulo from '../../../assets/img/illustrations/hp720.jpg';

import { favoriteService } from "../../../services/favoriteService.js";

function Favoritos() {
 

  // const favoritosData = [
  //   { 
  //     id: 1, 
  //     tipo: "Artistas", 
  //     componente: ArtsCard, 
  //     props: {} 
  //   },
  //   { 
  //     id: 2, 
  //     tipo: "Subastas", 
  //     componente: SubastaCard, 
  //     props: {
  //       id: "2", 
  //       titulo: "Cuadro Abstracto",
  //       categoria: "PINTURA",
  //       precio: "3,800.00",
  //       pujaMinima: "4,000.00",
  //       estadoPrincipal: "Activa",
  //       subEstado: "VENDIDO",
  //       pujas: 12,
  //       imagen: imgSubasta,
  //       img1: imgSubasta,
  //       img2: imgSubasta,
  //       img3: imgSubasta,
  //       descripcion: "Una obra vibrante con texturas únicas."
  //     }
  //   },
  //   { 
  //     id: 3, 
  //     tipo: "Articulos", 
  //     componente: ArticuloCard, 
  //     props: {
  //       id: "3", 
  //       titulo: "Noguchi Inspired Desk",
  //       categoria: "ARTESANÍAS",
  //       fecha: "30/01/2026",
  //       precio: "1,100.00",
  //       estado: "APROBADO",
  //       imagen: imgArticulo,
  //       img1: imgArticulo,
  //       img2: imgArticulo,
  //       img3: imgArticulo,
  //       descripcion: "Escritorio artesanal inspirado en diseños clásicos."
  //     }
  //   },
  //   { 
  //     id: 4, 
  //     tipo: "Catalogos", 
  //     componente: CatalogoCard, 
  //     props: {
  //       id: 1,
  //       titulo: "Noguchi Inspired Desk",
  //       categoria: "ARTESANÍAS",
  //       fecha: "30/01/2026",
  //       precio: "1,100.00",
  //       estado: "APROBADO",
  //       tipo: "activos",
  //       imagen: card1, 
  //       img1: card1 ,
  //       img2: card1 ,
  //       img3: card1 
  //     }
  //   },
  // ];
  // const favoritosFiltrados = favoritosData.filter(
  //   (item) => item.tipo === filtro
  // );

  const { id } = useParams();

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const [filtro, setFiltro] = useState("Artistas");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [artista, setArtista] = useState([]);
  const [favorito, setFavorito] = useState([]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const favoritoData = await favoriteService.getFavorites();
      setFavorito(favoritoData);
      
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const artistasFavoritos = favorito.filter(
    item => item.tipo === "artista"
  );

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
    <div className="container-fluid p-0 animate__animated animate__fadeIn">
      <h2 className="fw-bold color-1 mb-0">Favoritos</h2>
      <p className="text-muted mb-4 color-2" style={{ fontSize: '18px' }}> 
        Artistas, obras y subastas que has guardado para más tarde.
      </p>
      <div className="d-flex align-items-center mb-0">
        <div className="d-flex mb-4 p-1 gap-2 rounded-pill shadow-sm color-2" style={{ backgroundColor: '#f6d8a8', width: 'fit-content' }} >
          {["Artistas", "Subastas", "Articulos", "Catalogos"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setFiltro(tab)} 
              className={`btn rounded-pill px-4 fw-bold small color-2 ${filtro === tab ? "bg-white shadow-sm" : "opacity-75"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="row g-4">
        {/* {favoritosFiltrados.length > 0 ? (
          favoritosFiltrados.map((item) => {
            const ComponenteFavorito = item.componente;
            return (
              <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3 animate__animated animate__fadeIn">
                <ComponenteFavorito {...item.props} />
              </div>
            );
          })
        ) : (
          <div className="col-12">
            <p className="text-muted">No tienes {filtro.toLowerCase()} guardados en favoritos.</p>
          </div>
        )} */}
        {filtro === 'Artistas' && (
          <>
            {artistasFavoritos.length > 0 ? (

              artistasFavoritos.map(item => (
                <div
                  key={item.data.id}
                  className="col-md-6 col-lg-4 animate__animated animate__fadeIn"
                >
                  <ArtsCard {...item.data} />
                </div>
              ))

            ) : (

              <div className="col-12 text-center py-5">
                <i className="bi bi-folder-x fs-1 text-muted"></i>
                <h5 className="mt-3 text-muted">
                  Aún no tienes artistas favoritos.
                </h5>
              </div>

            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Favoritos;