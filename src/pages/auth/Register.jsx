import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "/src/assets/css/styles.css";
import logo from "../../assets/img/logos/LogoSecundario.png";
import banner from "../../assets/img/logos/NovaCreattions.png";
import { authService } from '../../services/authService';

function Register() {
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!email || !contrasena) {
            setError('Por favor, completa todos los campos');
            setLoading(false);
            return;
        }

        if (contrasena.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            const userData = {
                nombre_completo: email.split('@')[0],
                email: email,
                contrasena: contrasena,
                interes: null,
                ubicacion: null
            };

            const response = await authService.register(userData);
            console.log('Registro exitoso:', response);
            setSuccess('¡Registro exitoso! Redirigiendo...');
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (err) {
            console.error('Error en registro:', err);
            if (err.message === 'El email ya está registrado') {
                setError('Este correo electrónico ya está registrado');
            } else {
                setError(err.message || 'Error al registrar usuario. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return(
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
                            <h1 className="mb-3 color-2 fs-1" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.4)" }}><strong>REGISTRO</strong></h1>
                            <p className="color-3 fs-3">Únete a miles de coleccionistas y artistas hoy mismo</p>
                        </div>
                        <form onSubmit={handleSubmit} className="w-100" style={{maxWidth: "600px", margin: "0 auto"}}>
                            
                            {error && (
                                <div className="alert alert-danger alert-dismissible fade show" role="alert" style={{ borderRadius: '10px' }}>
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {error}
                                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                                </div>
                            )}
                            
                            {success && (
                                <div className="alert alert-success alert-dismissible fade show" role="alert" style={{ borderRadius: '10px' }}>
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    {success}
                                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
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
                            <div className="card card-linear-gradiente border-0 text-white shadow-lg my-4">
                                <div className="card-body">
                                    <h5 className="fw-bold mb-2">Sistema de Tickets:</h5>
                                    <p className="mb-0 small">
                                    Al registrarte recibirás 10 tickets gratuitos. Cada acción dentro de la plataforma 
                                    consume una cantidad específica de tickets a mayor visibilidad o impacto mayor costo.
                                    </p>
                                </div>
                            </div>

                            <div className="text-center">
                                <button 
                                    className="btn btn-linear-gradient btn-lg w-100 py-2" 
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Registrando...' : 'Registrarme Ahora'}
                                </button>
                                <p className="fs-6 mt-2 color-3">¿Ya tienes una cuenta?<Link className="link-offset-2 link-underline link-underline-opacity-0 color-2" to="/login"><strong> Inicia Sesión</strong></Link></p>
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

export default Register;