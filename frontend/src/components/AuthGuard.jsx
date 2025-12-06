// src/components/AuthGuard.jsx
import React, { useState, useEffect } from 'react';
import { getAuthData, logout } from '../services/authService';

const AuthGuard = ({ children, requiredRole }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthentication = () => {
            const { token, role } = getAuthData();
            
            // 1. Pas de token -> Redirection immédiate vers login
            if (!token) {
                if (requiredRole !== 'public') {
                    window.location.href = '/login';
                    return;
                }
            }

            // 2. Rôle incorrect -> Redirection vers le bon dashboard ou déconnexion
            if (requiredRole !== 'public' && role !== requiredRole) {
                const target = (role === 'admin') ? '/admin' : '/client';
                window.location.href = target;
                return;
            }

            // 3. Jeton présent et rôle correct -> Afficher le contenu
            setIsAuthenticated(true);
            setLoading(false);
        };

        checkAuthentication();
    }, [requiredRole]); // Se déclenche une seule fois et si le rôle requis change

    if (loading) {
        // Afficher un écran de chargement (ou un écran blanc) pour masquer le contenu
        return (
            <div className="flex items-center justify-center h-screen w-full bg-gray-50 text-[#B47C5E]">
                Vérification de la session en cours...
            </div>
        );
    }
    
    // Si la vérification est passée, rendre le contenu du Dashboard
    return isAuthenticated ? <>{children}</> : null;
};

export default AuthGuard;