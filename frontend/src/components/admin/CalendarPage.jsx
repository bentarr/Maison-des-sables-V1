import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Plus, Sun, Moon, Calendar as CalIcon, Filter, X, Eye } from 'lucide-react';
import NotificationBell from '../common/NotificationBell';
import { apiRequest } from '../../services/api';
import AssignmentModal from './AssignmentModal'; 

const Card = ({ children, className, title, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
    className={`bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-[#2C2C2C]/5 dark:border-white/5 transition-colors duration-300 ${className}`}
  >
    {title && <h3 className="font-serif text-lg text-[#2C2C2C] dark:text-[#F9F7F2] mb-4">{title}</h3>}
    {children}
  </motion.div>
);

const CalendarPage = ({ isDarkMode, toggleTheme }) => {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [reservations, setReservations] = useState([]);
  const [clientsList, setClientsList] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState('service');
  const [filterClient, setFilterClient] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => { let day = new Date(y, m, 1).getDay(); return day === 0 ? 6 : day - 1; };
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);
  const totalSlots = [...Array(firstDayIndex).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  // --- API ---
  const fetchData = async () => {
    setLoading(true);
    try {
        const resReservations = await apiRequest('/admin/reservations', 'GET');
        let loadedReservations = [];
        if (resReservations.success) {
            loadedReservations = resReservations.data;
            setReservations(loadedReservations);
        }

        const clientsMap = new Map();

        // 1. API Users
        try {
            const resUsers = await apiRequest('/admin/users', 'GET'); 
            if (resUsers.success && Array.isArray(resUsers.data)) {
                resUsers.data.forEach(u => {
                    clientsMap.set(u.id, { id: u.id, first_name: u.first_name, last_name: u.last_name, email: u.email });
                });
            }
        } catch (e) { console.warn("API Users indisponible"); }

        // 2. Fallback
        loadedReservations.forEach(r => {
            const realId = r.user_id || r.client_id;
            if (realId && !clientsMap.has(realId)) {
                clientsMap.set(realId, {
                    id: realId,
                    first_name: r.client_firstname || 'Client',
                    last_name: r.client_lastname || 'Inconnu',
                    email: r.owner_email || 'Email non dispo'
                });
            }
        });

        setClientsList(Array.from(clientsMap.values()));
    } catch (err) { console.error("Erreur calendrier", err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- FILTRES ---
  const uniqueClientNames = useMemo(() => {
      const names = reservations.map(r => `${r.client_firstname} ${r.client_lastname}`.trim());
      return [...new Set(names)].filter(n => n !== '');
  }, [reservations]);

  const uniqueProperties = useMemo(() => {
      const props = reservations.map(r => r.property_name);
      return [...new Set(props)].filter(p => p);
  }, [reservations]);

  const filteredReservations = useMemo(() => {
      return reservations.filter(r => {
          if (r.status !== 'confirmed') return false;
          const clientName = `${r.client_firstname} ${r.client_lastname}`.trim();
          if (filterClient !== 'all' && clientName !== filterClient) return false;
          if (filterProperty !== 'all' && r.property_name !== filterProperty) return false;
          return true;
      });
  }, [reservations, filterClient, filterProperty]);

  const getEventsForDay = (dayNumber) => {
    if (!dayNumber) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    return filteredReservations.filter(r => r.scheduled_date && r.scheduled_date.startsWith(dateStr));
  };

  const selectedEvents = filteredReservations.filter(r => {
      if (!r.scheduled_date) return false;
      const rDate = new Date(r.scheduled_date);
      return rDate.getDate() === selectedDate.getDate() &&
             rDate.getMonth() === selectedDate.getMonth() &&
             rDate.getFullYear() === selectedDate.getFullYear();
  });

  const getEventLabel = (event) => {
      switch (viewMode) {
          case 'client': return `${event.client_firstname || ''} ${event.client_lastname || ''}`.trim() || 'Client';
          case 'property': return event.property_name || 'Bien';
          default: return event.service_name || 'Service';
      }
  };

  // --- FONCTION MAGIQUE POUR L'HEURE ---
  const formatEventTime = (event) => {
      // 1. Si l'API nous donne déjà l'heure formatée, on l'utilise
      if (event.start_time) return event.start_time;
      
      // 2. Sinon, on essaie de l'extraire de la date complète (format ISO)
      if (event.scheduled_date) {
          try {
              const dateObj = new Date(event.scheduled_date);
              // On récupère l'heure locale HH:MM
              return dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          } catch (e) {
              return '09:00'; // Fallback
          }
      }
      return '';
  };

  const handleEventClick = (e, event) => {
    if(e) e.stopPropagation(); 
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleNewReservation = () => {
    setSelectedEvent({
        isNew: true,
        scheduled_date: new Date().toISOString().split('T')[0],
        status: 'confirmed'
    });
    setIsModalOpen(true);
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="p-8 h-full overflow-y-auto" data-lenis-prevent>
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="font-serif text-4xl text-[#2C2C2C] dark:text-[#F9F7F2] mb-2">Calendrier</motion.h1>
          <p className="text-[#2C2C2C]/60 dark:text-gray-400 font-sans">Planning des interventions validées.</p>
        </div>
        <div className="flex items-center gap-4">
             <button onClick={toggleTheme} className="p-2 bg-white dark:bg-[#1E1E1E] rounded-full border border-gray-200 dark:border-white/10 text-gray-400 hover:text-[#B47C5E] transition-all shadow-sm">
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
             </button>
             <button onClick={handleNewReservation} className="flex items-center gap-2 px-6 py-3 bg-[#2C2C2C] dark:bg-white text-white dark:text-[#2C2C2C] rounded-xl shadow-lg hover:bg-[#B47C5E] dark:hover:bg-[#B47C5E] dark:hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                <Plus className="w-4 h-4" /> Nouvelle Réservation
             </button>
             <div className="hidden md:block h-10 w-[1px] bg-gray-300 dark:bg-white/10 mx-2"></div>
             <div className="hidden md:block"><NotificationBell /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-auto lg:h-[calc(100vh-200px)]">
          <div className="lg:col-span-1 flex flex-col gap-6 h-full">
             <Card className="flex flex-col items-center">
                 <div className="flex items-center justify-between w-full mb-4">
                     <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full dark:text-white"><ChevronLeft className="w-4 h-4" /></button>
                     <span className="font-serif font-bold text-lg text-[#2C2C2C] dark:text-[#F9F7F2] capitalize">{monthNames[month]} {year}</span>
                     <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full dark:text-white"><ChevronRight className="w-4 h-4" /></button>
                 </div>
                 <div className="w-full pt-4 border-t border-gray-100 dark:border-white/5"><div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2"><div className="w-2 h-2 rounded-full bg-[#B47C5E]"></div> Confirmé</div></div>
             </Card>

             <Card title={selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} className="flex-1 overflow-y-auto">
                 <div className="space-y-3">
                     {loading ? <div className="text-center py-4 text-xs italic">Chargement...</div> : selectedEvents.length === 0 ? <div className="text-center py-10 opacity-50"><CalIcon className="w-8 h-8 mx-auto mb-2 text-gray-400"/><p className="text-xs text-gray-400">Rien de prévu.</p></div> : 
                         selectedEvents.map((event) => (
                             <div key={event.id} onClick={(e) => handleEventClick(e, event)} className="p-3 bg-[#F9F7F2] dark:bg-white/5 rounded-xl border border-[#2C2C2C]/5 transition-colors group hover:border-[#B47C5E]/30 cursor-pointer hover:shadow-md">
                                 <div className="flex justify-between items-start mb-1">
                                     <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#B47C5E]/10 text-[#B47C5E]">Validé</span>
                                     {/* CORRECTION ICI : Utilisation de formatEventTime */}
                                     <span className="text-xs font-bold text-[#2C2C2C] dark:text-white">{formatEventTime(event)}</span>
                                 </div>
                                 <h4 className="font-serif text-sm text-[#2C2C2C] dark:text-[#F9F7F2] mt-1 font-bold">{event.service_name}</h4>
                                 <p className="text-xs text-gray-500">{event.client_firstname} {event.client_lastname}</p>
                                 <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400"><MapPin className="w-3 h-3" /> <span className="truncate">{event.property_name || '...'}</span></div>
                             </div>
                         ))
                     }
                 </div>
             </Card>
          </div>

          <Card className="lg:col-span-3 flex flex-col h-full overflow-hidden p-0 bg-transparent shadow-none border-0">
              <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-t-3xl border-b border-[#2C2C2C]/5 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="grid grid-cols-7 w-full md:w-1/3">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (<div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">{day}</div>))}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-2/3">
                      <div className="flex items-center gap-1 text-xs bg-gray-50 dark:bg-white/5 p-1 rounded-lg mr-2">
                          <span className="px-2 text-gray-400 hidden lg:inline"><Eye className="w-3 h-3"/></span>
                          {['service', 'client', 'property'].map(mode => (
                              <button key={mode} onClick={() => setViewMode(mode)} className={`px-2 py-1 rounded capitalize transition-all ${viewMode === mode ? 'bg-white dark:bg-[#2C2C2C] text-[#B47C5E] shadow-sm font-bold' : 'text-gray-500'}`}>{mode === 'property' ? 'Bien' : mode}</button>
                          ))}
                      </div>
                      <div className="relative group">
                          <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs rounded-lg px-2 py-2 pr-6 outline-none text-[#2C2C2C] dark:text-white cursor-pointer w-24 md:w-auto">
                            <option value="all">Clients (Tous)</option>
                            {uniqueClientNames.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                      </div>
                      {(filterClient !== 'all' || filterProperty !== 'all') && <button onClick={() => { setFilterClient('all'); setFilterProperty('all'); }} className="p-2 bg-red-50 text-red-500 rounded-lg"><X className="w-3 h-3" /></button>}
                  </div>
              </div>
              
              <div className="grid grid-cols-7 auto-rows-fr gap-2 flex-1 overflow-y-auto bg-white dark:bg-[#1E1E1E] p-4 rounded-b-3xl">
                  {totalSlots.map((day, index) => {
                      const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                      const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
                      const dayEvents = getEventsForDay(day);

                      return (
                          <div key={index} onClick={() => day && setSelectedDate(new Date(year, month, day))} className={`relative p-2 rounded-xl border transition-all cursor-pointer min-h-[100px] flex flex-col group ${!day ? 'bg-transparent border-transparent cursor-default' : isSelected ? 'bg-[#F9F7F2] dark:bg-white/10 border-[#B47C5E] ring-1 ring-[#B47C5E]' : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-[#B47C5E]/50 hover:shadow-md'}`}>
                              {day && (
                                  <>
                                      <span className={`font-serif text-sm font-bold mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[#2C2C2C] text-white dark:bg-white dark:text-[#2C2C2C]' : 'text-gray-400 group-hover:text-[#2C2C2C] dark:group-hover:text-white'}`}>{day}</span>
                                      <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1">
                                          {dayEvents.map((ev) => (
                                              <div key={ev.id} onClick={(e) => handleEventClick(e, ev)} className="text-[9px] px-1.5 py-1 rounded truncate font-medium transition-transform hover:scale-105 cursor-pointer bg-[#B47C5E] text-white" title={ev.service_name}>{getEventLabel(ev)}</div>
                                          ))}
                                      </div>
                                  </>
                              )}
                          </div>
                      );
                  })}
              </div>
          </Card>
      </div>

      <AssignmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        reservation={selectedEvent} 
        clients={clientsList} 
        onAssignSuccess={fetchData} 
      />
    </div>
  );
};

export default CalendarPage;