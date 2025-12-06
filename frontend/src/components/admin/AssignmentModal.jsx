// src/components/admin/AssignmentModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Check, Star, Briefcase, X, FileText, Calendar, MapPin } from 'lucide-react';
import { apiRequest } from '../../services/api';

const AssignmentModal = ({ isOpen, onClose, reservation, onAssignSuccess }) => {
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [currentAssignedId, setCurrentAssignedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchProviders = async () => {
        setLoading(true);
        const response = await apiRequest('/admin/providers', 'GET');
        if (response.success) {
          setProviders(response.data.filter(p => p.is_active));
        }
        setLoading(false);
      };
      fetchProviders();
      
      if (reservation?.provider_id) {
          setSelectedProviderId(reservation.provider_id);
          setCurrentAssignedId(reservation.provider_id);
      } else {
          setSelectedProviderId(null);
          setCurrentAssignedId(null);
      }
    }
  }, [isOpen, reservation]);

  // LOGIQUE DE RECHERCHE DE LOUISE (Case Insensitive)
  const internalProvider = providers.find(p => 
    p.name.toLowerCase().includes('louise') || 
    p.name.toLowerCase().includes('maison des sables') ||
    p.speciality.toLowerCase().includes('admin')
  );
  
  const externalProviders = providers.filter(p => p.id !== internalProvider?.id);

  const handleAssign = async () => {
    if (!selectedProviderId || !reservation) return;
    setIsSubmitting(true);
    const response = await apiRequest(`/admin/reservations/assign/${reservation.id}`, 'PUT', { provider_id: selectedProviderId });
    if (response.success) {
      onAssignSuccess();
      onClose();
    } else {
      alert("Erreur : " + response.error);
    }
    setIsSubmitting(false);
  };

  if (!isOpen || !reservation) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#2C2C2C]/60 backdrop-blur-sm" />

        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          
          <div className="p-6 border-b border-gray-100 bg-[#F9F7F2]">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-serif text-xl text-[#2C2C2C]">Assignation</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {/* ... (Header Details inchangé) ... */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Client</p>
                    <div className="flex items-center gap-1 font-bold text-[#2C2C2C]">
                        <User className="w-3 h-3 text-[#B47C5E]" />
                        {reservation.client_firstname} {reservation.client_lastname}
                    </div>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Date</p>
                    <div className="flex items-center gap-1 text-gray-700">
                        <Calendar className="w-3 h-3" />
                        
                        {new Date(reservation.scheduled_date).toLocaleString()}
                    </div>
                </div>
                <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Lieu & Service</p>
                    <div className="flex items-center gap-1 text-gray-700">
                        <MapPin className="w-3 h-3" />
                        {reservation.service_name} @ {reservation.property_address || "Lieu personnel"}
                    </div>
                </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            <h4 className="text-sm font-bold text-[#2C2C2C] mb-2">Choisir un Intervenant</h4>
            {loading ? <div className="text-center italic text-gray-400">Chargement...</div> : (
              <>
                {/* 1. GESTION INTERNE (Louise) */}
                <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold flex items-center gap-2">
                        <Star className="w-3 h-3 text-[#B47C5E]" /> Gestion Interne
                    </h4>
                    
                    {internalProvider ? (
                        <div 
                            onClick={() => setSelectedProviderId(internalProvider.id)}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group relative
                            ${selectedProviderId === internalProvider.id 
                                ? 'border-[#B47C5E] bg-[#B47C5E] text-white shadow-md transform scale-[1.01]' 
                                : 'border-[#B47C5E]/30 bg-[#F9F7F2] hover:border-[#B47C5E]'
                            }`}
                        >
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border-2 border-white 
                                    ${selectedProviderId === internalProvider.id ? 'bg-white text-[#B47C5E]' : 'bg-[#B47C5E] text-white'}`}>
                                    L
                                </div>
                                <div>
                                    <div className={`font-serif font-bold ${selectedProviderId === internalProvider.id ? 'text-white' : 'text-[#2C2C2C]'}`}>
                                        {internalProvider.name}
                                    </div>
                                    <div className={`text-xs ${selectedProviderId === internalProvider.id ? 'text-white/80' : 'text-[#B47C5E]'}`}>
                                        Maison des Sables
                                    </div>
                                </div>
                            </div>
                            {selectedProviderId === internalProvider.id && (
                                <div className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 text-white">
                                    Sélectionné <Check className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-3 rounded-lg border border-dashed border-gray-300 text-xs text-gray-400 text-center bg-gray-50">
                            Créez un prestataire nommé "Louise" pour activer ce bloc.
                        </div>
                    )}
                </div>

                {/* 2. PARTENAIRES EXTERNES */}
                <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold flex items-center gap-2">
                        <Briefcase className="w-3 h-3" /> Partenaires
                    </h4>
                    <div className="space-y-2">
                        {externalProviders.map((p) => (
                        <div 
                            key={p.id} 
                            onClick={() => setSelectedProviderId(p.id)}
                            className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-200
                            ${selectedProviderId === p.id 
                                ? 'border-[#2C2C2C] bg-[#2C2C2C] text-white shadow-md scale-[1.01]' 
                                : 'border-gray-100 bg-white hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors border 
                                    ${selectedProviderId === p.id ? 'bg-white text-[#2C2C2C] border-transparent' : 'bg-gray-50 text-gray-500 border-gray-100 group-hover:bg-gray-100'}`}>
                                    {p.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-sans text-sm font-medium">{p.name}</div>
                                    <div className={`text-[10px] ${selectedProviderId === p.id ? 'opacity-70' : 'text-gray-400'}`}>
                                        {p.speciality}
                                    </div>
                                </div>
                            </div>
                            {selectedProviderId === p.id && (
                                <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 text-white">
                                    Sélectionné <Check className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                        ))}
                    </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-[#2C2C2C] uppercase tracking-wider transition-colors">Annuler</button>
            <button onClick={handleAssign} disabled={!selectedProviderId || isSubmitting} className="px-6 py-2 bg-[#2C2C2C] text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#B47C5E] transition-colors shadow-lg disabled:opacity-50">
              {isSubmitting ? '...' : (currentAssignedId ? 'Modifier' : 'Valider')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AssignmentModal;