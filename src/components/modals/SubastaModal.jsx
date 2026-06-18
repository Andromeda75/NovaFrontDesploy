import { useState } from "react";
import { Modal } from 'react-bootstrap';

export default function SubastaModal({
    show, 
    onHide, 
    paso, 
    onChange,
    onPujaMinimaChange,
    onVideoUpload, 
    onDocumentUpload, 
    onImageUpload, 
    onRemoveImage, 
    onCrearSubasta,
    setPaso, 
    setShowErrorModal, 
    formData, 
    setFormData
}) { 

    return (
        <Modal 
            show={show}
            onHide={onHide}
            dialogClassName="modal-lg"
            contentClassName="border-0 shadow-lg overflow-hidden"
            centered
            style={{borderRadius: "25px"}}>
            <div className="p-4 text-center text-white" style={{ background: "linear-gradient(to right, #2a140a, #8d4925)" }}>
                <h2 className="fw-bold mb-1 fs-4">
                Publica tu obra maestra
                </h2>
                <p className="mb-0 small opacity-75">
                CREAR NUEVA SUBASTA
                </p>
                <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                {[1, 2, 3].map((num) => (
                    <div 
                    key={num} 
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{
                        width: "32px", 
                        height: "32px", 
                        fontSize: "0.85rem", 
                        backgroundColor: paso === num ? "#E8B767" : "white",
                        color: paso === num ? "white" : "#8d4925"
                    }}
                    >
                    {num}
                    </div>
                ))}
                </div>
            </div>

            <div className="modal-body p-4 bg-white" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                {/* Paso 1: Información Básica */}
                {paso === 1 && (
                <div className="row g-3 animate__animated animate__fadeIn">
                    <div className="col-12 text-start">
                    <h5 className="fw-bold mb-3 color-1">Información Básica</h5>

                    <div className="mb-3">
                        <label className="fw-bold mb-1 small color-2">Título de la Obra</label>
                        <input
                        type="text"
                        name="titulo"
                        className="form-control form-control-sm rounded-pill border-2"
                        placeholder="Ej: Escultura Orgánica de Nogal"
                        value={formData.titulo}
                        onChange={onChange}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="fw-bold mb-1 small color-2">Categoría</label>
                        <select 
                        name="categoria"
                        className="form-select form-select-sm rounded-pill border-2"
                        value={formData.categoria}
                        onChange={onChange}
                        >
                        <option value="">Selecciona una categoría</option>
                        <option>ARTE VISUAL</option>
                        <option>ARTE DIGITAL</option>
                        <option>FOTOGRAFÍA</option>
                        <option>ESCULTURA</option>
                        <option>ARTESANÍAS</option>
                        <option>COLECCIONABLES</option>
                        </select>
                    </div>

                    <div>
                        <label className="fw-bold mb-1 small color-2">Descripción Detallada</label>
                        <textarea
                        name="descripcion"
                        className="form-control rounded-3 border-2 small"
                        rows="3"
                        placeholder="Cuéntanos la historia de tu pieza..."
                        value={formData.descripcion}
                        onChange={onChange}
                        />
                    </div>
                    </div>
                </div>
                )}

                {/* Paso 2: Multimedia */}
                {paso === 2 && (
                <div className="animate__animated animate__fadeIn text-start">
                    <h5 className="fw-bold mb-1 color-1">Multimedia</h5>
                    <p className="small text-muted mb-4">Fotos, video y certificado para verificación.</p>

                    <div className="row g-4">
                    {/* Subir Fotos */}
                    <div className="col-md-6">
                        <div className="border rounded-4 p-4 bg-white shadow-sm" style={{ border: '1px solid #e0e0e0' }}>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="bg-light rounded-3 p-2">
                            <i className="bi bi-images fs-3 color-2"></i>
                            </div>
                            <div>
                            <h6 className="fw-bold mb-1 color-1">Subir Fotos</h6>
                            <p className="text-muted small mb-0">Mínimo 3 fotos de alta resolución</p>
                            </div>
                        </div>
                        
                        <div className="row g-2">
                            {[0, 1, 2].map((index) => (
                            <div className="col-4" key={index}>
                                <div
                                className="border rounded-3 position-relative"
                                style={{ 
                                    height: "80px",
                                    backgroundImage: formData.imagenes[index] ? `url(${formData.imagenes[index]})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundColor: formData.imagenes[index] ? 'transparent' : '#f8f9fa',
                                    cursor: formData.imagenes[index] ? 'default' : 'pointer',
                                    overflow: 'hidden'
                                }}
                                >
                                {formData.imagenes[index] ? (
                                    <>
                                    <img 
                                        src={formData.imagenes[index]} 
                                        alt={`Foto ${index + 1}`}
                                        style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                        }}
                                    />
                                    <button 
                                        type="button"
                                        className="btn btn-sm rounded-circle bg-white position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center shadow-sm"
                                        style={{ width: '22px', height: '22px', padding: 0, zIndex: 2 }}
                                        onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveImage(index);
                                        }}
                                    >
                                        <i className="bi bi-x small"></i>
                                    </button>
                                    </>
                                ) : (
                                    <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="position-absolute w-100 h-100 opacity-0"
                                        style={{ top: 0, left: 0, cursor: 'pointer', zIndex: 2 }}
                                        onChange={(e) => onImageUpload(e, index)}
                                    />
                                    <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100">
                                        <i className="bi bi-plus-circle fs-5 color-2"></i>
                                        <small className="text-muted" style={{ fontSize: "0.6rem" }}>Foto {index + 1}</small>
                                    </div>
                                    </>
                                )}
                                </div>
                            </div>
                            ))}
                        </div>
                        </div>
                    </div>

                    {/* Video de Verificación */}
                    <div className="col-md-6">
                        <div className="border rounded-4 p-4 bg-white shadow-sm" style={{ border: '1px solid #e0e0e0' }}>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="bg-light rounded-3 p-2">
                            <i className="bi bi-camera-video fs-3 color-2"></i>
                            </div>
                            <div>
                            <h6 className="fw-bold mb-1 color-1">Video de Verificación</h6>
                            <p className="text-muted small mb-0">Obligatorio (máx. 30 seg)</p>
                            </div>
                        </div>
                        
                        <div
                            className="border rounded-3 d-flex flex-column align-items-center justify-content-center bg-light position-relative"
                            style={{ 
                            height: "80px",
                            backgroundColor: formData.video ? '#e8f5e9' : '#f8f9fa',
                            cursor: formData.video ? 'default' : 'pointer',
                            overflow: 'hidden'
                            }}
                        >
                            {formData.video ? (
                            <>
                                <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-check-circle-fill text-success"></i>
                                <span className="text-muted small">Video cargado</span>
                                </div>
                                <button 
                                type="button"
                                className="btn btn-sm rounded-circle bg-white position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center shadow-sm"
                                style={{ width: '22px', height: '22px', padding: 0 }}
                                onClick={() => setFormData(prev => ({...prev, video: null}))}
                                >
                                <i className="bi bi-x small"></i>
                                </button>
                            </>
                            ) : (
                            <>
                                <input
                                type="file"
                                accept="video/*"
                                className="position-absolute w-100 h-100 opacity-0"
                                style={{ top: 0, left: 0, cursor: 'pointer' }}
                                onChange={onVideoUpload}
                                />
                                <i className="bi bi-upload fs-5 color-2"></i>
                                <small className="text-muted">Haz clic para subir</small>
                            </>
                            )}
                        </div>
                        </div>
                    </div>

                    {/* Documento PDF */}
                    <div className="col-md-12">
                        <div className="border rounded-4 p-4 bg-white shadow-sm" style={{ border: '1px solid #e0e0e0' }}>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="bg-light rounded-3 p-2">
                            <i className="bi bi-file-pdf fs-3 color-2"></i>
                            </div>
                            <div>
                            <h6 className="fw-bold mb-1 color-1">Documento</h6>
                            <p className="text-muted small mb-0">Certificado / Constancia (PDF)</p>
                            </div>
                        </div>
                        
                        <div
                            className="border rounded-3 d-flex flex-column align-items-center justify-content-center bg-light position-relative"
                            style={{ 
                            height: "80px",
                            backgroundColor: formData.documento ? '#e8f5e9' : '#f8f9fa',
                            cursor: formData.documento ? 'default' : 'pointer'
                            }}
                        >
                            {formData.documento ? (
                            <>
                                <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-file-earmark-pdf-fill text-danger"></i>
                                <span className="text-muted small">PDF cargado</span>
                                </div>
                                <button 
                                type="button"
                                className="btn btn-sm rounded-circle bg-white position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center shadow-sm"
                                style={{ width: '22px', height: '22px', padding: 0 }}
                                onClick={() => setFormData(prev => ({...prev, documento: null}))}
                                >
                                <i className="bi bi-x small"></i>
                                </button>
                            </>
                            ) : (
                            <>
                                <input
                                type="file"
                                accept=".pdf"
                                className="position-absolute w-100 h-100 opacity-0"
                                style={{ top: 0, left: 0, cursor: 'pointer' }}
                                onChange={onDocumentUpload}
                                />
                                <i className="bi bi-upload fs-5 color-2"></i>
                                <small className="text-muted">Haz clic para subir</small>
                            </>
                            )}
                        </div>
                        </div>
                    </div>
                    </div>

                    {formData.imagenes.length < 3 && (
                    <div className="alert alert-warning mt-4 small rounded-3" style={{ border: '1px solid #ffeeba', background:"#fff3cd" }}>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Debes subir al menos <strong>3 fotos</strong> para continuar
                    </div>
                    )}
                </div>
                )}

                {/* Paso 3: Precio y Duración */}
                {paso === 3 && (
                <div className="animate__animated animate__fadeIn text-start">
                    <h5 className="fw-bold mb-1 color-1">Precio y Duración</h5>

                    <div className="row mb-4">
                    <div className="col-6">
                        <label className="fw-bold mb-1 small color-2">Precio Inicial (MXN)</label>
                        <input
                        type="text"
                        name="precio"
                        className="form-control p-3 border-color-1"
                        placeholder="$ 0.00"
                        value={formData.precio}
                        onChange={onChange}
                        style={{ borderRadius: "12px" }}
                        />
                    </div>

                    <div className="col-6">
                        <label className="fw-bold mb-1 small color-2">Duración de la Subasta</label>
                        <div className="input-group">
                        <span className="input-group-text border-color-1 bg-light" style={{ borderRadius: "12px 0 0 12px" }}>
                            <i className="bi bi-calendar-event"></i>
                        </span>
                        <select 
                            name="duracion"
                            className="form-select p-3 border-color-1"
                            value={formData.duracion}
                            onChange={onChange}
                        >
                            <option>72 Horas</option>
                            <option>48 Horas</option>
                            <option>24 Horas</option>
                        </select>
                        </div>
                    </div>
                    </div>

                    <div className="form-check mb-3">
                    <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="terminos"
                        name="terminos"
                        checked={formData.terminos}
                        onChange={onChange}
                    />
                    <label className="form-check-label small fw-bold color-2" htmlFor="terminos">
                        Acepto los términos de la subasta y las comisiones de la plataforma (3%)
                    </label>
                    </div>

                    <label className="fw-bold mb-2 small color-2">Puja Mínima (selecciona una)</label>
                    <div className="d-flex gap-4 mb-3 flex-wrap">
                    {[200, 500, 1000, 1500, 2000].map((monto, index) => (
                        <div key={index} className="form-check">
                        <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`puja${index}`}
                            checked={formData.pujaMinima === monto}
                            onChange={() => onPujaMinimaChange(monto)}
                        />
                        <label className="form-check-label small color-2" htmlFor={`puja${index}`}>
                            $ {monto.toLocaleString("es-MX")}.00
                        </label>
                        </div>
                    ))}
                    </div>

                    <div
                    className="alert py-2 px-3 small border-0 color-2"
                    style={{ backgroundColor: "#f6d8a8", borderRadius: "12px" }}
                    >
                    <h6 className="fw-bold mb-1">
                        <i className="bi bi-shield-check me-2"></i>
                        Tu seguridad es nuestra prioridad
                    </h6>
                    <p className="mb-0">
                        Todos los artículos pasan por un proceso de verificación manual.
                        Una vez aprobado, recibirás una notificación y tu pieza aparecerá
                        en el feed principal.
                    </p>
                    </div>
                </div>
                )}
            </div>

            <div className="modal-footer border-0 p-3 d-flex justify-content-between">
                {paso > 1 ? (
                <button
                    className="btn-linear-gradient py-2 px-3"
                    style={{ borderRadius: "8px", fontSize: "0.85rem" }}
                    onClick={() => setPaso(paso - 1)}
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Anterior
                </button>
                ) : (
                <button
                    className="btn-linear-gradient py-2 px-3"
                    style={{ borderRadius: "8px", fontSize: "0.85rem" }}
                    onClick={onHide}
                >
                    Cancelar
                </button>
                )}

                {paso < 3 ? (
                <button
                    className="btn-linear-gradient py-2 px-3"
                    style={{ borderRadius: "8px", fontSize: "0.85rem" }}
                    onClick={() => {
                    if (paso === 2 && formData.imagenes.length < 3) {
                        setShowErrorModal(true);
                    } else {
                        setPaso(paso + 1);
                    }
                    }}
                >
                    Siguiente
                    <i className="bi bi-arrow-right ms-1"></i>
                </button>
                ) : (
                <div className="d-flex align-items-center gap-3">
                    <span className="badge px-3 py-2 rounded-pill fw-bold small color-2" style={{ backgroundColor: "#f6d8a8" }}>
                    - 50 Tickets
                    </span>
                    <button
                    className="btn-linear-gradient py-2 px-3"
                    style={{ borderRadius: "8px", fontSize: "0.85rem" }}
                    onClick={onCrearSubasta}
                    >
                    Publicar
                    <i className="bi bi-check-lg ms-1"></i>
                    </button>
                </div>
                )}
            </div>
        
        </Modal>
    )
}