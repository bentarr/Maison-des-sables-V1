// server.js

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); 
require('dotenv').config();

// --- IMPORTS DES MODULES ---
const { register, login } = require('./auth');
const { handleNewLead, getAllLeads, handleNewRequest, getUserRequests, cancelRequest, getAllRequests, updateRequestStatus } = require('./leads'); 
const { protect } = require('./middleware/auth'); 
const { getUserProperties, getAllProperties, createProperty, updateProperty, deleteProperty } = require('./properties'); 
const { getAllServices, createService, updateService, deleteService } = require('./services'); 
const { createProvider, getAllProviders, updateProvider, deleteProvider } = require('./service_providers'); 
const { createReservationFromRequest, assignProviderToReservation, getAllReservations, getUserReservations } = require('./reservations'); 
// AJOUT DE deleteNotification DANS L'IMPORT
const { createNotification, getNotificationsByUserId, markNotificationsAsRead, deleteNotification } = require('./notifications');
const { generateOwnerNetRevenueReport } = require('./financials');

const app = express();
const PORT = process.env.PORT || 5000;

// --- CONFIGURATION SOCKET.IO ---
const server = http.createServer(app);
const io = new Server(server, { 
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// --- MIDDLEWARE SOCKET : AUTHENTIFICATION ---
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error("Authentification requise pour le socket"));
    }

    try {
        const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        socket.user = decoded; 
        next();
    } catch (err) {
        console.error("❌ Erreur Auth Socket:", err.message);
        next(new Error("Token invalide"));
    }
});

// Exposer 'io' à toutes les requêtes Express
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
    const userId = socket.user.user_id; 
    socket.join(userId); 
    console.log(`📡 Utilisateur ${userId} connecté et a rejoint la room ${userId}`);
    
    socket.on('disconnect', () => {
        console.log(`🔌 Utilisateur ${userId} déconnecté`);
    });
});

// --- CONNEXION BDD ---
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// --- MIDDLEWARES EXPRESS ---
app.use(cors());
app.use(express.json());


// --- ROUTES ---

// 1. Test
app.get('/', (req, res) => {
    res.send('🚀 Serveur Maison des Sables en ligne !');
});

// 2. Auth
app.post('/api/auth/register', (req, res) => register(req, res, pool));
app.post('/api/auth/login', (req, res) => login(req, res, pool));

// 3. Leads
app.post('/api/contact/lead', (req, res) => handleNewLead(req, res, pool));


// --- ROUTES SERVICES (Public/Admin) ---
app.get('/api/services/catalogue', (req, res) => getAllServices(req, res, pool));
app.post('/api/admin/services', protect('admin'), (req, res) => createService(req, res, pool));
app.get('/api/admin/services', protect('admin'), (req, res) => getAllServices(req, res, pool));
app.put('/api/admin/services/:id', protect('admin'), (req, res) => updateService(req, res, pool));
app.delete('/api/admin/services/:id', protect('admin'), (req, res) => deleteService(req, res, pool));


// --- ROUTES PROPERTIES (Admin/Client) ---
app.get('/api/client/properties', protect('client'), (req, res) => getUserProperties(req, res, pool));
app.get('/api/admin/properties', protect('admin'), (req, res) => getAllProperties(req, res, pool));
app.post('/api/admin/properties', protect('admin'), (req, res) => createProperty(req, res, pool));
app.put('/api/admin/properties/:id', protect('admin'), (req, res) => updateProperty(req, res, pool));
app.delete('/api/admin/properties/:id', protect('admin'), (req, res) => deleteProperty(req, res, pool));


// --- ROUTES PRESTATAIRES (Admin) ---
app.post('/api/admin/providers', protect('admin'), (req, res) => createProvider(req, res, pool));
app.get('/api/admin/providers', protect('admin'), (req, res) => getAllProviders(req, res, pool));
app.put('/api/admin/providers/:id', protect('admin'), (req, res) => updateProvider(req, res, pool));
app.delete('/api/admin/providers/:id', protect('admin'), (req, res) => deleteProvider(req, res, pool));


// --- ROUTES RESERVATIONS ---
app.put('/api/admin/reservations/assign/:id', protect('admin'), (req, res) => assignProviderToReservation(req, res, pool));
app.get('/api/admin/reservations', protect('admin'), (req, res) => getAllReservations(req, res, pool));
app.get('/api/client/reservations', protect('client'), (req, res) => getUserReservations(req, res, pool));


// --- ROUTES NOTIFICATIONS ---
app.get('/api/notifications', protect(null), (req, res) => getNotificationsByUserId(req, res, pool));
app.put('/api/notifications/read', protect(null), (req, res) => markNotificationsAsRead(req, res, pool));
// AJOUT DE LA ROUTE DELETE
app.delete('/api/notifications/:id', protect(null), (req, res) => deleteNotification(req, res, pool));


// --- ROUTES FINANCIÈRES ---
app.get('/api/client/reports/net-revenue', protect('client'), (req, res) => generateOwnerNetRevenueReport(req, res, pool));


// --- ROUTES ADMIN (Leads/Requests) ---
app.get('/api/admin/leads', protect('admin'), (req, res) => getAllLeads(req, res, pool));
app.get('/api/admin/requests', protect('admin'), (req, res) => getAllRequests(req, res, pool));
app.put('/api/admin/requests/status/:id', protect('admin'), (req, res) => updateRequestStatus(req, res, pool));


// --- ROUTES CLIENT (Requests) ---
app.post('/api/requests/new', protect('client'), (req, res) => handleNewRequest(req, res, pool));
app.get('/api/client/requests', protect('client'), (req, res) => getUserRequests(req, res, pool));
app.delete('/api/requests/cancel/:id', protect('client'), (req, res) => cancelRequest(req, res, pool));


// --- DÉMARRAGE ---
server.listen(PORT, () => {
    console.log(`🚀 Serveur Maison des Sables en ligne sur http://localhost:${PORT}`);
});