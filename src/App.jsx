// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { authService } from './services/authService';
import TerminosModal from './components/modals/TerminosModal';

import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

import MainLayout from "./layouts/MainLayout.jsx";

import Home from './pages/home/Home.jsx';
import Tickets from './pages/tickets/Tickets.jsx';
import MuroPeticiones from './pages/peticiones/MuroPeticiones.jsx';
import DetallePeticion from './pages/peticiones/DetallePeticion.jsx';

import CategoriaAV from './pages/categories/CategoriaA_V.jsx';
import CategoriaAD from './pages/categories/CategoriaA_D.jsx';
import CategoriaF from './pages/categories/CategoriaF.jsx';
import CategoriaE from './pages/categories/CategoriaE.jsx';
import CategoriaA from './pages/categories/CategoriaA.jsx';
import CategoriaC from './pages/categories/CategoriaC.jsx';

import VistaSubasta from './pages/subastas/vistasubasta.jsx';
import VistaSubasta1 from './pages/subastas/vistasubasta1.jsx';
import VistaSubasta2 from './pages/subastas/vistasubasta2.jsx';
import VistaSubasta3 from './pages/subastas/vistasubasta3.jsx';
import VistaSubasta4 from './pages/subastas/vistasubasta4.jsx';
import VistaSubasta5 from './pages/subastas/vistasubasta5.jsx';
import VistaSubasta6 from './pages/subastas/vistasubasta6.jsx';
import SubastaDetalle from './pages/subastas/SubastaDetalle.jsx';
import PagoGanador from './pages/subastas/PagoGanador.jsx';

// ========== NUEVA IMPORTACIÓN: PÁGINA DE NOTIFICACIONES ==========
import PaginaNotificaciones from './pages/notificaciones/PaginaNotificaciones.jsx';

import VistaArticulo from './pages/articulos/vistaarticulo.jsx';
import ArticuloDetalle from './pages/articulos/ArticuloDetalle.jsx';

import CatalogoDetalle from './pages/catalogos/CatalogoDetalle.jsx';

import PerfilHome from './pages/profile/public/ProfilePrivate.jsx';
import ProfilePublic from './pages/profile/public/ProfilePublic.jsx';
import ProfileAdmin from './pages/profile/admin/ProfileAdmin.jsx';

import ProfilePublicCatalogo from './pages/profile/public/PerfilCatalogo.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';

import TicketsSuccess from './pages/tickets/TicketsSuccess.jsx';
import TicketsCancel from './pages/tickets/TicketsCancel.jsx';
import SearchResults from './pages/search/SearchResults';

import NoPermission from './components/NoPermission.jsx';

function App() {
    const [showTerminos, setShowTerminos] = useState(false);
    const [loadingTerminos, setLoadingTerminos] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                if (!authService.terminosAceptados()) {
                    setShowTerminos(true);
                }
            }
        };
        checkUser();
    }, []);

    // ========== MANEJAR ACEPTACIÓN DE TÉRMINOS ==========
    const handleAcceptTerms = async () => {
        console.log('🟢 Aceptando términos...');
        setLoadingTerminos(true);
        try {
            await authService.aceptarTerminos();
            console.log('✅ Términos aceptados correctamente');
            setShowTerminos(false);
            setLoadingTerminos(false);
        } catch (error) {
            console.error('❌ Error al aceptar términos:', error);
            
            // ✅ SIEMPRE CERRAR EL MODAL Y ACTUALIZAR LOCALSTORAGE
            const currentUser = JSON.parse(localStorage.getItem('usuario'));
            if (currentUser) {
                currentUser.terminos_aceptados = true;
                localStorage.setItem('usuario', JSON.stringify(currentUser));
            }
            
            setShowTerminos(false);
            setLoadingTerminos(false);
            
            // Mostrar mensaje solo si es un error diferente a "ya aceptó"
            if (error.response?.data?.message !== 'Ya has aceptado los términos y condiciones anteriormente') {
                alert('Error al aceptar términos: ' + (error.response?.data?.message || 'Error de conexión'));
            }
        }
    };

    return (
        <>
            <BrowserRouter>
                <Routes>
                    {/* RUTAS PÚBLICAS - Previsualización, NO requieren login */}
                    <Route path="/" element={<MainLayout><Home /></MainLayout>} />
                    <Route path="/buscar" element={<MainLayout><SearchResults /></MainLayout>} />
                    
                    {/* Categorías - PÚBLICAS (solo previsualización) */}
                    <Route path="/ArteVisual" element={<MainLayout><CategoriaAV /></MainLayout>} />
                    <Route path="/ArteDigital" element={<MainLayout><CategoriaAD /></MainLayout>} />
                    <Route path="/Fotografia" element={<MainLayout><CategoriaF /></MainLayout>} />
                    <Route path="/Escultura" element={<MainLayout><CategoriaE /></MainLayout>} />
                    <Route path="/Artesania" element={<MainLayout><CategoriaA /></MainLayout>} />
                    <Route path="/Coleccionables" element={<MainLayout><CategoriaC /></MainLayout>} />
                    
                    {/* Subastas individuales - PÚBLICAS (solo ver detalles) */}
                    <Route path="/subasta" element={<MainLayout><VistaSubasta /></MainLayout>} />
                    <Route path="/subasta:1" element={<MainLayout><VistaSubasta1 /></MainLayout>} />
                    <Route path="/subasta:2" element={<MainLayout><VistaSubasta2 /></MainLayout>} />
                    <Route path="/subasta:3" element={<MainLayout><VistaSubasta3 /></MainLayout>} />
                    <Route path="/subasta:4" element={<MainLayout><VistaSubasta4 /></MainLayout>} />
                    <Route path="/subasta:5" element={<MainLayout><VistaSubasta5 /></MainLayout>} />
                    <Route path="/subasta:6" element={<MainLayout><VistaSubasta6 /></MainLayout>} />
                    <Route path="/subasta/:id" element={<MainLayout><SubastaDetalle /></MainLayout>} />
                    
                    {/* ========== RUTA: PAGO DEL GANADOR ========== */}
                    <Route path="/subasta/:id/pago" element={<ProtectedRoute><MainLayout><PagoGanador /></MainLayout></ProtectedRoute>} />

                    {/* ========== NUEVA RUTA: PÁGINA DE NOTIFICACIONES ========== */}
                    <Route path="/notificaciones" element={
                        <ProtectedRoute>
                            <MainLayout><PaginaNotificaciones /></MainLayout>
                        </ProtectedRoute>
                    } />
                    
                    {/* Artículos individuales - PÚBLICOS (solo ver detalles) */}
                    <Route path="/articulo" element={<MainLayout><VistaArticulo /></MainLayout>} />
                    <Route path="/articulo/:id" element={<MainLayout><ArticuloDetalle /></MainLayout>} />
                    
                    {/* Catálogos públicos - PÚBLICOS */}
                    <Route path="/catalogo/:id" element={<MainLayout><CatalogoDetalle /></MainLayout>} />

                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />
                    <Route path="/register" element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    } />

                    {/* RUTAS PROTEGIDAS - Requieren autenticación */}
                    
                    {/* Tickets */}
                    <Route path="/tickets" element={
                        <ProtectedRoute>
                            <MainLayout><Tickets /></MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/tickets/success" element={
                        <ProtectedRoute>
                            <MainLayout><TicketsSuccess /></MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/tickets/cancel" element={
                        <MainLayout><TicketsCancel /></MainLayout>
                    } />
                    
                    {/* Peticiones (interacción) */}
                    <Route path="/peticiones" element={
                        <ProtectedRoute>
                            <MainLayout><MuroPeticiones /></MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/peticiones/:id" element={
                        <ProtectedRoute>
                            <MainLayout><DetallePeticion /></MainLayout>
                        </ProtectedRoute>
                    } />

                    {/* Perfiles privados */}
                    <Route path="/perfil/:id" element={
                        <ProtectedRoute>
                            <MainLayout><PerfilHome /></MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/profile/public/:id" element={
                        <ProtectedRoute>
                            <MainLayout><ProfilePublic /></MainLayout>
                        </ProtectedRoute>
                    } />
                    
                    {/* 🟢 ADMIN - Ahora solo protege que esté autenticado, 
                        la verificación de rol se hará dentro del componente */}
                    <Route path="/admin/:id" element={
                        <ProtectedRoute>
                            <MainLayout><ProfileAdmin /></MainLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/profile/public/catalogo/:id" element={
                        <ProtectedRoute>
                            <MainLayout><ProfilePublicCatalogo /></MainLayout>
                        </ProtectedRoute>
                    } />

                    {/* ========== RUTA DE ACCESO DENEGADO ========== */}
                    <Route path="/sin-permiso" element={
                        <MainLayout>
                            <NoPermission 
                                title="Acceso denegado"
                                message="No tienes permisos para acceder a esta sección. Si crees que esto es un error, contacta al administrador."
                                backText="Volver al inicio"
                                backPath="/"
                                icon="bi-shield-lock"
                            />
                        </MainLayout>
                    } />

                    {/* Ruta 404 */}
                    <Route path="*" element={
                        <MainLayout>
                            <NoPermission 
                                title="404 - Página no encontrada"
                                message="La página que buscas no existe o ha sido movida."
                                backText="Volver al inicio"
                                backPath="/"
                                icon="bi-exclamation-triangle-fill"
                            />
                        </MainLayout>
                    } />
                </Routes>
            </BrowserRouter>
            
            <TerminosModal
                show={showTerminos}
                onAccept={handleAcceptTerms}
                loading={loadingTerminos}
            />
        </>
    );
}

export default App;