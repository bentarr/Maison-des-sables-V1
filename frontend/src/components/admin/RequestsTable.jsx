// src/components/admin/RequestsTable.jsx
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { User, MapPin, Calendar, Check, X, AlertCircle } from 'lucide-react';

const RequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null);

  const fetchRequests = async () => {
    const response = await apiRequest('/admin/requests', 'GET');
    if (response.success) {
      setRequests(response.data.filter(req => req.status === 'pending'));
    }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const initiateAction = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;
    const previousRequests = [...requests];
    setRequests(requests.filter(r => r.id !== selectedRequest.id));
    setModalOpen(false);
    const response = await apiRequest(`/admin/requests/status/${selectedRequest.id}`, 'PUT', { status: actionType });
    if (response.success) {
      window.dispatchEvent(new Event('refresh_calendar'));
    } else {
      alert("Erreur technique.");
      setRequests(previousRequests);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-400 text-sm italic">Chargement...</div>;

  return (
    // CORRECTION : Suppression des bordures et ombres doubles ici car le parent (Card) les a déjà
    <div className="h-full flex flex-col overflow-hidden bg-white rounded-3xl"> 
      
      {/* HEADER FIXE ÉPURÉ */}
      <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-[#FDFBF7]">
        <h3 className="font-serif text-lg text-[#2C2C2C] flex items-center gap-2">
          Actions Requises
          {requests.length > 0 && <span className="bg-[#B47C5E] text-white text-[10px] font-sans px-2 py-0.5 rounded-full shadow-sm">{requests.length}</span>}
        </h3>
        {requests.length > 0 && <span className="text-[10px] text-gray-400 uppercase tracking-widest animate-pulse">En attente</span>}
      </div>

      {/* LISTE SCROLLABLE */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 max-h-[300px]">
        {requests.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 py-10">
            <Check className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm font-light">Tout est à jour.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition-all duration-300 group relative overflow-hidden flex flex-col gap-3">
              {/* Indicateur visuel */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B47C5E] opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="pl-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-serif text-base text-[#2C2C2C] font-bold leading-tight">{req.service_name}</h4>
                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">#{req.id}</span>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User className="w-3 h-3 text-[#B47C5E]" />
                        <span className="font-medium text-[#2C2C2C]">{req.first_name} {req.last_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(req.scheduled_date).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{req.property_address || "Lifestyle (Sans bien)"}</span>
                    </div>
                  </div>
              </div>

              {/* BOUTONS */}
              <div className="flex gap-2 pl-3 mt-1">
                  <button 
                      onClick={() => initiateAction(req, 'rejected')}
                      className="flex-1 py-2 text-xs font-bold text-gray-400 hover:text-red-500 border border-gray-100 rounded-lg hover:border-red-100 transition-colors uppercase tracking-wider"
                  >
                      Refuser
                  </button>
                  <button 
                      onClick={() => initiateAction(req, 'validated')}
                      className="flex-1 py-2 bg-[#2C2C2C] text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#B47C5E] transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                      Valider
                  </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODALE (Reste inchangée) */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#2C2C2C]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up border border-gray-100 relative">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${actionType === 'validated' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {actionType === 'validated' ? <Check className="w-6 h-6"/> : <AlertCircle className="w-6 h-6"/>}
                </div>
                <h4 className="font-serif text-lg text-[#2C2C2C]">Confirmation</h4>
            </div>
            
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              Confirmez-vous l'action pour <strong>{selectedRequest?.first_name}</strong> ?
            </p>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-[#2C2C2C] transition-colors">Annuler</button>
              <button onClick={confirmAction} className={`px-6 py-2.5 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg transition-transform active:scale-95 ${actionType === 'validated' ? 'bg-[#2C2C2C] hover:bg-[#B47C5E]' : 'bg-red-500 hover:bg-red-600'}`}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsTable;