import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../services/api';
import io from 'socket.io-client';
import { Bell, X, Check, Trash2, Info } from 'lucide-react';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [token, setToken] = useState(null); 
  const buttonRef = useRef(null);

  // 1. Récup Token
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const t = localStorage.getItem('admin_token') || localStorage.getItem('client_token');
        setToken(t);
    }
  }, []);

  // 2. Socket & API
  useEffect(() => {
    if (!token) return;

    const socket = io('http://localhost:5000', {
        auth: { token: token },
        transports: ['websocket'] 
    });

    socket.on('new_notification', (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    const fetchNotifications = async () => {
      const response = await apiRequest('/notifications', 'GET');
      if (response.success) {
        setNotifications(response.data);
        const unread = response.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    };
    fetchNotifications();

    return () => { socket.disconnect(); };
  }, [token]);

  // --- ACTIONS ---

  const markAsRead = async (id, e) => {
    e.stopPropagation(); // Empêche de fermer le menu si on clique
    // Optimistic UI : On met à jour l'affichage tout de suite
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Appel API silencieux
    await apiRequest('/notifications/read', 'PUT', { notificationId: id });
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    const notifToDelete = notifications.find(n => n.id === id);
    
    // Suppression visuelle immédiate
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notifToDelete && !notifToDelete.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Appel API
    await apiRequest(`/notifications/${id}`, 'DELETE');
  };

  // --- RENDER ---

  return (
    <div className="relative z-[9999]" ref={buttonRef}>
      
      {/* BOUTON CLOCHE */}
      <button 
        onClick={() => setShowDropdown(!showDropdown)} 
        className={`p-2 rounded-full relative transition-colors duration-200 ${showDropdown ? 'bg-gray-100 text-[#2C2C2C]' : 'text-gray-400 hover:text-[#2C2C2C]'}`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full border-2 border-[#F9F7F2]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {showDropdown && (
        <>
            <div className="fixed inset-0 z-[9998] cursor-default" onClick={() => setShowDropdown(false)}></div>

            <div 
                className="fixed mt-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[9999] animate-in fade-in zoom-in-95 duration-200"
                style={{
                    top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom : '60px',
                    left: buttonRef.current ? buttonRef.current.getBoundingClientRect().right - 384 : 'auto', // Ajusté pour largeur 96 (w-96)
                    right: buttonRef.current ? 'auto' : '20px'
                }}
            >
            <div className="flex justify-between items-center p-4 border-b bg-gray-50/80 backdrop-blur-sm">
                <h3 className="font-serif font-bold text-[#2C2C2C] text-sm">Notifications</h3>
                <button onClick={() => setShowDropdown(false)}><X className="w-4 h-4 text-gray-400 hover:text-red-500 transition"/></button>
            </div>
            
            <div className="max-h-96 overflow-y-auto custom-scrollbar bg-white">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-xs italic flex flex-col items-center gap-2">
                        <Bell className="w-8 h-8 opacity-20" />
                        <span>Vous êtes à jour !</span>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div 
                            key={n.id} 
                            className={`group p-4 border-b last:border-0 transition-all duration-200 hover:bg-gray-50 ${n.is_read ? 'opacity-60 bg-white' : 'bg-blue-50/30'}`}
                        >
                            <div className="flex justify-between items-start gap-3">
                                {/* Icone selon le type */}
                                <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 ${n.type === 'alert' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <Info className="w-3 h-3" />
                                </div>

                                {/* Contenu Texte */}
                                <div className="flex-1">
                                    <p className={`text-sm leading-snug ${n.is_read ? 'text-gray-500' : 'text-[#2C2C2C] font-medium'}`}>
                                        {n.message}
                                    </p>
                                    <span className="text-[10px] text-gray-400 mt-1 block">
                                        {new Date(n.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!n.is_read && (
                                        <button 
                                            onClick={(e) => markAsRead(n.id, e)}
                                            title="Marquer comme lu"
                                            className="p-1.5 rounded-md hover:bg-green-100 text-gray-400 hover:text-green-600 transition"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => deleteNotif(n.id, e)}
                                        title="Supprimer"
                                        className="p-1.5 rounded-md hover:bg-red-100 text-gray-400 hover:text-red-500 transition"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-2 bg-gray-50 text-center border-t">
                    <button 
                        onClick={async () => {
                            setNotifications(prev => prev.map(n => ({...n, is_read: true})));
                            setUnreadCount(0);
                            await apiRequest('/notifications/read', 'PUT', {});
                        }}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Tout marquer comme lu
                    </button>
                </div>
            )}
            </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;