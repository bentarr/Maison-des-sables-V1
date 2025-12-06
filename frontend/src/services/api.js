// src/services/api.js (CORRIGÉ POUR ÉVITER localStorage CÔTÉ SERVEUR)

const BASE_URL = 'http://localhost:5000/api'; // VOTRE URL BACKEND

/**
 * Récupère le jeton JWT stocké dans le localStorage.
 */
function getToken() {
  // VÉRIFICATION CLÉ : S'assurer que le code s'exécute dans le navigateur (window existe)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token') || localStorage.getItem('client_token');
  }
  return null;
}

/**
 * Fonction générique pour toutes les requêtes API (fetch).
 * @param {string} endpoint - Ex: '/auth/login' ou '/admin/properties'
 * @param {string} method - 'GET', 'POST', 'PUT', 'DELETE'
 * @param {object} [data=null] - Corps de la requête
 */
export async function apiRequest(endpoint, method = 'GET', data = null) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const result = await response.json();

    if (!response.ok) {
      // Gérer les erreurs 401 (token expiré) ou 403 (permissions)
      console.error('Erreur API:', response.status, result.error);
      return { success: false, status: response.status, error: result.error || 'Erreur inconnue.' };
    }

    return { success: true, data: result };
    
  } catch (error) {
    console.error('Erreur de connexion au serveur:', error);
    return { success: false, status: 500, error: 'Connexion au serveur impossible.' };
  }
}