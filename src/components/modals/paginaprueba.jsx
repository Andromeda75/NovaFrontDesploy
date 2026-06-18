import React, { useState } from 'react';
import PagoRealizado from './pago_realizado';
import Ganadorsubasta from './ganador_subasta';
import Articulovendido from './articulo_vendido';
import PujaRealizada from './puja_realizada';

const ModalExitoVenta = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-5 text-center">
      <button 
        className="btn btn-success fw-bold px-4 py-2 shadow-sm" onClick={() => setShowModal(true)}>Simular Venta Exitosa
      </button>

      {showModal && <Articulovendido cerrar={() => setShowModal(false)} />}
    </div>
  );
};

export default ModalExitoVenta;