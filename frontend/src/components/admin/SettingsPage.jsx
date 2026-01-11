// src/components/admin/SettingsPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Shield, LogOut, User } from 'lucide-react';
import NotificationBell from '../common/NotificationBell';

const Section = ({ title, children }) => (
  <div className="mb-8">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">{title}</h3>
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-[#2C2C2C]/5 dark:border-white/5 overflow-hidden transition-colors">
          {children}
      </div>
  </div>
);

const Row = ({ icon: Icon, label, action, danger = false }) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full ${danger ? 'bg-red-50 text-red-500' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300'}`}>
              <Icon className="w-5 h-5" />
          </div>
          <span className={`font-medium ${danger ? 'text-red-500' : 'text-[#2C2C2C] dark:text-[#F9F7F2]'}`}>{label}</span>
      </div>
      <div className="text-gray-400 group-hover:text-[#B47C5E] transition-colors">
          {action || "→"}
      </div>
  </div>
);

const SettingsPage = ({ isDarkMode, toggleTheme }) => {
  return (
    <div className="p-8 h-full overflow-y-auto" data-lenis-prevent>
      
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="font-serif text-4xl text-[#2C2C2C] dark:text-[#F9F7F2] mb-2 transition-colors">Paramètres</h1>
          <p className="text-[#2C2C2C]/60 dark:text-gray-400 font-sans transition-colors">Préférences de l'application.</p>
        </div>
        <div className="flex items-center gap-6">
            <NotificationBell />
            <div className="h-10 w-10 rounded-full bg-[#B47C5E] text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-md">A</div>
        </div>
      </div>

      <div className="max-w-2xl">
          
          {/* Apparence */}
          <Section title="Apparence">
              <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300">
                          {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      </div>
                      <span className="font-medium text-[#2C2C2C] dark:text-[#F9F7F2]">Mode Sombre</span>
                  </div>
                  {/* Switch Toggle */}
                  <button 
                      onClick={toggleTheme}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-[#B47C5E]' : 'bg-gray-200'}`}
                  >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
              </div>
          </Section>

          {/* Compte */}
          <Section title="Mon Compte">
              <Row icon={User} label="Modifier le profil" />
              <Row icon={Bell} label="Notifications" />
              <Row icon={Shield} label="Sécurité & Mot de passe" />
          </Section>

          {/* Session */}
          <Section title="Session">
              <Row icon={LogOut} label="Déconnexion" danger action="Se déconnecter" />
          </Section>

      </div>

    </div>
  );
};

export default SettingsPage;