import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Check, Star, Briefcase, X, Calendar, MapPin, Loader2 } from 'lucide-react';
import { apiRequest } from '../../services/api';

const AssignmentModal = ({ isOpen, onClose, reservation, clients = [], onAssignSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ client_id: '', service_name: '', scheduled_date: '', start_time: '09:00' });
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  const isNew = reservation?.isNew;

  useEffect(() => {
    if (isOpen) {
      if (isNew) {
        setFormData({
            client_id: '',
            service_name: '',
            scheduled_date: reservation.scheduled_date || new Date().toISOString().split('T')[0],
            start_time: '09:00'
        });
      } else {
        const fetchProviders = async () => {
            setLoading(true);
            const response = await apiRequest('/admin/providers', 'GET');
            if (response.success) setProviders(response.data.filter(p => p.is_active));
            setLoading(false);
        };
        fetchProviders();
        if (reservation?.provider_id) setSelectedProviderId(reservation.provider_id);
      }
    }
  }, [isOpen, reservation, isNew]);

  const internalProvider = providers.find(p => p.name.toLowerCase().includes('louise') || p.name.toLowerCase().includes('maison'));
  const externalProviders = providers.filter(p => p.id !== internalProvider?.id);

  // --- ACTION CRÉER ---
  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const response = await apiRequest('/admin/reservations', 'POST', formData);
        if (response.success) { onAssignSuccess(); onClose(); } 
        else { alert("Erreur: " + response.message); }
    } catch (error) { console.error(error); alert("Erreur réseau"); } 
    finally { setIsSubmitting(false); }
  };

  // --- ACTION ASSIGNER ---
  const handleAssign = async () => {
    if (!selectedProviderId || !reservation) return;
    setIsSubmitting(true);
    
    // TENTATIVE 1 : Mise à jour standard
    // Si ça échoue, vérifie que l'ID de la réservation n'est pas undefined
    console.log("Tentative assignation pour ID:", reservation.id, "Provider:", selectedProviderId);
    
    if (!reservation.id) {
        alert("Erreur critique: ID réservation manquant");
        setIsSubmitting(false);
        return;
    }

    try {
        const response = await apiRequest(`/admin/reservations/${reservation.id}`, 'PUT', { 
            provider_id: selectedProviderId 
        });

        if (response.success) { onAssignSuccess(); onClose(); } 
        else { alert("Erreur Serveur: " + (response.error || response.message)); }
    } catch (e) {
        console.error(e);
        alert("Erreur de connexion API");
    }
    setIsSubmitting(false);
  };

  if (!isOpen || !reservation) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#2C2C2C]/60 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          
          <div className="p-6 border-b border-gray-100 bg-[#F9F7F2] flex justify-between items-center">
             <h3 className="font-serif text-xl text-[#2C2C2C]">{isNew ? 'Nouvelle Réservation' : 'Assignation'}</h3>
             <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            {isNew ? (
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Client</label>


                        <select 
                            className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm" 
                            value={formData.client_id} 
                            onChange={(e) => setFormData({...formData, client_id: e.target.value})} 
                            required
                        >
                            <option value="">Sélectionner un client...</option>

                            {clients.length > 0 ? (
                                clients.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.first_name} {c.last_name} ({c.email || 'Pas d\'email'})
                                    </option>
                                ))
                            ) : (
                                <option disabled>⚠️ Aucun client trouvé en base de données</option>
                            )}
                        </select>

                        
                    </div>
                    <div><label className="block text-xs font-bold uppercase text-gray-400 mb-1">Service</label><input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm" value={formData.service_name} onChange={(e) => setFormData({...formData, service_name: e.target.value})} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={formData.scheduled_date} onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})} required />
                        <input type="time" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} required />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#2C2C2C] text-white font-bold rounded-xl mt-4 hover:bg-[#B47C5E] transition-colors">{isSubmitting ? '...' : 'Créer la réservation'}</button>
                </form>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
                        <div><p className="text-[10px] uppercase text-gray-400">Client</p><strong>{reservation.client_firstname} {reservation.client_lastname}</strong></div>
                        <div><p className="text-[10px] uppercase text-gray-400">Date</p><strong>{new Date(reservation.scheduled_date).toLocaleDateString()}</strong></div>
                        <div className="col-span-2"><p className="text-[10px] uppercase text-gray-400">Service</p><strong>{reservation.service_name}</strong></div>
                    </div>
                    <h4 className="text-sm font-bold text-[#2C2C2C] mt-4">Choisir un Intervenant</h4>
                    {loading ? <div className="text-center italic text-gray-400">Chargement...</div> : (
                      <>
                        <div className="mt-2">
                            {internalProvider ? (
                                <div onClick={() => setSelectedProviderId(internalProvider.id)} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedProviderId === internalProvider.id ? 'border-[#B47C5E] bg-[#B47C5E] text-white' : 'border-gray-200 bg-white'}`}>
                                    <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-[#B47C5E]">L</div><span className="font-bold">{internalProvider.name}</span></div>
                                    {selectedProviderId === internalProvider.id && <Check className="w-4 h-4"/>}
                                </div>
                            ) : <p className="text-xs text-gray-400 italic">Ajoutez "Louise" dans les partenaires.</p>}
                        </div>
                        <div className="space-y-2 mt-4">
                            {externalProviders.map((p) => (
                                <div key={p.id} onClick={() => setSelectedProviderId(p.id)} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedProviderId === p.id ? 'border-[#2C2C2C] bg-[#2C2C2C] text-white' : 'border-gray-100 bg-white'}`}>
                                    <div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">{p.name.charAt(0)}</div><span>{p.name}</span></div>
                                    {selectedProviderId === p.id && <Check className="w-4 h-4"/>}
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAssign} disabled={!selectedProviderId || isSubmitting} className="w-full py-3 bg-[#2C2C2C] text-white font-bold rounded-xl mt-6 hover:bg-[#B47C5E] transition-colors">{isSubmitting ? '...' : 'Valider l\'assignation'}</button>
                      </>
                    )}
                </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AssignmentModal;