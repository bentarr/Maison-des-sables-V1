// src/components/admin/ProvidersPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Phone, Star, Plus, Search, MapPin, Sun, Moon } from 'lucide-react';
import NotificationBell from '../common/NotificationBell'; 

const providersData = [
  { id: 1, name: 'Jean Michel', job: 'Jardinier', status: 'En mission', rating: 4.8, phone: '+33 6 12 34 56 78', location: 'Secteur Les Parcs' },
  { id: 2, name: 'Marie Curie', job: 'Femme de ménage', status: 'Disponible', rating: 5.0, phone: '+33 6 98 76 54 32', location: 'Centre-ville' },
  { id: 3, name: 'Paul Bocus', job: 'Chef Privé', status: 'Indisponible', rating: 4.9, phone: '+33 6 00 00 00 00', location: 'Ramatuelle' },
  { id: 4, name: 'Elec Azur', job: 'Électricien', status: 'Disponible', rating: 4.5, phone: '+33 4 94 00 00 00', location: 'Var' },
  { id: 5, name: 'Aqua Pool', job: 'Pisciniste', status: 'En mission', rating: 4.7, phone: '+33 6 11 22 33 44', location: 'Gassin' },
];

const Card = ({ children, className, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
    className={`bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-[#2C2C2C]/5 dark:border-white/5 transition-colors duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const ProvidersPage = ({ isDarkMode, toggleTheme }) => {
  return (
    <div className="p-8 h-full overflow-y-auto" data-lenis-prevent>
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="font-serif text-4xl text-[#2C2C2C] dark:text-[#F9F7F2] mb-2 transition-colors">Prestataires</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[#2C2C2C]/60 dark:text-gray-400 font-sans transition-colors">Gestion du carnet d'adresses et suivi des interventions.</motion.p>
        </div>

        <div className="flex items-center gap-6">
            <button onClick={toggleTheme} className="p-2 bg-white dark:bg-[#1E1E1E] rounded-full border border-gray-200 dark:border-white/10 text-gray-400 hover:text-[#B47C5E] transition-all shadow-sm">
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#2C2C2C] dark:bg-white text-white dark:text-[#2C2C2C] rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#B47C5E] dark:hover:bg-[#B47C5E] dark:hover:text-white transition-colors shadow-lg">
                <Plus className="w-4 h-4" /> Ajouter
            </button>
            <NotificationBell />
            <div className="h-10 w-10 rounded-full bg-[#B47C5E] overflow-hidden border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">A</div>
        </div>
      </div>

      {/* RECHERCHE */}
      <div className="mb-8 flex gap-4">
          <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher un nom, un métier..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E] dark:text-white focus:outline-none focus:border-[#B47C5E] text-sm transition-colors"
              />
          </div>
      </div>

      {/* GRILLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providersData.map((provider, index) => (
              <Card key={provider.id} delay={index * 0.1} className="group hover:border-[#B47C5E]/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[#2C2C2C] dark:text-white font-bold text-lg">
                              {provider.name.charAt(0)}
                          </div>
                          <div>
                              <h3 className="font-serif text-lg text-[#2C2C2C] dark:text-[#F9F7F2] group-hover:text-[#B47C5E] transition-colors">{provider.name}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{provider.job}</p>
                          </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          provider.status === 'Disponible' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                          provider.status === 'En mission' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                          'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                          {provider.status}
                      </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-50 dark:border-white/5 pt-4 mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-3 h-3 text-[#B47C5E]" /> {provider.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-3 h-3 text-[#B47C5E]" /> {provider.location}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 
                          <span className="font-bold">{provider.rating}</span>
                          <span className="text-gray-400 text-xs">(24 avis)</span>
                      </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                      <button className="flex-1 py-2 text-xs font-bold uppercase border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          Voir Profil
                      </button>
                      <button className="flex-1 py-2 text-xs font-bold uppercase bg-[#2C2C2C] dark:bg-white text-white dark:text-[#2C2C2C] rounded-lg hover:bg-[#B47C5E] dark:hover:bg-[#B47C5E] dark:hover:text-white transition-colors">
                          Contacter
                      </button>
                  </div>
              </Card>
          ))}
          
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-[#B47C5E] hover:text-[#B47C5E] hover:bg-[#B47C5E]/5 transition-all cursor-pointer min-h-[200px]"
          >
              <Plus className="w-8 h-8 mb-2" />
              <span className="text-sm font-bold uppercase tracking-widest">Ajouter un pro</span>
          </motion.div>
      </div>
    </div>
  );
};

export default ProvidersPage;