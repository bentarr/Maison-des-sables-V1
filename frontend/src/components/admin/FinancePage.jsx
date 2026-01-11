// src/components/admin/FinancePage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Euro, TrendingUp, TrendingDown, Download, Wallet, FileText, Filter, Sun, Moon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import NotificationBell from '../common/NotificationBell'; 

const yearlyData = [
  { name: 'Jan', revenue: 45000, expenses: 12000 },
  { name: 'Fév', revenue: 52000, expenses: 15000 },
  { name: 'Mar', revenue: 48000, expenses: 11000 },
  { name: 'Avr', revenue: 61000, expenses: 18000 },
  { name: 'Mai', revenue: 55000, expenses: 20000 },
  { name: 'Juin', revenue: 67000, expenses: 22000 },
  { name: 'Juil', revenue: 72000, expenses: 25000 },
];

const transactions = [
  { id: 1, label: 'Loyer - Villa Les Palmiers', date: '04 Juil, 2025', amount: '+ 12,500€', type: 'income', status: 'Payé' },
  { id: 2, label: 'Entretien Piscine - Prestataire', date: '03 Juil, 2025', amount: '- 450€', type: 'expense', status: 'En attente' },
  { id: 3, label: 'Conciergerie - Mr. Dupont', date: '02 Juil, 2025', amount: '+ 2,300€', type: 'income', status: 'Payé' },
  { id: 4, label: 'Réparation Clim - Urgence', date: '01 Juil, 2025', amount: '- 890€', type: 'expense', status: 'Payé' },
  { id: 5, label: 'Approvisionnement Cave', date: '30 Juin, 2025', amount: '- 1,200€', type: 'expense', status: 'Payé' },
];

const expensesData = [ { name: 'Maintenance', value: 35 }, { name: 'Staff', value: 45 }, { name: 'Utilitaires', value: 20 } ];
const COLORS = ['#2C2C2C', '#B47C5E', '#E5E5E5'];

const Card = ({ children, className, title, icon: Icon, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}
    className={`bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-[#2C2C2C]/5 dark:border-white/5 transition-colors duration-300 ${className}`}
  >
    {(title || Icon) && (
      <div className="flex items-center justify-between mb-6">
        {title && <h3 className="font-serif text-lg text-[#2C2C2C] dark:text-[#F9F7F2]">{title}</h3>}
        {Icon && <Icon className="text-[#B47C5E] w-5 h-5" />}
      </div>
    )}
    {children}
  </motion.div>
);

const FinancePage = ({ isDarkMode, toggleTheme }) => {
  return (
    <div className="p-8 h-full overflow-y-auto" data-lenis-prevent>
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="font-serif text-4xl text-[#2C2C2C] dark:text-[#F9F7F2] mb-2 transition-colors">Finance & Trésorerie</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[#2C2C2C]/60 dark:text-gray-400 font-sans transition-colors">Suivi des revenus, des charges et des paiements propriétaires.</motion.p>
        </div>

        <div className="flex items-center gap-6">
           <button onClick={toggleTheme} className="p-2 bg-white dark:bg-[#1E1E1E] rounded-full border border-gray-200 dark:border-white/10 text-gray-400 hover:text-[#B47C5E] transition-all shadow-sm">
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
           </button>
           <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E1E1E] border border-[#2C2C2C]/10 dark:border-white/10 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#2C2C2C] dark:hover:bg-white hover:text-white dark:hover:text-[#2C2C2C] dark:text-white transition-colors">
              <Download className="w-4 h-4" /> Exporter
           </button>
           <NotificationBell />
           <div className="h-10 w-10 rounded-full bg-[#B47C5E] overflow-hidden border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">A</div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="flex flex-col justify-between h-40">
            <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Revenus Totaux (YTD)</p>
                <h3 className="font-serif text-3xl text-[#2C2C2C] dark:text-[#F9F7F2]">420,500 €</h3>
            </div>
            <div className="flex items-center text-green-600 dark:text-green-400 text-xs font-bold bg-green-50 dark:bg-green-900/20 w-fit px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" /> +12% vs 2024
            </div>
        </Card>

        <Card className="flex flex-col justify-between h-40">
            <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Dépenses Totales</p>
                <h3 className="font-serif text-3xl text-[#2C2C2C] dark:text-[#F9F7F2]">85,200 €</h3>
            </div>
            <div className="flex items-center text-red-500 dark:text-red-400 text-xs font-bold bg-red-50 dark:bg-red-900/20 w-fit px-2 py-1 rounded-full">
                <TrendingDown className="w-3 h-3 mr-1" /> +5% (Maintenance)
            </div>
        </Card>

        <Card className="flex flex-col justify-between h-40 bg-[#2C2C2C] text-[#F9F7F2]">
            <div>
                <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Bénéfice Net</p>
                <h3 className="font-serif text-3xl">335,300 €</h3>
            </div>
            <div className="flex items-center opacity-80 text-xs font-bold bg-white/10 w-fit px-2 py-1 rounded-full">
                <Wallet className="w-3 h-3 mr-1" /> Marge: 79%
            </div>
        </Card>
      </div>

      {/* GRAPHIQUE PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 h-[400px]">
        <Card className="lg:col-span-2 flex flex-col" title="Analyse des Flux" icon={TrendingUp} delay={0.2}>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={yearlyData}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#B47C5E" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#B47C5E" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#333' : '#f0f0f0'} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: isDarkMode ? '#1E1E1E' : '#2C2C2C', 
                                border: isDarkMode ? '1px solid #333' : 'none', 
                                borderRadius: '8px', 
                                color: '#fff' 
                            }}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="revenue" name="Revenus" stroke="#B47C5E" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                        <Area type="monotone" dataKey="expenses" name="Dépenses" stroke={isDarkMode ? '#555' : '#2C2C2C'} strokeWidth={2} fillOpacity={0} fill="transparent" strokeDasharray="5 5" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>

        <Card className="lg:col-span-1" title="Répartition Coûts" icon={FileText} delay={0.3}>
             <div className="h-full flex flex-col justify-center">
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={expensesData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fill: '#6B7280'}} axisLine={false} tickLine={false} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {expensesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-400">Le poste "Staff" représente la plus grosse dépense ce mois-ci.</p>
                </div>
             </div>
        </Card>
      </div>

      {/* TABLEAU */}
      <Card title="Dernières Transactions" icon={Filter} delay={0.4}>
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/10">
                          <th className="pb-3 font-medium">Description</th>
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Statut</th>
                          <th className="pb-3 font-medium text-right">Montant</th>
                      </tr>
                  </thead>
                  <tbody className="text-sm">
                      {transactions.map((t) => (
                          <tr key={t.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5 last:border-0">
                              <td className="py-4 font-serif text-[#2C2C2C] dark:text-[#F9F7F2]">{t.label}</td>
                              <td className="py-4 text-gray-500 dark:text-gray-400">{t.date}</td>
                              <td className="py-4">
                                  <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full ${
                                      t.status === 'Payé' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                  }`}>
                                      {t.status}
                                  </span>
                              </td>
                              <td className={`py-4 text-right font-medium ${t.type === 'income' ? 'text-[#2C2C2C] dark:text-white' : 'text-gray-400'}`}>
                                  {t.amount}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
          <div className="mt-4 text-center">
             <button className="text-xs text-[#B47C5E] font-bold uppercase hover:underline">Voir tout l'historique</button>
          </div>
      </Card>

    </div>
  );
};

export default FinancePage;