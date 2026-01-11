// src/components/admin/ClientsPage.jsx
import React, { useState } from 'react';
import { Search, Mail, Phone, MoreHorizontal, User, Sun, Moon } from 'lucide-react';
import NotificationBell from '../common/NotificationBell';

const ClientsPage = ({ isDarkMode, toggleTheme }) => {
  const [clients, setClients] = useState([
      { id: 1, name: 'Paul Benett', email: 'paul@test.com', phone: '+33 6 12 34 56 78', role: 'Propriétaire', status: 'Actif' },
      { id: 2, name: 'Sophie Marceau', email: 'sophie@cinema.fr', phone: '+33 6 98 76 54 32', role: 'Locataire', status: 'Actif' },
      { id: 3, name: 'Jean Dujardin', email: 'jean@oss117.fr', phone: '+33 6 00 00 00 00', role: 'Propriétaire', status: 'Inactif' },
  ]);

  return (
    <div className="p-8 h-full overflow-y-auto" data-lenis-prevent>
      
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="font-serif text-4xl text-[#2C2C2C] dark:text-[#F9F7F2] mb-2 transition-colors">Clients</h1>
          <p className="text-[#2C2C2C]/60 dark:text-gray-400 font-sans transition-colors">Base de données utilisateurs.</p>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 bg-white dark:bg-[#1E1E1E] rounded-full border border-gray-200 dark:border-white/10 text-gray-400 hover:text-[#B47C5E] transition-all shadow-sm">
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <NotificationBell />
            <div className="h-10 w-10 rounded-full bg-[#B47C5E] flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-white">A</div>
        </div>
      </div>

      <div className="mb-8 relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Rechercher un client..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E] dark:text-white focus:outline-none focus:border-[#B47C5E] text-sm transition-colors" />
      </div>

      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-[#2C2C2C]/5 dark:border-white/5 overflow-hidden transition-colors">
          <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-white/5 text-xs uppercase text-gray-400 font-medium">
                  <tr>
                      <th className="px-6 py-4">Nom</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Rôle</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300">{client.name.charAt(0)}</div>
                                  <span className="font-serif text-[#2C2C2C] dark:text-[#F9F7F2]">{client.name}</span>
                              </div>
                          </td>
                          <td className="px-6 py-4">
                              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                  <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {client.email}</div>
                                  <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {client.phone}</div>
                              </div>
                          </td>
                          <td className="px-6 py-4"><span className="text-xs font-bold text-[#B47C5E] uppercase tracking-wide">{client.role}</span></td>
                          <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${client.status === 'Actif' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>{client.status}</span></td>
                          <td className="px-6 py-4 text-right"><button className="text-gray-300 hover:text-[#2C2C2C] dark:hover:text-white transition-colors"><MoreHorizontal className="w-5 h-5" /></button></td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
};

export default ClientsPage;