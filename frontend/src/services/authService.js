// src/services/authService.js

import { apiRequest } from './api';

const TOKEN_KEY = 'jwt_token';
const ROLE_KEY = 'user_role';

/**
 * Stocke le token et le rôle de l'utilisateur dans le localStorage.
 */
function setAuthData(token, role) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, role);
    
    // Ajout de clés claires pour le débogage front-end (comme utilisé dans le plan)
    if (role === 'admin') {
      localStorage.setItem('admin_token', token);
      localStorage.removeItem('client_token');
    } else {
      localStorage.setItem('client_token', token);
      localStorage.removeItem('admin_token');
    }
  }
}

/**
 * Récupère les données d'authentification (rôle et token).
 */
export function getAuthData() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    const role = localStorage.getItem(ROLE_KEY);
    return { token, role };
  }
  return { token: null, role: null };
}

/**
 * Supprime les données d'authentification.
 */
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('client_token');
    // Rediriger vers la page de connexion après la déconnexion
    window.location.href = '/login'; 
  }
}

/**
 * Gère la connexion de l'utilisateur (Route 2) et stocke le token.
 */
export async function login(email, password) {
  // apiRequest vient de notre fichier api.js
  const response = await apiRequest('/auth/login', 'POST', { email, password });

  if (response.success) {
    const { token, user } = response.data;
    setAuthData(token, user.role);
    return { success: true, role: user.role };
  }

  return { success: false, error: response.error };
}