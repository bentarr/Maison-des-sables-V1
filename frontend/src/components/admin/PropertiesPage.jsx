// src/components/admin/PropertiesPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, MapPin, Maximize, BedDouble, Plus, Search, MoreVertical, Sun, Moon } from 'lucide-react';
import { apiRequest } from '../../services/api';
import NotificationBell from '../common/NotificationBell';

const Card = ({ children, className, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
    className={`bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-[#2C2C2C]/5 dark:border-white/5 transition-colors duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const PropertiesPage = ({ isDarkMode, toggleTheme }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ owner_id: '', address: '', surface: '', num_rooms: '' });

  const fetchProperties = async () => {
      setLoading(true);
      const response = await apiRequest('/admin/properties', 'GET');
      if (response.success) setProperties(response.data);
      setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleCreate = async (e) => {
      e.preventDefault();
      const response = await apiRequest('/admin/properties', 'POST', formData);
      if (response.success) {
          setShowModal(false);
          setFormData({ owner_id: '', address: '', surface: '', num_rooms: '' });
          fetchProperties();
      } else {
          alert("Erreur : " + response.error);
      }
  };

  return (
    <div className="p-8 h-full overflow-y-auto" data-lenis-prevent>
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="font-serif text-4xl text-[#2C2C2C] dark:text-[#F9F7F2] mb-2 transition-colors">Mes Propriétés</h1>
          <p className="text-[#2C2C2C]/60 dark:text-gray-400 font-sans transition-colors">Gestion du parc immobilier.</p>
        </div>

        <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 bg-white dark:bg-[#1E1E1E] rounded-full border border-gray-200 dark:border-white/10 text-gray-400 hover:text-[#B47C5E] transition-all shadow-sm">
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3 bg-[#2C2C2C] dark:bg-white text-white dark:text-[#2C2C2C] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#B47C5E] dark:hover:bg-[#B47C5E] dark:hover:text-white transition-colors shadow-lg">
                <Plus className="w-4 h-4" /> Ajouter
            </button>
            <NotificationBell />
            <div className="h-10 w-10 rounded-full bg-[#B47C5E] flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-white">A</div>
        </div>
      </div>

      {/* RECHERCHE */}
      <div className="mb-8 relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E] dark:text-white focus:outline-none focus:border-[#B47C5E] text-sm transition-colors"
          />
      </div>

      {/* GRILLE */}
      {loading ? (
          <div className="text-center py-20 text-gray-400 italic">Chargement...</div>
      ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#1E1E1E] rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
              <Home className="w-12 h-12 text-gray-200 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucune propriété.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop, index) => (
                  <Card key={prop.id} delay={index * 0.1} className="group hover:border-[#B47C5E]/30 transition-all hover:shadow-md">
                      <div className="h-40 bg-gray-100 dark:bg-white/5 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center">
                          <Home className="w-10 h-10 text-gray-300 dark:text-gray-600 opacity-50" />
                          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[9px] font-bold uppercase shadow-sm ${prop.is_active ? 'bg-white dark:bg-[#2C2C2C] text-green-700 dark:text-green-400' : 'bg-gray-200 text-gray-500'}`}>
                              {prop.is_active ? 'Actif' : 'Inactif'}
                          </div>
                      </div>
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <h3 className="font-serif text-lg text-[#2C2C2C] dark:text-[#F9F7F2] leading-tight mb-1">{prop.address}</h3>
                              <p className="text-xs text-[#B47C5E] font-bold uppercase tracking-wide">{prop.owner_name || `Proprio #${prop.owner_id}`}</p>
                          </div>
                          <button className="text-gray-300 hover:text-[#2C2C2C] dark:hover:text-white"><MoreVertical className="w-4 h-4" /></button>
                      </div>
                      <div className="flex gap-4 mt-4 pt-4 border-t border-gray-50 dark:border-white/5 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5"><Maximize className="w-3.5 h-3.5" /> {prop.surface} m²</div>
                          <div className="flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" /> {prop.num_rooms} ch.</div>
                          <div className="flex items-center gap-1.5 ml-auto text-gray-400"><MapPin className="w-3.5 h-3.5" /> St-Tropez</div>
                      </div>
                  </Card>
              ))}
          </div>
      )}

      {/* MODALE */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#2C2C2C]/60 dark:bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-gray-100 dark:border-white/10">
                <h3 className="font-serif text-2xl text-[#2C2C2C] dark:text-[#F9F7F2] mb-6">Ajouter une propriété</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Adresse</label>
                        <input required type="text" className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent dark:text-white focus:border-[#B47C5E] outline-none text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input required type="number" placeholder="Surface" className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent dark:text-white focus:border-[#B47C5E] outline-none text-sm" value={formData.surface} onChange={e => setFormData({...formData, surface: e.target.value})} />
                        <input required type="number" placeholder="Chambres" className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent dark:text-white focus:border-[#B47C5E] outline-none text-sm" value={formData.num_rooms} onChange={e => setFormData({...formData, num_rooms: e.target.value})} />
                    </div>
                    <input required type="number" placeholder="ID Proprio" className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent dark:text-white focus:border-[#B47C5E] outline-none text-sm" value={formData.owner_id} onChange={e => setFormData({...formData, owner_id: e.target.value})} />
                    
                    <div className="flex justify-end gap-3 mt-8">
                        <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#2C2C2C] dark:hover:text-white">Annuler</button>
                        <button type="submit" className="px-6 py-3 bg-[#2C2C2C] dark:bg-white text-white dark:text-[#2C2C2C] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#B47C5E] dark:hover:bg-[#B47C5E] dark:hover:text-white transition-colors">Créer</button>
                    </div>
                </form>
            </motion.div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;