// hooks/useModal.js
import { useState } from 'react';

export const useModal = () => {
    const [modal, setModal] = useState({
        show: false,
        title: '',
        message: '',
        type: 'success' 
    });

    const showModalMessage = (title, message, type = 'success') => {
        setModal({ show: true, title, message, type });
    };

    const hideModal = () => {
        setModal({ show: false, title: '', message: '', type: 'success' });
    };

    return { modal, showModalMessage, hideModal };
};