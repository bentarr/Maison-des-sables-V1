// src/services/api.js

// ON REMET LE /api ICI
const BASE_URL = 'http://localhost:5000/api'; 

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token') || localStorage.getItem('client_token');
  }
  return null;
}

export async function apiRequest(endpoint, method = 'GET', data = null) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const result = await response.json();

    if (!response.ok) {
      console.error('Erreur API:', response.status, result.error);
      return { success: false, status: response.status, error: result.error || 'Erreur inconnue.' };
    }

    return { success: true, data: result };
    
  } catch (error) {
    console.error('Erreur de connexion au serveur:', error);
    return { success: false, status: 500, error: 'Connexion au serveur impossible.' };
  }
}