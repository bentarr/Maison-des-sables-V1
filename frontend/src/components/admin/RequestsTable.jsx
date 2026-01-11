// src/components/admin/RequestsPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Inbox, CheckCircle, XCircle, Clock, Search, Filter, User, MapPin, Calendar, Sun, Moon } from 'lucide-react';
import { apiRequest } from '../../services/api';
import NotificationBell from '../common/NotificationBell';

const Card = ({ children, className }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
    className={`bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-[#2C2C2C]/5 dark:border-white/5 transition-colors duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const RequestsPage = ({ isDarkMode, toggleTheme }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchRequests = async () => {
    setLoading(true);
    const response = await apiRequest('/admin/requests', 'GET');
    if (response.success) setRequests(response.data);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const filteredRequests = requests.filter(req => filter === 'all' ? true : req.status === filter);

  const handleStatusChange = async (id, newStatus) => {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      const response = await apiRequest(`/admin/requests/status/${id}`, 'PUT', { status: newStatus });
      if (!response.success) {
          alert("Erreur technique");
          fetchRequests();
      }
  };

  return (
    <div className="p-8 h-full overflow-y-auto" data-lenis-prevent>
      
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="font-serif text-4xl text-[#2C2C2C] dark:text-[#F9F7F2] mb-2 transition-colors">Demandes</h1>
          <p className="text-[#2C2C2C]/60 dark:text-gray-400 font-sans transition-colors">Gérez les demandes de services.</p>
        </div>

      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex p-1 bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
              {[
                  { id: 'pending', label: 'En attente', icon: Clock },
                  { id: 'validated', label: 'Validées', icon: CheckCircle },
                  { id: 'rejected', label: 'Refusées', icon: XCircle },
                  { id: 'all', label: 'Tout voir', icon: Filter },
              ].map((tab) => (
                  <button
                      key={tab.id}
                      onClick={() => setFilter(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                          filter === tab.id 
                          ? 'bg-[#2C2C2C] text-white dark:bg-white dark:text-[#2C2C2C] shadow-md' 
                          : 'text-gray-400 hover:text-[#2C2C2C] dark:hover:text-white'
                      }`}
                  >
                      <tab.icon className="w-3 h-3" /> {tab.label}
                  </button>
              ))}
          </div>
      </div>

      <div className="space-y-4">
          {loading ? (
              <div className="text-center py-20 text-gray-400 italic">Chargement...</div>
          ) : filteredRequests.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[#1E1E1E] rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                  <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Aucune demande.</p>
              </div>
          ) : (
              filteredRequests.map((req) => (
                  <Card key={req.id} className="flex flex-col md:flex-row items-center gap-6 group hover:border-[#B47C5E]/30 transition-all">
                      <div className="md:w-24 text-center md:text-left">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                              {new Date(req.created_at || req.scheduled_date).toLocaleDateString()}
                          </span>
                          <span className="text-xs font-mono bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-500 dark:text-gray-300">#{req.id}</span>
                      </div>
                      <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-serif text-lg text-[#2C2C2C] dark:text-[#F9F7F2]">{req.service_name}</h3>
                              {req.status === 'pending' && <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>}
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#B47C5E]" /> <span className="font-medium text-[#2C2C2C] dark:text-gray-300">{req.first_name} {req.last_name}</span></div>
                              <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(req.scheduled_date).toLocaleString()}</div>
                              <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {req.property_address || "Lifestyle (Sans bien)"}</div>
                          </div>
                          {req.notes && <div className="mt-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-xs italic text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5">"{req.notes}"</div>}
                      </div>
                      <div className="flex gap-2 min-w-[140px] justify-end">
                          {req.status === 'pending' ? (
                              <>
                                  <button onClick={() => handleStatusChange(req.id, 'rejected')} className="p-2 rounded-full border border-gray-200 dark:border-white/10 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"><XCircle className="w-5 h-5" /></button>
                                  <button onClick={() => handleStatusChange(req.id, 'validated')} className="flex-1 px-4 py-2 bg-[#2C2C2C] text-white dark:bg-white dark:text-[#2C2C2C] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#B47C5E] dark:hover:bg-[#B47C5E] dark:hover:text-white transition-colors shadow-lg flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Valider</button>
                              </>
                          ) : (
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${req.status === 'validated' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'}`}>{req.status === 'validated' ? 'Validée' : 'Refusée'}</span>
                          )}
                      </div>
                  </Card>
              ))
          )}
      </div>
    </div>
  );
};

export default RequestsPage;