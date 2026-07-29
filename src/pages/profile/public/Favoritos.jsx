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
import { subastaService } from "../../../services/subastaService.js"; // ⬅️ IMPORTAR

function Favoritos() {
  const { id } = useParams();

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const [filtro, setFiltro] = useState("Artistas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorito, setFavorito] = useState([]);
  const [subastasCompletas, setSubastasCompletas] = useState({}); // ⬅️ Cache de subastas completas

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const favoritoData = await favoriteService.getFavorites();
      setFavorito(favoritoData);
      
      // 🔥 Obtener datos completos de las subastas favoritas
      const subastasFavoritas = favoritoData.filter(item => item.tipo === "subasta");
      const cacheSubastas = {};
      
      for (const item of subastasFavoritas) {
        try {
          const subastaId = item.data.id;
          // Obtener datos completos de la subasta
          const subastaCompleta = await subastaService.getSubastaById(subastaId);
          cacheSubastas[subastaId] = subastaCompleta;
          console.log(`✅ Subasta ${subastaId} cargada:`, subastaCompleta.portada);
        } catch (err) {
          console.error('Error obteniendo subasta completa:', err);
        }
      }
      
      setSubastasCompletas(cacheSubastas);
      
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Función para detectar si es MegaSubasta por el título
  const esMegaSubasta = (titulo) => {
    if (!titulo) return false;
    return titulo.startsWith('MegaSubasta:') || 
           titulo.toLowerCase().includes('megasubasta');
  };

  // 🔥 Función para extraer cantidad de artículos del título
  const extraerCantidadArticulos = (titulo) => {
    if (!titulo) return 0;
    const match = titulo.match(/y (\d+) más/);
    if (match) {
      return parseInt(match[1]) + 1;
    }
    return 0;
  };

  const artistasFavoritos = favorito.filter(
    item => item.tipo === "artista"
  );

  const subastasFavoritas = favorito.filter(
    item => item.tipo === "subasta"
  );

  const articulosFavoritos = favorito.filter(
    item => item.tipo === "articulo"
  );

  const catalogosFavoritos = favorito.filter(
    item => item.tipo === "catalogo"
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
        {/* ===== ARTISTAS ===== */}
        {filtro === 'Artistas' && (
          <>
            {artistasFavoritos.length > 0 ? (
              artistasFavoritos.map(item => (
                <div
                  key={item.data.id}
                  className="col-12 col-sm-6 col-md-4 col-lg-3"
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

        {/* ===== SUBASTAS ===== */}
        {filtro === 'Subastas' && (
          <>
            {subastasFavoritas.length > 0 ? (
              subastasFavoritas.map(item => {
                const s = item.data;
                const subastaId = s.id;
                
                // 🔥 Obtener datos completos de la subasta (si están en cache)
                const datosCompletos = subastasCompletas[subastaId] || {};
                
                // Detectar si es MegaSubasta
                const esMega = esMegaSubasta(s.titulo) || datosCompletos.esMegaSubasta || false;
                
                // Obtener cantidad de artículos
                let cantidad = s.total_articulos || s.cantidad_articulos || 0;
                if (cantidad === 0 && esMega) {
                  cantidad = extraerCantidadArticulos(s.titulo);
                }
                if (cantidad === 0 && datosCompletos.total_articulos) {
                  cantidad = datosCompletos.total_articulos;
                }
                
                // 🔥 OBTENER PORTADA: priorizar datos completos
                const portada = datosCompletos.portada || s.portada || s.img1 || s.foto1_url;
                
                // Título a mostrar
                const tituloMostrar = esMega ? 'MegaSubasta' : s.titulo;
                
                // Para debug
                console.log(`📦 Subasta ${subastaId}:`, {
                  titulo: s.titulo,
                  esMega,
                  cantidad,
                  portada,
                  datosCompletosPortada: datosCompletos.portada
                });
                
                return (
                  <div
                    key={subastaId}
                    className="col-12 col-sm-6 col-md-4 col-lg-3"
                  >
                    <SubastaCard
                      id={subastaId}
                      vendedor_id={s.vendedor_id || datosCompletos.vendedor_id}
                      vendedor_nombre={s.vendedor_nombre || s.vendedor || datosCompletos.vendedor_nombre}
                      titulo={tituloMostrar}
                      img1={portada} // ⬅️ USAR PORTADA
                      tiempo={s.tiempo || datosCompletos.tiempo}
                      pujas={s.pujas || s.total_pujas || datosCompletos.total_pujas || 0}
                      pujaMinima={s.pujaMinima || s.puja_minima || datosCompletos.puja_minima_mxn}
                      categoria={s.categoria || datosCompletos.categoria}
                      estadoPrincipal={s.estadoPrincipal || s.estado || datosCompletos.estadoPrincipal || 'PENDIENTE'}
                      precio={s.precio || s.puja_actual_mxn || datosCompletos.puja_actual_mxn || datosCompletos.precio_inicial_mxn}
                      isPage={true}
                      vendedor_foto={s.vendedor_foto || s.foto_perfil_url || datosCompletos.vendedor_foto_perfil}
                      esMegaSubasta={esMega}
                      cantidadArticulos={cantidad}
                      portada={portada} // ⬅️ PASAR PORTADA EXPLÍCITAMENTE
                    />
                  </div>
                );
              })
            ) : (
              <div className="col-12 text-center py-5">
                <i className="bi bi-folder-x fs-1 text-muted"></i>
                <h5 className="mt-3 text-muted">
                  Aún no tienes subastas favoritas.
                </h5>
              </div>
            )}
          </>
        )}

        {/* ===== ARTICULOS ===== */}
        {filtro === 'Articulos' && (
          <>
            {articulosFavoritos.length > 0 ? (
              articulosFavoritos.map(item => (
                <div
                  key={item.data.id}
                  className="col-12 col-sm-6 col-md-4 col-lg-3"
                >
                  <ArticuloCard {...item.data} isPage={true} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <i className="bi bi-folder-x fs-1 text-muted"></i>
                <h5 className="mt-3 text-muted">
                  Aún no tienes artículos favoritos.
                </h5>
              </div>
            )}
          </>
        )}

        {/* ===== CATALOGOS ===== */}
        {filtro === 'Catalogos' && (
          <>
            {catalogosFavoritos.length > 0 ? (
              catalogosFavoritos.map(item => (
                <div
                  key={item.data.id}
                  className="col-12 col-sm-6 col-md-4 col-lg-3"
                >
                  <CatalogoCard {...item.data} isPage={true} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <i className="bi bi-folder-x fs-1 text-muted"></i>
                <h5 className="mt-3 text-muted">
                  Aún no tienes catálogos favoritos.
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