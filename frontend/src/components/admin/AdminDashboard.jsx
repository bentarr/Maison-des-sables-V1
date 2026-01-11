// src/components/admin/AdminDashboard.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Sidebar from './Sidebar';
import DashboardHome from './DashboardHome';
import CalendarPage from './CalendarPage';
import FinancePage from './FinancePage';
import ProvidersPage from './ProvidersPage';
import PropertiesPage from './PropertiesPage';
import RequestsPage from './RequestsPage';
import ClientsPage from './ClientsPage';
import SettingsPage from './SettingsPage';

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  
  // État Global Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // État Sidebar
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // PROPS COMMUNES : On les prépare pour les donner à toutes les pages
  const commonProps = {
    onNavigate: setCurrentView,
    isDarkMode: isDarkMode,
    toggleTheme: toggleTheme
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardHome key="home" {...commonProps} />;
      case 'calendar':
        return <CalendarPage key="calendar" {...commonProps} />;
      case 'properties':
        return <PropertiesPage key="properties" {...commonProps} />;
      case 'requests':
        return <RequestsPage key="requests" {...commonProps} />;
      case 'clients':
        return <ClientsPage key="clients" {...commonProps} />;
      case 'providers':
        return <ProvidersPage key="providers" {...commonProps} />;
      case 'finance':
        return <FinancePage key="finance" {...commonProps} />;
      case 'settings':
        return <SettingsPage key="settings" {...commonProps} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400 font-serif">
             🚧 Page {currentView} en construction...
          </div>
        );
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex h-screen overflow-hidden font-sans text-[#2C2C2C] bg-[#F9F7F2] dark:bg-[#121212] transition-colors duration-300 ease-in-out">
        
        {/* La Sidebar reçoit l'état pour s'adapter et la fonction onExpand pour le layout */}
        <Sidebar activeView={currentView} onNavigate={setCurrentView} onExpand={setIsSidebarExpanded} />
        
        {/* Le contenu principal s'adapte à la largeur de la sidebar */}
        <main className={`flex-1 relative transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] main-content ${isSidebarExpanded ? 'ml-80' : 'ml-24'}`}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentView} 
              initial={{ opacity: 0, x: 10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -10 }} 
              transition={{ duration: 0.3 }} 
              className="h-full w-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;