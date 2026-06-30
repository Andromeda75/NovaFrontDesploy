import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import CatalogoCard from "../../../components/cards/catalogos/CatalogoCardv1.jsx";
import SubastaCard from "../../../components/cards/subastas/SubastaCardv2.jsx";
import ArticuloCard from "../../../components/cards/articulos/ArticuloCardv1.jsx";
import ReseñaCard from "../../../components/cards/ReseñaCard.jsx";
import RatingModal from "../../../components/modals/RatingModal.jsx";
import MensajeModal from "../../../components/modals/MensajeModal.jsx";
import imgEjemplo from '../../../assets/img/illustrations/categories/arte-visual/imgA_V5.jpg';
import imgC from '../../../assets/img/illustrations/pinturas.jpg';
import imgA from '../../../assets/img/illustrations/81G8xvpQEnL._AC_UF894,1000_QL80_.jpg';

import { perfilService } from '../../../services/perfilService';
import { authService } from '../../../services/authService';
import { catalogoService } from '../../../services/catalogoService';
import { articuloService } from '../../../services/articuloService';
import { subastaService } from '../../../services/subastaService';
import { reviewService } from '../../../services/reviewService';
import { favoriteService } from "../../../services/favoriteService.js";

import { useModal } from '../../../components/modals/useModal.jsx';

function ProfilePublic() {
    const [filtro, setFiltro] = useState('Catalogo');
    const [showModal, setShowModal] = useState(false);
    const { modal, showModalMessage, hideModal } = useModal();

    const { id } = useParams();

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [perfil, setPerfil] = useState({
        nombre_completo: '',
        ubicacion: '',
        interes: '',
        descripcion: '',
        facebook_handle: '',
        instagram_handle: '',
        twitter_handle: '',
        calificacion_promedio: '',
        fecha_registro: ''
    });

    const [catalogo, setCatalogo] = useState([]);
    const [articulo, setArticulo] = useState([]);
    const [subasta, setSubasta] = useState([]);
    const [reseñas, setReseñas] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const perfilData = await perfilService.getPerfilPublico(id);
            setPerfil(perfilData);

            const catalogoData = await catalogoService.getCatalogosByUser(id);
            setCatalogo(catalogoData);

            const articuloData = await articuloService.getArticulosByUser(id);
            setArticulo(articuloData);

            const subastaData = await subastaService.getSubastasByUser(id);
            setSubasta(subastaData);

            const reviewData = await reviewService.getReviewByUser(id);
            setReseñas(reviewData);

            const favoritoData = await favoriteService.checkFavorite("artista", id);
            setIsFavorite(favoritoData.isFavorite);
          
        } catch (err) {
          console.error('Error cargando datos:', err);
          setError('Error al cargar los datos');
        } finally {
          setLoading(false);
        }
    };

    const articulosPublicados = articulo.filter(item => Number(item.estado_id) === 4);
    const subastasActivas = subasta.filter(item => Number(item.estado_id) === 8);

    const user = authService.getCurrentUser();
    const isMyProfile = Number(user?.id) === Number(id);

    const agregarReseña = async (rating, review) => {
        try {
            const reviewData = {
                destinatario_id: parseInt(id),
                compra_venta_id: 0,
                compra_venta_tipo: '0',
                calificacion: rating,
                comentario: review
            };
            
            const response = await reviewService.postReview(reviewData);
            showModalMessage('¡Éxito!', response.message, 'success');
            await cargarDatos();

        } catch (error) {
            console.error('Error al guardar la reseña:', error);
            showModalMessage('Error', 'Error al guardar la reseña. Por favor, intenta de nuevo.', 'error');
        }
    };

    const editarReseña = async (reseñaId, nuevoComentario, nuevaCalificacion) => {
        try {
            const reviewdata = {
                comentario: nuevoComentario,
                calificacion: nuevaCalificacion
            };
            const response = await reviewService.putReview(reseñaId, reviewdata);
            showModalMessage('¡Actualizado!', response.message, 'success');
            await cargarDatos();

        } catch (error) {
            console.error('Error al editar reseña:', error);
            showModalMessage('Error', 'Error al editar la reseña', 'error');
        }
    };

    const eliminarReseña = async (reseñaId) => {
        try {
            const response = await reviewService.deleteReview(reseñaId);
            showModalMessage('¡Eliminado!', response.message, 'success');
            await cargarDatos();
            
        } catch (error) {
            console.error('Error al eliminar reseña:', error);
            showModalMessage('Error', 'Error al eliminar la reseña', 'error');
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
                showModalMessage('Favoritos', 'Eliminado de favoritos', 'success');
                console.log("Eliminado de favoritos");
            } else {
                await favoriteService.postFavorite({
                    tipo: "artista",
                    referencia_id: artistaId
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

    return(
    <>
        <div className="container py-4 px-5 mw-100 bg-light">
            <div className="rounded-4 shadow card-linear-gradiente-3" 
                style={{height: "130px"}}>
            </div>

            <div className="d-flex align-items-end mb-5">
                <div className="d-flex align-items-end" 
                    style={{ 
                        marginTop: "-50px",
                        marginLeft: "25px"
                        }}>
                    <div
                        className="bg-white shadow rounded-3 d-flex justify-content-center align-items-center"
                        style={{ width: "200px", height: "200px" }}>
                        <i className="bi bi-person text-warning" style={{ fontSize: "150px" }}></i>
                    </div>
                </div>

                <div className="ms-4 mt-4 mb-auto">
                    <h2 className="color-1 fw-bold mb-1">{ perfil.nombre_completo }</h2>
                    <h5 className="color-2 text-warning mb-2">{ perfil.interes }</h5>
                    <p className="color-2 text-muted small mb-0">
                    <i className="bi bi-geo-alt"></i> { perfil.ubicacion } · Miembro desde { new Date(perfil.fecha_registro).getFullYear() }
                    </p>
                </div>

                {!isMyProfile && (
                    <div className="ms-auto mb-auto mt-4">
                        <button className="btn-linear-gradient fw-bold shadow py-2 px-4 border-0 rounded-3 d-flex align-items-center mb-3"
                            onClick={() => handleFavorito(id)}>
                            <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} fs-6`}></i>
                            <span className="d-none d-xxl-inline ms-2">
                                Favorito
                            </span>
                        </button>

                        <button className="btn-linear-gradient fw-bold shadow py-2 px-4 border-0 rounded-3 d-flex align-items-center"
                            onClick={() => setShowModal(true)}>
                            <i className="bi bi-star fs-6"></i>
                            <span className="d-none d-xxl-inline ms-2">
                                Calificar
                            </span>
                        </button>
                    </div>
                )}
                
            </div>

            <div className="row">
                <div className="col-md-4 my-0">
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-body">
                            <h3 className="color-2 fw-bold mb-3">Sobre el Artista</h3>

                            <p className="color-3 text-muted mb-4">
                                { perfil.descripcion }
                            </p>

                            <div className='mb-5'>
                                <h5 className="color-1 fw-bold mb-2">Redes Sociales</h5>
                                <div className="row">
                                    <div className="col col-md-12 col-lg-4">
                                        <a className="link-offset-2 link-underline link-underline-opacity-0 color-1 fw-bold d-inline-flex justify-content-center align-items-center" 
                                            href={ perfil.instagram_handle }>
                                            <i className="bi bi-instagram me-2 fs-4"></i>
                                            Instagram
                                        </a>
                                    </div>
                                    <div className="col col-md-12 col-lg-4">
                                        <a className="link-offset-2 link-underline link-underline-opacity-0 color-1 fw-bold d-inline-flex justify-content-center align-items-center" 
                                            href={ perfil.facebook_handle }>
                                            <i className="bi bi-facebook me-2 fs-4"></i>
                                            Facebook
                                        </a>
                                    </div>
                                    <div className="col col-md-12 col-lg-4">
                                        <a className="link-offset-2 link-underline link-underline-opacity-0 color-1 fw-bold d-inline-flex justify-content-center align-items-center" 
                                            href={ perfil.twitter_handle }>
                                            <i className="bi bi-twitter me-2 fs-4"></i>
                                            Twitter
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <h4 className="color-2 fw-bold mt-5">Calificación</h4>

                            <div className="d-inline-flex align-items-center gap-2 fs-3">
                                <div className="d-flex justify-content-center align-items-center rounded-circle me-2 " style={{width: "35px", height: "35px", backgroundColor: "#FFD700"}}>
                                    <i className="bi bi-star-fill text-white fs-4"></i>
                                </div>
                                <span className="fw-bold color-2">{ perfil.calificacion_promedio } / 5.0</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-8 my-0">
                    <div className="d-flex align-items-center mb-4">
                        <div className="p-2 rounded-3 d-flex gap-2 shadow-sm " style={{ backgroundColor: '#f6d8a8' }}>
                            <button 
                            onClick={() => setFiltro('Catalogo')}
                            className={`btn rounded-3 px-4 border-0 ${filtro === 'Catalogo' ? 'bg-white shadow-sm fw-bold color-2' : 'text-muted color-2'}`}>
                            Catálogo
                            </button>
                            <button 
                            onClick={() => setFiltro('Articulos')}
                            className={`btn rounded-3 px-4 border-0 ${filtro === 'Articulos' ? 'bg-white shadow-sm fw-bold color-2' : 'text-muted color-2'}`}
                            >
                            Artículos
                            </button>
                            <button 
                            onClick={() => setFiltro('Subastas')}
                            className={`btn rounded-3 px-4 border-0 ${filtro === 'Subastas' ? 'bg-white shadow-sm fw-bold color-2' : 'text-muted color-2'}`}
                            >
                            Subastas
                            </button>
                            <button 
                            onClick={() => setFiltro('Reseñas')}
                            className={`btn rounded-3 px-4 border-0 ${filtro === 'Reseñas' ? 'bg-white shadow-sm fw-bold color-2' : 'text-muted color-2'}`}
                            >
                            Reseñas
                            </button>
                        </div>
                    </div>
                    <div className="row g-4">
                        {filtro === 'Catalogo' && (
                            <>
                                {catalogo.length > 0 ? (
                                    catalogo.map(item => (
                                        <div key={item.id} className="col-md-6 col-lg-4 animate__animated animate__fadeIn">
                                            <CatalogoCard {...item} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center py-5">
                                        <i className="bi bi-folder-x fs-1 text-muted"></i>
                                        <h5 className="mt-3 text-muted">
                                            Este usuario aún no tiene catálogos publicados
                                        </h5>
                                    </div>
                                )}
                            </>
                        )}
                        {filtro === 'Articulos' && (
                            <>
                                {articulosPublicados.length > 0 ? (
                                    articulosPublicados.map(item => (
                                        <div key={item.id} className="col-md-6 col-lg-4 animate__animated animate__fadeIn">
                                            <ArticuloCard {...item} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center py-5">
                                        <i className="bi bi-folder-x fs-1 text-muted"></i>
                                        <h5 className="mt-3 text-muted">
                                            Este usuario aún no tiene articulos publicados
                                        </h5>
                                    </div>
                                )}
                            </>
                        )}
                        {filtro === 'Subastas' && (
                            <>
                                {subastasActivas.length > 0 ? (
                                    subastasActivas.map(item => (
                                        <div key={item.id} className="col-md-6 col-lg-4 animate__animated animate__fadeIn">
                                            <SubastaCard {...item} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center py-5">
                                        <i className="bi bi-folder-x fs-1 text-muted"></i>
                                        <h5 className="mt-3 text-muted">
                                            Este usuario aún no tiene subastas publicadas
                                        </h5>
                                    </div>
                                )}
                            </>
                        )}
                        {filtro === 'Reseñas' && (
                            <>
                                {reseñas.length > 0 ? (
                                    reseñas.map(item => (
                                        <div key={item.id} className="col-md-12 col-lg-6 animate__animated animate__fadeIn">
                                            <ReseñaCard 
                                                {...item}
                                                onEditar={editarReseña}
                                                onEliminar={eliminarReseña}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center py-5">
                                        <i className="bi bi-folder-x fs-1 text-muted"></i>
                                        <h5 className="mt-3 text-muted">
                                            Este usuario aún no tiene reseñas publicadas
                                        </h5>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <RatingModal
            nombreUsuario={perfil.nombre_completo}
            showModal={showModal}
            setShowModal={setShowModal}
            onSubmit={agregarReseña}
        />

        {/* MODAL DE MENSAJES */}
        <MensajeModal
            show={modal.show}
            onHide={hideModal}
            title={modal.title}
            message={modal.message}
            type={modal.type}
        />

    </>
    )
}

export default ProfilePublic;