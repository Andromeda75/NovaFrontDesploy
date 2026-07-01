import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import background from "/css/ocean.module.css";
import logo from "../../assets/img/logos/Logo.png";
import banner from "../../assets/img/logos/NovaCreattions.png";
import { authService } from '../../services/authService';

function Login() {
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(email, contrasena);
            console.log('Login exitoso:', response);
            
            // Obtener el rol del usuario de la respuesta
            const rolId = response.usuario.rol_id;
            const userId = response.usuario.id;
            
            console.log('Rol del usuario:', rolId);
            console.log('ID del usuario:', userId);
            
            // Redirigir según el rol
            if (rolId === 1) {
                // Administrador - redirigir a /admin/:id
                console.log('Redirigiendo a admin');
                navigate(`/admin/${userId}`);
            } else {
                // Usuario normal - redirigir a home
                console.log('Redirigiendo a home');
                navigate('/');
            }
        } catch (err) {
            console.error('Error en login:', err);
            setError(err.message || 'Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={background.loginWrapper}>
                <div className={background.oceanTop}>
                    <div className={background.waveTop}></div>
                </div>
                <div className={background.ocean}>
                    <div className={background.wave}></div>
                </div>
                <section className="vh-100 position-relative" style={{ zIndex: 1 }}>
                    <div className="container-fluid vh-100">
                        <div className="row h-100">
                            
                            <div className="col d-flex justify-content-center align-items-center">
                                <img src={banner} className="img-fluid" alt="Imagen"/>
                            </div>

                            <div className="col d-flex flex-column justify-content-center">
                                <div className="text-center">
                                    <img src={logo} className="img-fluid mb-3" alt="Imagen" width="100px"/>
                                    <h1 className="mb-3 color-2 fs-1" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.4)" }}><strong>INICIAR SESIÓN</strong></h1>
                                    <p className="color-2 fs-3">Ingresa tus credenciales para acceder a la plataforma</p>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="w-100" style={{maxWidth: "400px", margin: "0 auto"}}>
                                    
                                    {error && (
                                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                            {error}
                                            <button type="button" className="btn-close" onClick={() => setError('')}></button>
                                        </div>
                                    )}
                                    
                                    <div className="mb-3">
                                        <label className="form-label color-2 fs-5"><strong>Correo Electrónico:</strong></label>
                                        <div className="input-icon mb-3">
                                            <i className="bi bi-envelope-fill"></i>
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                placeholder="Ingresa tu correo"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <label className="form-label color-2 fs-5"><strong>Contraseña:</strong></label>
                                        <div className="input-icon mb-3">
                                            <i className="bi bi-lock-fill"></i>
                                            <input 
                                                type="password" 
                                                className="form-control" 
                                                placeholder="Ingresa tu contraseña"
                                                value={contrasena}
                                                onChange={(e) => setContrasena(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="text-end mb-3">
                                        <a className="link-offset-2 color-3" href="#">¿Olvidaste tu contraseña?</a>
                                    </div>
                                    
                                    <div className="text-center">
                                        <p className="color-3 fs-6">
                                            ¿No tienes una cuenta?
                                            <Link className="link-offset-2 link-underline link-underline-opacity-0 color-2" to="/register">
                                                <strong> Regístrate aquí</strong>
                                            </Link>
                                        </p>
                                        <button 
                                            className="btn btn-linear-gradient btn-lg w-100 py-2 mt-2" 
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Iniciando...
                                                </>
                                            ) : (
                                                'Iniciar Sesión'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

export default Login;