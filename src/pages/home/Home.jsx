import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Carousel } from 'bootstrap';

import Category from '../../components/categories/Category.jsx';
import SubastaCard from '../../components/cards/subastas/SubastaCardv2.jsx';
import ArtistaCard from '../../components/cards/ArtistaCard.jsx';

import SubastaModal from "../../components/modals/SubastaModal.jsx";
import ArticuloModal from "../../components/modals/ArticuloModal.jsx";
import ErrorImagenesModal from "../../components/modals/ErrorImagenesModal.jsx";

import { perfilService } from '../../services/perfilService';
import { subastaService } from '../../services/subastaService';
import { articuloService } from "../../services/articuloService";
import { monetizacionService } from "../../services/monetizacionService.js";

import MensajeModal from '../../components/modals/MensajeModal.jsx';
import { useModal } from '../../components/modals/useModal.jsx';

function Home() {

    const { id } = useParams();
    const { modal, showModal, hideModal } = useModal();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [perfil, setPerfil] = useState([]);
    const [subasta, setSubasta] = useState([]);
    const [publicidades, setPublicidades] = useState([]);

    const [paso, setPaso] = useState(1);
    const [showSubastaModal, setShowSubastaModal] = useState(false);
    const [showArticuloModal, setShowArticuloModal] = useState(false);
    const [showErrorImagenesModal, setShowErrorImagenesModal] = useState(false);
    
    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        const carouselElement = document.querySelector('#homeBannerCarousel');

        if (carouselElement) {
            new Carousel(carouselElement, {
                interval: 4000,
                ride: 'carousel'
            });
        }
    }, [publicidades]);

const cargarDatos = async () => {
    setLoading(true);
    try {
        const publicidadesData = await monetizacionService.getPublicidadPublica();
        
        // 🔧 CORREGIR URLs: Si vienen del backend, reemplazar con la URL del frontend
        const publicidadesCorregidas = publicidadesData.map(item => {
            if (item.imagen_url && item.imagen_url.includes('onrender.com')) {
                // Extraer solo la ruta relativa
                const urlParts = item.imagen_url.split('/uploads/');
                if (urlParts.length > 1) {
                    item.imagen_url = '/uploads/' + urlParts[1];
                }
            }
            return item;
        });
        
        console.log('📢 URLs corregidas:', publicidadesCorregidas);
        setPublicidades(publicidadesCorregidas);
    } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos');
    } finally {
        setLoading(false);
    }
};
    const mostrarSubastas = (array, tamaño) => {
    const grupos = [];
        for (let i = 0; i < array.length; i += tamaño) {
            grupos.push(array.slice(i, i + tamaño));
        }
        return grupos;
    };

    const subastasFiltradas = subasta.filter(s => s.estado_id === 8);;
    const subastasAgrupadas = mostrarSubastas(subastasFiltradas, 3);

    const initialSubasta = {
        titulo: '',
        categoria: '',
        descripcion: '',
        precio: '',
        duracion: '72 Horas',
        pujaMinima: null,
        terminos: false,
        imagenes: [],
        video: null,
        documento: null
    };

    const initialArticulo = {
        titulo: "",
        categoria: "",
        descripcion: "",
        precio: "",
        imagenes: [],
        video: null,
        documento: null
    };

    const [formData, setFormData] = useState(initialSubasta);

    const handleOpenSubastaModal = () => {
        setPaso(1);
        setFormData(initialSubasta);
        setShowSubastaModal(true);
    };

    const handleCloseSubastaModal = () => {
        setPaso(1);
        setFormData(initialSubasta);
        setShowSubastaModal(false);
    };

    const handleOpenArticuloModal = () => {
        setPaso(1);
        setFormData(initialArticulo);
        setShowArticuloModal(true);
    };

    const handleCloseArticuloModal = () => {
        setPaso(1);
        setFormData(initialArticulo);
        setShowArticuloModal(false);
    };

    const handleCrearSubasta = async () => {
        if (!formData.titulo.trim()) {
            showModal('Atención', 'Por favor, ingresa un título para la obra', 'warning');
            return;
        }
    
        if (!formData.categoria) {
            showModal('Atención', 'Por favor, selecciona una categoría', 'warning');
            return;
        }
    
        if (!formData.descripcion.trim()) {
            showModal('Atención', 'Por favor, ingresa una descripción', 'warning');
            return;
        }
    
        if (formData.imagenes.length < 3) {
            setShowErrorImagenesModal(true);
            return;
        }
    
        if (!formData.terminos) {
            showModal('Atención', 'Debes aceptar los términos y condiciones', 'warning');
            return;
        }
    
        const categoriaMap = {
            'ARTE VISUAL': 1,
            'ARTE DIGITAL': 2,
            'FOTOGRAFÍA': 3,
            'ESCULTURA': 4,
            'ARTESANÍAS': 5,
            'COLECCIONABLES': 6
        };
    
        const categoriaId = categoriaMap[formData.categoria];
    
        if (!categoriaId) {
            showModal('Error', 'Categoría no válida', 'error');
            return;
        }

        const dataToSend = {
            titulo: formData.titulo.trim(),
            categoria_id: categoriaId,
            descripcion: formData.descripcion.trim(),
            precio_inicial: parseFloat(formData.precio) || 0,
            puja_minima: formData.pujaMinima || 0,
            duracion_horas: formData.duracion === '24 Horas' ? 24 : formData.duracion === '48 Horas' ? 48 : 72,
            imagenes: formData.imagenes,
            video: formData.video || null,
            documento: formData.documento || null
        };
    
        console.log('Enviando datos:', dataToSend);
    
        try {
            const response = await subastaService.crearSubasta(dataToSend);
            console.log('Respuesta:', response);
            await cargarDatos();
            handleCloseSubastaModal();
            showModal('¡Éxito!', 'Subasta creada exitosamente', 'success');
        } catch (error) {
            console.error('Error creando subasta:', error);
            console.error('Detalles del error:', error.response?.data);
            showModal('Error', error.response?.data?.message || 'Error al crear la subasta', 'error');
        }
    };

    const handlePublicarArticulo = async () => {
        if (!formData.titulo.trim()) {
            showModal('Atención', 'Por favor, ingresa un título para el artículo', 'warning');
            return;
        }
    
        if (!formData.categoria) {
            showModal('Atención', 'Por favor, selecciona una categoría', 'warning');
            return;
        }
    
        if (!formData.descripcion.trim()) {
            showModal('Atención', 'Por favor, ingresa una descripción', 'warning');
            return;
        }
    
        if (!formData.precio || parseFloat(formData.precio) <= 0) {
            showModal('Atención', 'Por favor, ingresa un precio válido', 'warning');
            return;
        }
    
        if (formData.imagenes.length < 3) {
            setShowErrorImagenesModal(true);
            return;
        }

        const categoriaMap = {
            'ARTE VISUAL': 1,
            'ARTE DIGITAL': 2,
            'FOTOGRAFÍA': 3,
            'ESCULTURA': 4,
            'ARTESANÍAS': 5,
            'COLECCIONABLES': 6
        };
    
        const categoriaId = categoriaMap[formData.categoria];
    
        if (!categoriaId) {
            showModal('Error', 'Categoría no válida', 'error');
            return;
        }

        const dataToSend = {
            titulo: formData.titulo.trim(),
            categoria_id: categoriaId,
            descripcion: formData.descripcion.trim(),
            precio_mxn: parseFloat(formData.precio),
            imagenes: formData.imagenes,
            video: formData.video || null,
            documento: formData.documento || null
        };
    
        try {
            const response = await articuloService.crearArticulo(dataToSend);
            console.log('Respuesta:', response);
            await cargarDatos();
            handleCloseArticuloModal();
            showModal('¡Éxito!', 'Artículo publicado exitosamente', 'success');
        } catch (err) {
            console.error('Error publicando artículo:', err);
            showModal('Error', err.response?.data?.message || 'Error al publicar el artículo', 'error');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePujaMinimaChange = (monto) => {
        setFormData(prev => ({
        ...prev,
        pujaMinima: prev.pujaMinima === monto ? null : monto
        }));
    };

    const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('video/')) {
                showModal('Atención', 'Por favor, selecciona un archivo de video válido', 'warning');
                return;
            }

            if (file.size > 50 * 1024 * 1024) {
                showModal('Atención', 'El video no debe superar los 50MB', 'warning');
                return;
            }

            const video = document.createElement('video');
            video.preload = 'metadata';
            
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > 30) {
                    showModal('Atención', 'El video no debe durar más de 30 segundos', 'warning');
                    return;
                }
                
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({
                        ...prev,
                        video: reader.result
                    }));
                };
                reader.readAsDataURL(file);
            };

            video.src = URL.createObjectURL(file);
        }
    };

    const handleDocumentUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                showModal('Atención', 'Por favor, selecciona un archivo PDF válido', 'warning');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                showModal('Atención', 'El documento no debe superar los 10MB', 'warning');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    documento: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showModal('Atención', 'Por favor, selecciona un archivo de imagen válido', 'warning');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showModal('Atención', 'La imagen no debe superar los 5MB', 'warning');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => {
                    const nuevasImagenes = [...prev.imagenes];
                    nuevasImagenes[index] = reader.result;
                    return {
                        ...prev,
                        imagenes: nuevasImagenes
                    };
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
        ...prev,
        imagenes: prev.imagenes.filter((_, i) => i !== index)
        }));
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
        <div className="container py-4 px-5 mw-100 bg-light homeBody">
            <Category></Category>
            <div 
                id="homeBannerCarousel" 
                className="carousel slide mb-4"
                >
                <div className="carousel-inner rounded">
                    
                    {publicidades.length > 0 ? (
                        publicidades.map((item, index) => (
                            <div
                                key={item.id || index}
                                className={`carousel-item ${index === 0 ? 'active' : ''}`}
                            >
                                <div className="position-relative">
                                
                                    <img
                                        src={item.imagen_url}
                                        className="d-block w-100"
                                        alt={`Banner ${index + 1}`}
                                        style={{
                                        height: "500px",
                                        objectFit: "cover"
                                        }}
                                    />

                                    {/* CONTENIDO ENCIMA DEL BANNER */}
                                    <div className="carousel-caption d-flex flex-column justify-content-end align-items-start text-end"
                                    style={{
                                        top: "20px",
                                        right: "auto",
                                        left: "20px",
                                        bottom: "auto"
                                    }}>
                                        
                                        <div className="card card-transparent border-0 p-4">
                                        
                                            <h1 className="color-2 fonts-size-title mb-3">
                                                Tres formas de disfrutar nuestra plataforma.
                                            </h1>

                                            <div className="d-flex align-items-start gap-3 flex-wrap">
                                                
                                                <button
                                                className="btn btn-2 text-white fw-bold d-inline-flex justify-content-center align-items-center"
                                                onClick={handleOpenSubastaModal}
                                                >
                                                <i className="bi bi-plus-circle fs-5"></i>
                                                <span className="d-none d-md-inline ms-2">
                                                    Crear Subasta
                                                </span>
                                                </button>

                                                <button
                                                className="btn btn-2 text-white fw-bold d-inline-flex justify-content-center align-items-center"
                                                onClick={handleOpenArticuloModal}
                                                >
                                                <i className="bi bi-box-arrow-up fs-5"></i>
                                                <span className="d-none d-md-inline ms-2">
                                                    Subir Artículo
                                                </span>
                                                </button>

                                                <Link
                                                to="/peticiones"
                                                className="btn btn-2 text-white fw-bold d-inline-flex justify-content-center align-items-center"
                                                >
                                                <i className="bi bi-send fs-5"></i>
                                                <span className="d-none d-md-inline ms-2">
                                                    Peticiones
                                                </span>
                                                </Link>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <i className="bi bi-folder-x fs-1 text-muted"></i>
                            <h5 className="mt-3 text-muted">
                                No hay anuncios activos por el momento.
                            </h5>
                        </div>
                    )}
                </div>
                
            </div>
            <div className='mb-4'>
                <h1 className="color-2 fw-bold display-3 mb-2">Subastas</h1>
                <p className="color-3 fonts-size-subtitle mb-4">
                No pierdas la oportunidad de entrar a Eventos Especiales.
                </p>
                <div id="carouselHome" className="carousel slide">
                    <div className="carousel-inner">
                            {subastasAgrupadas.length > 0 ? (
                                subastasAgrupadas.map((grupo, index) => (
                                    <div 
                                        key={index} 
                                        className={`carousel-item ${index === 0 ? 'active' : ''}`}
                                    >
                                        <div className="container">
                                            <div className="row gy-3">
                                                
                                                {grupo.map((item) => (
                                                    <div key={item.id} className="col-md-4">
                                                        <SubastaCard {...item} isPage={true}/>
                                                    </div>
                                                ))}

                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-12 text-center py-5">
                                    <i className="bi bi-folder-x fs-1 text-muted"></i>
                                    <h5 className="mt-3 text-muted">
                                        No hay subastas activas por el momento.
                                    </h5>
                                </div>
                            )}
                    </div>
                    <button className="carousel-control-prev color-2" type="button" data-bs-target="#carouselHome" data-bs-slide="prev">
                        <span aria-hidden="true">
                            <i className="bi bi-caret-left-fill fs-1"></i>
                        </span>
                    </button>
                    <button className="carousel-control-next color-2" type="button" data-bs-target="#carouselHome" data-bs-slide="next">
                        <span aria-hidden="true">
                            <i className="bi bi-caret-right-fill fs-1"></i>
                        </span>
                    </button>
                </div>
            </div>
            <div className="card bg-color-4 border-0 shadow-sm text-white mt-5 rounded-4">
                <div className="card-body">
                    <h1 className="fw-bold display-5 mb-1">Artistas Destacados</h1>
                    <p className="fonts-size-text mb-3">
                    Talentos con mejores calificaciones.
                    </p>
                    <div className="row g-3">
                        {perfil.length > 0 ? (

                            perfil.slice(0, 6).map(item => (
                                <ArtistaCard key={item.id} {...item} />
                            ))

                        ) : (

                            <div className="col-12 text-center py-5">
                                <i className="bi bi-folder-x fs-1 text-muted"></i>
                                <h5 className="mt-3 text-muted">
                                    Por el momento no hay artistas destacados.
                                </h5>
                            </div>

                        )}
                    </div>        
                </div>
            </div>
        </div>

        <SubastaModal
            show={showSubastaModal} 
            onHide={handleCloseSubastaModal}
            paso={paso}
            setPaso={setPaso}
            setShowErrorModal={setShowErrorImagenesModal}
            formData={formData}
            setFormData={setFormData}
            onChange={handleInputChange}
            onPujaMinimaChange={handlePujaMinimaChange}
            onVideoUpload={handleVideoUpload}
            onDocumentUpload={handleDocumentUpload}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
            onCrearSubasta={handleCrearSubasta}

        />

        <ArticuloModal
            show={showArticuloModal} 
            onHide={handleCloseArticuloModal}
            paso={paso}
            setPaso={setPaso}
            setShowErrorModal={setShowErrorImagenesModal}
            formData={formData}
            setFormData={setFormData}
            onChange={handleInputChange}
            onPujaMinimaChange={handlePujaMinimaChange}
            onVideoUpload={handleVideoUpload}
            onDocumentUpload={handleDocumentUpload}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
            onPublicarArticulo={handlePublicarArticulo}

        />

        <ErrorImagenesModal
            show={showErrorImagenesModal}
            setShowErrorModal={setShowErrorImagenesModal}
            formData={formData}
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

export default Home;