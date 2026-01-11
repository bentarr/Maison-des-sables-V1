// src/components/admin/DashboardHome.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Clock, 
  ArrowRight, 
  Briefcase,
  TrendingUp,
  CalendarDays,
  RefreshCw,
  Moon,
  Sun,
  LogOut // AJOUT : Import de l'icône de déconnexion
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

import { apiRequest } from '../../services/api';
import RequestsTable from './RequestsTable';
import NotificationBell from '../common/NotificationBell'; 

const Card = ({ children, className, title, icon: Icon, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}
    className={`bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-[#2C2C2C]/5 dark:border-white/5 transition-colors duration-300 flex flex-col ${className}`}
  >
    {(title || Icon) && (
      <div className="flex items-center justify-between mb-6">
        {title && (
            <p className="text-xs uppercase tracking-widest text-[#2C2C2C]/60 dark:text-gray-400 bg-[#2C2C2C]/5 dark:bg-white/10 px-2 py-1 rounded font-medium">
                {title}
            </p>
        )}
        {Icon && (
            <div className="p-1.5 bg-[#B47C5E]/10 rounded-full">
                <Icon className="w-4 h-4 text-[#B47C5E]" />
            </div>
        )}
      </div>
    )}
    {children}
  </motion.div>
);

const DashboardHome = ({ onNavigate, isDarkMode, toggleTheme }) => {
  
  const [weeklyMovements, setWeeklyMovements] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [liveFeed, setLiveFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // AJOUT : Fonction pour gérer la déconnexion
  const handleLogout = () => {
    // 1. On supprime le token de connexion (adapte la clé si ce n'est pas 'token' ou 'admin_token')
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    
    // 2. On redirige vers la racine du site (index.astro)
    window.location.href = '/';
  };

  const timeAgo = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " an(s)";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " mois";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " j";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " h";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " min";
      return "À l'instant";
  };

  const getInitials = (first, last) => `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase() || '??';

  const loadDashboardData = useCallback(async () => {
    try {
        setLoading(true);
        const [resReservations, resRequests] = await Promise.all([
            apiRequest('/admin/reservations', 'GET'),
            apiRequest('/admin/requests', 'GET')
        ]);
        
        if (resReservations.success && Array.isArray(resReservations.data)) {
          const curr = new Date(); 
          const first = curr.getDate() - curr.getDay() + 1; 
          const last = first + 6; 
          const firstday = new Date(curr.setDate(first)); firstday.setHours(0, 0, 0, 0);
          const lastday = new Date(curr.setDate(last)); lastday.setHours(23, 59, 59, 999);

          const movements = [];
          let total = 0;
          const monthlyStats = {}; 
          const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

          resReservations.data.forEach(resa => {
             if (!resa.scheduled_date) return;
             const dateObj = new Date(resa.scheduled_date);

             if (dateObj >= firstday && dateObj <= lastday) {
                 movements.push({
                     id: resa.id,
                     name: `${resa.client_firstname || 'Client'} ${resa.client_lastname || ''}`,
                     service: resa.service_name || 'Service Inconnu',
                     property: resa.property_address || 'Adresse Inconnue',
                     dayDisplay: dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
                     time: dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' }),
                     rawDate: dateObj
                 });
             }

             let price = parseFloat(resa.total_price);
             if (isNaN(price)) price = 0; 

             if (resa.status !== 'cancelled') {
                 total += price;
                 const monthIndex = dateObj.getMonth();
                 if (monthNames[monthIndex]) { 
                     const mName = monthNames[monthIndex];
                     monthlyStats[mName] = (monthlyStats[mName] || 0) + price;
                 }
             }
          });

          movements.sort((a, b) => a.rawDate - b.rawDate);
          setWeeklyMovements(movements);

          const chartData = monthNames.map(m => ({ name: m, value: monthlyStats[m] || 0 }));
          setFinancialData(chartData);
          setTotalRevenue(total);
        }

        let activities = [];
        if (resReservations.success && Array.isArray(resReservations.data)) {
            const resActivities = resReservations.data.map(r => ({
                id: `res-${r.id}`,
                type: 'reservation',
                created_at: new Date(r.created_at), 
                user: `${r.client_firstname || ''} ${r.client_lastname || ''}`.trim() || 'Client',
                action: `Réservation confirmée : ${r.service_name}`,
                avatar: getInitials(r.client_firstname, r.client_lastname)
            }));
            activities = [...activities, ...resActivities];
        }
        if (resRequests.success && Array.isArray(resRequests.data)) {
            const reqActivities = resRequests.data.map(r => ({
                id: `req-${r.id}`,
                type: 'request',
                created_at: new Date(r.created_at || r.scheduled_date), 
                user: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Prospect',
                action: `Nouvelle demande : ${r.service_name}`,
                avatar: getInitials(r.first_name, r.last_name)
            }));
            activities = [...activities, ...reqActivities];
        }
        activities.sort((a, b) => b.created_at - a.created_at);
        setLiveFeed(activities.slice(0, 5));

    } catch (error) {
        console.error("Erreur dashboard:", error);
    } finally {
        setLoading(false);
        setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  const handleRefresh = () => { setIsRefreshing(true); loadDashboardData(); };
  const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

  return (
    // CORRECTION : Plus de background ici, on laisse celui du parent (AdminDashboard)
    <div className="p-8 h-full overflow-y-auto" data-lenis-prevent>
    
        {/* HEADER */}
        <div className="flex justify-between items-end mb-10">
            <div>
            {/* CORRECTION : Le titre sera bien visible car le fond sera noir grâce au parent */}
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="font-serif text-4xl text-[#2C2C2C] dark:text-[#F9F7F2] mb-2 transition-colors">
                Vue d'Ensemble
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[#2C2C2C]/60 dark:text-gray-400 font-sans transition-colors">
                Bienvenue. Voici l'activité de la semaine.
            </motion.p>
            </div>

            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleTheme} 
                    className="p-2 bg-white dark:bg-[#1E1E1E] rounded-full border border-gray-200 dark:border-white/10 text-gray-400 hover:text-[#B47C5E] transition-all shadow-sm"
                >
                    {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
                </button>

                <button 
                    onClick={handleRefresh}
                    className="p-2 bg-white dark:bg-[#1E1E1E] rounded-full border border-gray-200 dark:border-white/10 text-gray-400 hover:text-[#B47C5E] transition-all shadow-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>

                {/* AJOUT : Bouton de déconnexion */}
                <button 
                    onClick={handleLogout}
                    className="p-2 bg-white dark:bg-[#1E1E1E] rounded-full border border-gray-200 dark:border-white/10 text-gray-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                    title="Se déconnecter"
                >
                    <LogOut className="w-4 h-4" />
                </button>

                <NotificationBell />
                <div className="h-10 w-10 rounded-full bg-[#B47C5E] overflow-hidden border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">
                    A
                </div>
            </div>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
            
            {/* 1. INTERVENTIONS */}
            <Card className="col-span-1 md:col-span-2 row-span-1" title="Interventions semaine" icon={CalendarDays}>
                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 flex-1">
                    {loading ? (
                        <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#B47C5E]"></div></div>
                    ) : weeklyMovements.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                            <p className="text-gray-400 text-sm">Aucune intervention cette semaine.</p>
                            <p className="text-[10px] text-gray-300 mt-1">Le calme plat 🌴</p>
                        </div>
                    ) : (
                        weeklyMovements.map((move) => (
                            <div key={move.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 animate-fade-in hover:shadow-md transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-10 rounded-full bg-[#B47C5E]"></div>
                                    <div>
                                        <p className="font-serif text-[#2C2C2C] dark:text-[#F9F7F2] text-sm font-bold">{move.service}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{move.name}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate max-w-[200px]">{move.property}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="flex items-center gap-1 text-[#2C2C2C] font-bold text-sm bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-white/10 px-2 py-1 rounded-lg">
                                        <span className="text-[#B47C5E] uppercase text-[10px]">{move.dayDisplay}</span>
                                        <span className="dark:text-[#F9F7F2]">{move.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/5 flex justify-end">
                    <button onClick={() => onNavigate('calendar')} className="text-xs text-[#B47C5E] font-bold uppercase flex items-center gap-1 hover:gap-2 transition-all">
                        Voir le planning <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </Card>

            {/* 2. CHIFFRE D'AFFAIRES */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-1" title="Chiffre d'Affaires" icon={TrendingUp} delay={0.1}>
                <div className="flex flex-col justify-between h-full">
                    <div className="mb-4">
                        {loading ? (
                            <div className="h-10 w-32 bg-gray-100 dark:bg-white/5 animate-pulse rounded"></div>
                        ) : (
                            <h3 className="font-serif text-4xl text-[#B47C5E] font-medium">
                                {formatCurrency(totalRevenue)}
                            </h3>
                        )}
                    </div>
                    <div className="h-32 w-full -ml-2">
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={financialData}>
                            <defs>
                            <linearGradient id="colorValueHome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#B47C5E" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#B47C5E" stopOpacity={0}/>
                            </linearGradient>
                            </defs>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: isDarkMode ? '#1E1E1E' : '#fff', 
                                    border: isDarkMode ? '1px solid #333' : '1px solid #eee', 
                                    borderRadius: '8px',
                                    color: isDarkMode ? '#F9F7F2' : '#2C2C2C'
                                }}
                                itemStyle={{ color: '#B47C5E', fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#B47C5E" strokeWidth={3} fillOpacity={1} fill="url(#colorValueHome)" />
                        </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-2 pt-4 border-t border-gray-50 dark:border-white/5 flex justify-end">
                        <button 
                            onClick={() => onNavigate('finance')}
                            className="text-xs text-[#2C2C2C] dark:text-gray-300 font-bold uppercase flex items-center gap-1 hover:gap-2 hover:text-[#B47C5E] transition-all"
                        >
                            Voir les rapports <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </Card>

            {/* 3. CONCIERGE LIVE */}
            <Card className="col-span-1 row-span-2" title="Concierge Live" icon={MessageSquare} delay={0.2}>
                <div className="space-y-6 relative h-full overflow-y-auto custom-scrollbar pr-1 pb-4">
                    <div className="absolute left-4 top-2 bottom-2 w-[1px] bg-gray-100 dark:bg-white/5"></div>
                    {loading ? (
                    <div className="flex flex-col gap-4 mt-2">
                        {[1,2,3].map(i => <div key={i} className="h-12 w-full bg-gray-50 dark:bg-white/5 animate-pulse rounded-lg ml-6"></div>)}
                    </div>
                    ) : liveFeed.length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-10">Aucune activité récente.</p>
                    ) : (
                        liveFeed.map((item) => (
                            <div key={item.id} className="relative flex gap-4 animate-fade-in">
                                <div className={`w-8 h-8 rounded-full border shadow-sm flex items-center justify-center text-[10px] font-bold z-10 
                                    ${item.type === 'request' 
                                        ? 'bg-[#2C2C2C] text-white border-[#2C2C2C] dark:bg-white dark:text-[#2C2C2C]' 
                                        : 'bg-white text-[#B47C5E] border-gray-200 dark:bg-[#1E1E1E] dark:border-white/10'}`}>
                                    {item.avatar}
                                </div>
                                <div className="flex-1 pb-4 border-b border-gray-50 dark:border-white/5 last:border-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-serif text-sm text-[#2C2C2C] dark:text-[#F9F7F2] font-bold">{item.user}</span>
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1 whitespace-nowrap">
                                            <Clock className="w-3 h-3" /> {timeAgo(item.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">{item.action}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* 4. ACTIONS REQUISES */}
            <div className="col-span-1 md:col-span-3 lg:col-span-3 row-span-1" style={{ animationDelay: '0.3s' }}>
                <RequestsTable /> 
            </div>

        </div>
    </div>
  );
};

export default DashboardHome;