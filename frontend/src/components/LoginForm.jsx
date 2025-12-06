// src/components/LoginForm.jsx (VERSION INTÉGRÉE AU DESIGN ASTRO)

import React, { useState } from 'react';
import { login } from '../services/authService';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Couleurs du Design (Nous allons les utiliser directement pour la cohérence)
  const charbon = '#2C2C2C';
  const sable = '#EAEAEA';
  const or = '#B47C5E';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password);

    if (result.success) {
      if (result.role === 'admin') {
        window.location.href = '/admin';
      } else if (result.role === 'client') {
        window.location.href = '/client';
      }
    } else {
      setError(result.error || "Échec de la connexion. Veuillez réessayer.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
        
      {/* 1. BLOC DE BIENVENUE (Intégration du design) */}
      <div className="text-center mb-8">
          <a href="/" className="block mb-2 hover:opacity-80 transition-opacity">
              {/* NOTE: Assurez-vous que /logo.jpg existe dans /public */}
              <img 
                  src="/logo.jpg" 
                  alt="Logo Maison des Sables" 
                  className="h-40 mx-auto object-contain mix-blend-multiply scale-[2.5]"
              />
          </a>
          <h1 className="font-serif text-4xl mb-3 relative z-20" style={{ color: charbon }}>Bienvenue</h1>
          <p className="text-sm relative z-20" style={{ color: `${charbon}99` }}>Connectez-vous pour gérer vos séjours ou votre bien.</p>
      </div>

      {/* 2. FORMULAIRE */}
      <form onSubmit={handleSubmit} className="space-y-8">
          
        {/* Affichage des Erreurs */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm animate-fade-in-up">
            {error}
          </div>
        )}

        {/* Champ Email */}
        <div className="group relative">
          <input 
            type="email" 
            id="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="peer w-full bg-transparent border-b py-3 focus:outline-none transition-colors placeholder-transparent" 
            style={{ color: charbon, borderColor: `${charbon}33`, transitionDuration: '300ms' }}
            placeholder="Email"
            required
          />
          <label 
            htmlFor="email" 
            className="absolute left-0 -top-3.5 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs"
            style={{ color: `${charbon}80`, transitionDuration: '300ms' }}
          >
            Adresse Email
          </label>
        </div>

        {/* Champ Mot de Passe */}
        <div className="group relative">
          <input 
            type="password" 
            id="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="peer w-full bg-transparent border-b py-3 focus:outline-none transition-colors placeholder-transparent" 
            style={{ color: charbon, borderColor: `${charbon}33`, transitionDuration: '300ms' }}
            placeholder="Mot de passe"
            required
          />
          <label 
            htmlFor="password" 
            className="absolute left-0 -top-3.5 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs"
            style={{ color: `${charbon}80`, transitionDuration: '300ms' }}
          >
            Mot de passe
          </label>
          <button type="button" className="absolute right-0 top-3 text-[10px] uppercase tracking-widest transition-colors" style={{ color: `${charbon}66` }}>
            Oublié ?
          </button>
        </div>

        {/* Bouton de Connexion (Avec animation Or) */}
        <button 
          type="submit" 
          disabled={loading}
          className="group relative w-full py-4 font-sans text-sm font-semibold rounded-std overflow-hidden shadow-lg shadow-[#2C2C2C]/20 transition-all duration-500 hover:-translate-y-1 disabled:opacity-70 disabled:hover:-translate-y-0 disabled:shadow-none"
          style={{ backgroundColor: charbon, color: sable }}
        >
          <span className="relative z-10 transition-colors">
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </span>
          
          {/* Animation de fond (Style 'Or') */}
          <div 
            className={`absolute inset-0 -translate-x-[150%] skew-x-12 transition-transform duration-1000 ease-in-out z-0`}
            style={{ backgroundColor: or, transitionDuration: '1000ms', transform: loading ? 'translateX(0)' : 'translateX(-150%)' }}
          ></div>
          
          {/* Loader (Affiché si loading est true) */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-20" style={{ backgroundColor: charbon }}>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </button>

      </form>

      {/* Reste du pied de page du formulaire */}
      <div className="mt-12 text-center border-t pt-8" style={{ borderColor: `${charbon}1A` }}>
          <p className="text-sm mb-4" style={{ color: `${charbon}99` }}>Pas encore client ?</p>
          <a href="/#contact" className="text-xs font-bold uppercase tracking-widest border-b pb-1 transition-colors" style={{ color: charbon, borderColor: charbon }}>
              Demander une adhésion
          </a>
      </div>
    </div>
  );
};

export default LoginForm;