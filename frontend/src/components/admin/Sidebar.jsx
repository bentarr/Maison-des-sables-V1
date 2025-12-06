// src/components/admin/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Inbox, // CORRECTION : Majuscule pour l'import
  Home, 
  Settings, 
  Users, 
  BarChart3, 
  LogOut,
  Bell 
} from 'lucide-react';

const Sidebar = () => {
  // État pour savoir si la sidebar est survolée (étendue)
  const [isHovered, setIsHovered] = useState(false);

  // Effet : Ajoute/Enlève une classe sur le body pour signaler aux autres éléments que la sidebar est ouverte
  useEffect(() => {
    if (isHovered) {
      document.body.classList.add('sidebar-expanded');
    } else {
      document.body.classList.remove('sidebar-expanded');
    }
  }, [isHovered]);

  const menuItems = [
    { icon: Calendar, label: "Planning", href: "#" },
    { icon: Inbox, label: "Demandes", href: "#", count: 2 },
    { icon: Home, label: "Propriétés", href: "#" },
    { icon: Users, label: "Clients", href: "#" },
    { icon: Settings, label: "Services", href: "#" },
    { icon: BarChart3, label: "Finances", href: "#" },
  ];

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed left-0 top-0 h-screen bg-white border-r border-[#2C2C2C]/5 z-50 flex flex-col justify-between py-10 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] w-24 hover:w-80 group shadow-2xl shadow-[#2C2C2C]/5 overflow-hidden"
    >
      
      {/* 1. LOGO */}
      <div className="px-8 flex items-center gap-6 mb-12">
        <div className="h-10 w-10 min-w-[2.5rem] bg-[#2C2C2C] rounded-full flex items-center justify-center text-[#F9F7F2] font-serif text-lg font-bold shadow-lg shadow-[#2C2C2C]/20">
          M
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 whitespace-nowrap">
          <h1 className="font-serif text-xl text-[#2C2C2C] tracking-tight">Maison des Sables</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Conciergerie</p>
        </div>
      </div>

      {/* 2. NAVIGATION */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item, index) => (
          <a 
            key={index}
            href={item.href} 
            className="relative flex items-center h-14 px-4 rounded-xl text-gray-400 hover:text-[#2C2C2C] hover:bg-[#F9F7F2] transition-all duration-300 group/item"
          >
            {/* Icône (Reste fixe) */}
            <div className="min-w-[1.5rem] flex justify-center">
              <item.icon strokeWidth={1.5} className="w-6 h-6 transition-colors group-hover/item:text-[#B47C5E]" />
            </div>

            {/* Label (Apparaît au hover) */}
            <span className="ml-6 font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75 whitespace-nowrap translate-x-4 group-hover:translate-x-0">
              {item.label}
            </span>

            {/* Badge de notification (si existe) */}
            {item.count && (
              <span className="absolute right-4 w-5 h-5 flex items-center justify-center bg-[#B47C5E] text-white text-[9px] font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                {item.count}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* 3. PROFIL / DÉCONNEXION */}
      <div className="px-4 mt-auto">
        <button className="w-full flex items-center h-16 px-4 rounded-xl border border-transparent hover:border-[#2C2C2C]/5 hover:bg-[#F9F7F2] transition-all duration-300 group/profile">
            <div className="h-8 w-8 min-w-[2rem] rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">A</div>
            </div>
            
            <div className="ml-4 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 whitespace-nowrap overflow-hidden">
                <p className="text-sm font-bold text-[#2C2C2C]">Alexandre</p>
                <p className="text-[10px] text-gray-400">Admin</p>
            </div>

            <LogOut className="ml-auto w-4 h-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;