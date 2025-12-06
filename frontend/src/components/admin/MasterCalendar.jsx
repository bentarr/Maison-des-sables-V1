// src/components/admin/MasterCalendar.jsx
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import AssignmentModal from './AssignmentModal'; 

const MasterCalendar = () => {
  const [reservations, setReservations] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const fetchReservations = async () => {
    const response = await apiRequest('/admin/reservations', 'GET');
    if (response.success) setReservations(response.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
    // ÉCOUTEUR D'ÉVÉNEMENT POUR LE REFRESH AUTOMATIQUE
    const handleRefresh = () => {
        console.log("🔄 Refresh calendrier...");
        fetchReservations();
    };
    window.addEventListener('refresh_calendar', handleRefresh);
    return () => window.removeEventListener('refresh_calendar', handleRefresh);
  }, []);

  const handleEventClick = (event) => { setSelectedEvent(event); setIsModalOpen(true); };
  const handleAssignSuccess = () => { fetchReservations(); };
  
  // ... (Logique calendrier inchangée)
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => { let day = new Date(y, m, 1).getDay(); return day === 0 ? 6 : day - 1; };
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalSlots = [...blanks, ...days];
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reservations.filter(r => r.scheduled_date && r.scheduled_date.toString().startsWith(dateStr));
  };

  if (loading) return <div className="p-10 text-center text-gray-400 font-serif italic">Chargement...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#2C2C2C]/5 p-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="font-serif text-2xl text-[#2C2C2C]">Calendrier Maître</h2></div>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">←</button>
          <span className="font-serif text-lg min-w-[150px] text-center text-[#B47C5E]">{monthNames[month]} {year}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">→</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="grid grid-cols-7 mb-2 border-b border-gray-100 pb-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (<div key={d} className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{d}</div>))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr gap-2 flex-1">
          {totalSlots.map((day, index) => {
            const events = getEventsForDay(day);
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            return (
              <div key={index} className={`border border-gray-100 rounded-lg p-2 min-h-[80px] relative transition-all hover:shadow-sm ${!day ? 'bg-gray-50/30 border-dashed' : 'bg-white'}`}>
                {day && (
                  <>
                    <span className={`text-xs font-bold block mb-1 ${isToday ? 'text-[#B47C5E] bg-[#B47C5E]/10 w-6 h-6 flex items-center justify-center rounded-full' : 'text-gray-400'}`}>{day}</span>
                    <div className="space-y-1 overflow-y-auto max-h-[60px] custom-scrollbar">
                      {events.map(ev => (
                        <div key={ev.id} onClick={() => handleEventClick(ev)} className={`text-[10px] p-1.5 rounded text-white truncate shadow-sm group relative cursor-pointer transition-colors ${ev.status === 'in_progress' ? 'bg-[#B47C5E]' : 'bg-[#2C2C2C] hover:bg-[#B47C5E]'}`}>
                          <span className="font-bold">{ev.service_name}</span>
                          {!ev.provider_name && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AssignmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} reservation={selectedEvent} onAssignSuccess={handleAssignSuccess} />
    </div>
  );
};

export default MasterCalendar;