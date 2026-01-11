import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Inbox, 
  Home, 
  Settings, 
  Users, 
  BarChart3, 
  LogOut,
  Briefcase,
  Key 
} from 'lucide-react';

const Sidebar = ({ activeView, onNavigate, onExpand }) => {
  const [isHovered, setIsHovered] = useState(false);

  // On prévient le parent (AdminDashboard) quand l'état de survol change
  // pour qu'il puisse ajuster la marge du contenu principal
  useEffect(() => {
    if (onExpand) {
        onExpand(isHovered);
    }
  }, [isHovered, onExpand]);

  // AJOUT : Fonction de déconnexion
  const handleLogout = () => {
    // 1. Nettoyage des tokens
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    
    // 2. Redirection vers l'accueil
    window.location.href = '/';
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: "Vue d'ensemble" },
    { id: 'calendar', icon: Calendar, label: "Planning" },
    { id: 'properties', icon: Key, label: "Propriétés" },
    { id: 'requests', icon: Inbox, label: "Demandes", count: 2 },
    { id: 'clients', icon: Users, label: "Clients" },
    { id: 'providers', icon: Briefcase, label: "Partenaires" },
    { id: 'finance', icon: BarChart3, label: "Finances" },
    { id: 'settings', icon: Settings, label: "Paramètres" },
  ];

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-[#1E1E1E] border-r border-[#2C2C2C]/5 dark:border-white/10 z-50 flex flex-col justify-between py-10 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] w-24 hover:w-80 group shadow-2xl shadow-[#2C2C2C]/5 overflow-hidden"
    >
      
      {/* 1. LOGO */}
      <div className="px-8 flex items-center gap-6 mb-12 cursor-pointer" onClick={() => onNavigate('dashboard')}>
        <div className="h-10 w-10 min-w-[2.5rem] bg-[#2C2C2C] dark:bg-white rounded-full flex items-center justify-center text-[#F9F7F2] dark:text-[#2C2C2C] font-serif text-lg font-bold shadow-lg shadow-[#2C2C2C]/20">
          M
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 whitespace-nowrap">
          <h1 className="font-serif text-xl text-[#2C2C2C] dark:text-white tracking-tight">Maison des Sables</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Conciergerie</p>
        </div>
      </div>

      {/* 2. NAVIGATION */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          
          return (
            <button 
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative w-full flex items-center h-14 px-4 rounded-xl transition-all duration-300 group/item outline-none
                ${isActive 
                  ? 'bg-[#F9F7F2] dark:bg-white/10 text-[#2C2C2C] dark:text-white' 
                  : 'text-gray-400 hover:text-[#2C2C2C] dark:hover:text-white hover:bg-[#F9F7F2] dark:hover:bg-white/5'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-8 bg-[#B47C5E] rounded-r-full"></div>
              )}

              <div className="min-w-[1.5rem] flex justify-center">
                <item.icon 
                  strokeWidth={isActive ? 2 : 1.5} 
                  className={`w-6 h-6 transition-colors ${isActive ? 'text-[#B47C5E]' : 'group-hover/item:text-[#B47C5E]'}`} 
                />
              </div>

              <span className={`ml-6 font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75 whitespace-nowrap translate-x-4 group-hover:translate-x-0 ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>

              {item.count && (
                <span className="absolute right-4 w-5 h-5 flex items-center justify-center bg-[#B47C5E] text-white text-[9px] font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. PROFIL (Bouton de déconnexion) */}
      <div className="px-4 mt-auto">
        <button 
            // AJOUT : L'action de clic déclenche la déconnexion
            onClick={handleLogout}
            className="w-full flex items-center h-16 px-4 rounded-xl border border-transparent hover:border-[#2C2C2C]/5 dark:hover:border-white/10 hover:bg-[#F9F7F2] dark:hover:bg-white/5 transition-all duration-300 group/profile"
            title="Se déconnecter"
        >
            <div className="h-8 w-8 min-w-[2rem] rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">A</div>
            </div>
            
            <div className="ml-4 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 whitespace-nowrap overflow-hidden">
                <p className="text-sm font-bold text-[#2C2C2C] dark:text-white">Alexandre</p>
                <p className="text-[10px] text-gray-400">Admin</p>
            </div>

            <LogOut className="ml-auto w-4 h-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;