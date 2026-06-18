import React from 'react';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import { useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

function MainLayout({ children }) {
    const location = useLocation();
    const isAuthenticated = authService.isAuthenticated();
    
    // No mostrar Navbar/Footer en login y register
    const hideLayout = location.pathname === '/login' || location.pathname === '/register';

    if (hideLayout) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            <main className="min-vh-100 bg-light">
                {children}
            </main>
            <Footer />
        </>
    );
}

export default MainLayout;