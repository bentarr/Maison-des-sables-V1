// src/components/admin/AdminDashboard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Euro, Users, MessageSquare, Clock } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

// Import des sous-composants
import MasterCalendar from './MasterCalendar';
import RequestsTable from './RequestsTable';
// CORRECTION : Import de la cloche
import NotificationBell from '../common/NotificationBell'; 

const revenueData = [
  { name: 'Jan', value: 4000 }, { name: 'Fév', value: 3000 }, { name: 'Mar', value: 5000 },
  { name: 'Avr', value: 2780 }, { name: 'Mai', value: 1890 }, { name: 'Juin', value: 2390 },
  { name: 'Juil', value: 3490 },
];

const leadsData = [
  { id: 1, name: 'Sophie Marceau', type: 'Villa Les Palmiers', status: 'Nouveau', time: '2h' },
  { id: 2, name: 'Jean Dujardin', type: 'Appartement Port', status: 'Contacté', time: '5h' },
  { id: 3, name: 'Marion Cotillard', type: 'Gestion Complète', status: 'Nouveau', time: '1j' },
];

const activityFeed = [
  { id: 1, user: 'M. Dupont', action: 'Fridging Service (Champagne)', time: '2 min ago', avatar: 'MD' },
  { id: 2, user: 'Sarah Jenkins', action: 'Private Chef Booking', time: '15 min ago', avatar: 'SJ' },
  { id: 3, user: 'Villa 4 Staff', action: 'AC Repair Request', time: '1 hour ago', avatar: 'VS' },
];

const Card = ({ children, className, title, icon: Icon, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}
    className={`bg-white rounded-3xl p-6 shadow-sm border border-[#2C2C2C]/5 ${className}`}
  >
    {(title || Icon) && (
      <div className="flex items-center justify-between mb-6">
        {title && <h3 className="font-serif text-lg text-[#2C2C2C]">{title}</h3>}
        {Icon && <Icon className="text-[#B47C5E] w-5 h-5" />}
      </div>
    )}
    {children}
  </motion.div>
);

const AdminDashboard = () => {
  return (
    <div className="p-8 h-full overflow-y-auto bg-[#F9F7F2]" data-lenis-prevent>
      
      {/* HEADER PRINCIPAL */}
      <div className="flex justify-between items-end mb-10">
        
        {/* TITRE ET BIENVENUE */}
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="font-serif text-4xl text-[#2C2C2C] mb-2">
            Vue d'Ensemble
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[#2C2C2C]/60 font-sans">
            Bienvenue, Alexandre. Il fait 24°C à Saint-Tropez.
          </motion.p>
        </div>

        {/* --- CORRECTION ICI : BARRE D'OUTILS (RECHERCHE + CLOCHE + AVATAR) --- */}
        <div className="flex items-center gap-6">
            {/* Barre de recherche */}
            <div className="hidden md:flex items-center bg-white rounded-full px-4 py-2 border border-[#2C2C2C]/5 shadow-sm">
                <span className="text-gray-300 mr-2">🔍</span>
                <input type="text" placeholder="Rechercher..." className="bg-transparent text-sm focus:outline-none text-[#2C2C2C] placeholder-gray-300 w-48"/>
            </div>
            
            {/* LA CLOCHE EST ICI ! */}
            <NotificationBell />
            
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-[#B47C5E] overflow-hidden border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">
                A
            </div>
        </div>
        {/* ------------------------------------------------------------------- */}

      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)] pb-10">
        
        {/* 1. CALENDRIER */}
        <Card className="col-span-1 md:col-span-3 row-span-2 overflow-hidden flex flex-col" title="Master Schedule" icon={CalendarIcon}>
          <div className="flex-1 min-h-[400px]"><MasterCalendar /></div>
        </Card>

        {/* 2. REVENUS */}
        <Card className="col-span-1 row-span-2 bg-[#2C2C2C] text-[#F9F7F2]" delay={0.1}>
          <div className="flex justify-between items-start mb-8">
            <div><p className="text-xs uppercase tracking-widest opacity-60 mb-1">Revenus Propriétaires</p><h3 className="font-serif text-4xl">€ 42,500</h3></div>
            <Euro className="opacity-50" />
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B47C5E" stopOpacity={0.3}/><stop offset="95%" stopColor="#B47C5E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{ backgroundColor: '#2C2C2C', border: 'none', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#B47C5E' }} />
                <Area type="monotone" dataKey="value" stroke="#B47C5E" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 bg-white/5 rounded-xl p-4"><p className="text-xs text-white/50 mb-1">Prochain Payout</p><p className="font-medium">1 Juillet 2025</p></div>
        </Card>

        {/* 3. LEADS */}
        <Card className="col-span-1 md:col-span-2" title="Nouveaux Leads" icon={Users} delay={0.2}>
          <div className="space-y-4">
            <div className="grid grid-cols-4 text-xs text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">
                <div className="col-span-2">Contact</div><div>Statut</div><div className="text-right">Attente</div>
            </div>
            {leadsData.map((lead) => (
                <div key={lead.id} className="grid grid-cols-4 items-center py-2 hover:bg-gray-50 rounded-lg transition-colors px-2 -mx-2 cursor-pointer group">
                    <div className="col-span-2"><div className="font-serif text-[#2C2C2C]">{lead.name}</div><div className="text-xs text-gray-500">{lead.type}</div></div>
                    <div><span className="px-2 py-1 bg-[#B47C5E]/10 text-[#B47C5E] text-[10px] uppercase font-bold rounded-full">{lead.status}</span></div>
                    <div className="text-right text-xs text-gray-400 font-medium">{lead.time}</div>
                </div>
            ))}
          </div>
        </Card>

        {/* 4. ACTIONS REQUISES */}
        <div className="col-span-1 md:col-span-2 row-span-1" style={{ animationDelay: '0.3s' }}>
           <RequestsTable />
        </div>

        {/* 5. CONCIERGE LIVE */}
        <Card className="col-span-1 row-span-2 md:col-span-1" title="Concierge Live" icon={MessageSquare} delay={0.4}>
            <div className="space-y-6 relative">
                <div className="absolute left-4 top-2 bottom-2 w-[1px] bg-gray-100"></div>
                {activityFeed.map((item) => (
                    <div key={item.id} className="relative flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[10px] font-bold text-[#2C2C2C] z-10">{item.avatar}</div>
                        <div className="flex-1 pb-4 border-b border-gray-50 last:border-0">
                            <div className="flex justify-between items-start mb-1"><span className="font-serif text-sm text-[#2C2C2C]">{item.user}</span><span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span></div>
                            <p className="text-xs text-gray-500 italic">{item.action}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>

        {/* 6. SERVICE SIMULATOR */}
        <Card className="col-span-1 md:col-span-1 bg-[#F5F5F5] border-none" delay={0.5}>
            <div className="h-full flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-2xl">✨</div>
                <h3 className="font-serif text-lg mb-2">Service Simulator</h3>
                <p className="text-xs text-gray-500 mb-4 px-4">Estimez les revenus ou créez une demande manuelle.</p>
                <button className="px-6 py-2 bg-[#2C2C2C] text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#B47C5E] transition-colors shadow-lg">Ouvrir</button>
            </div>
        </Card>

        {/* 7. PRESTATAIRES */}
        <Card className="col-span-1 md:col-span-2" title="Prestataires Actifs" icon={Users} delay={0.6}>
             <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {[1,2,3,4].map(i => (
                    <div key={i} className="flex-shrink-0 w-40 p-3 border border-gray-100 rounded-xl bg-gray-50/50 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                        <div><div className="font-bold text-xs text-[#2C2C2C]">Jardinier</div><div className="text-[10px] text-gray-400">En mission</div></div>
                    </div>
                ))}
             </div>
        </Card>

      </div>
    </div>
  );
};

export default AdminDashboard;