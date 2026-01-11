// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); 
require('dotenv').config();

// --- IMPORTS ---
const { register, login } = require('./auth');
const { handleNewLead, getAllLeads, handleNewRequest, getUserRequests, cancelRequest, getAllRequests, updateRequestStatus } = require('./leads'); 
const { protect, isAdmin } = require('./middleware/auth'); 
const { getUserProperties, getAllProperties, createProperty, updateProperty, deleteProperty } = require('./properties'); 
const { getAllServices, createService, updateService, deleteService } = require('./services'); 
const { createProvider, getAllProviders, updateProvider, deleteProvider } = require('./service_providers'); 
const { assignProviderToReservation, getAllReservations, getUserReservations } = require('./reservations'); 
const { createNotification, getNotificationsByUserId, markNotificationsAsRead, deleteNotification } = require('./notifications');
const { generateOwnerNetRevenueReport } = require('./financials');

const app = express();
const PORT = process.env.PORT || 5000;

// --- SOCKET.IO ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentification requise"));
    try {
        const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;
        socket.user = jwt.verify(tokenString, process.env.JWT_SECRET); 
        next();
    } catch (err) { next(new Error("Token invalide")); }
});

app.use((req, res, next) => { req.io = io; next(); });
io.on('connection', (socket) => { socket.join(socket.user.user_id); });

// --- BDD ---
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.get('/', (req, res) => res.send('🚀 Serveur Maison des Sables en ligne !'));

// Auth & Contact
app.post('/api/auth/register', (req, res) => register(req, res, pool));
app.post('/api/auth/login', (req, res) => login(req, res, pool));
app.post('/api/contact/lead', (req, res) => handleNewLead(req, res, pool));

// Services
app.get('/api/services/catalogue', (req, res) => getAllServices(req, res, pool));
app.post('/api/admin/services', protect('admin'), (req, res) => createService(req, res, pool));
app.get('/api/admin/services', protect('admin'), (req, res) => getAllServices(req, res, pool));
app.put('/api/admin/services/:id', protect('admin'), (req, res) => updateService(req, res, pool));
app.delete('/api/admin/services/:id', protect('admin'), (req, res) => deleteService(req, res, pool));

// Propriétés
app.get('/api/client/properties', protect('client'), (req, res) => getUserProperties(req, res, pool));
app.get('/api/admin/properties', protect('admin'), (req, res) => getAllProperties(req, res, pool));
app.post('/api/admin/properties', protect('admin'), (req, res) => createProperty(req, res, pool));
app.put('/api/admin/properties/:id', protect('admin'), (req, res) => updateProperty(req, res, pool));
app.delete('/api/admin/properties/:id', protect('admin'), (req, res) => deleteProperty(req, res, pool));

// Prestataires
app.post('/api/admin/providers', protect('admin'), (req, res) => createProvider(req, res, pool));
app.get('/api/admin/providers', protect('admin'), (req, res) => getAllProviders(req, res, pool));
app.put('/api/admin/providers/:id', protect('admin'), (req, res) => updateProvider(req, res, pool));
app.delete('/api/admin/providers/:id', protect('admin'), (req, res) => deleteProvider(req, res, pool));

// --- RÉSERVATIONS (CORRECTIFS APPLIQUÉS) ---

// 1. Lister
app.get('/api/admin/reservations', protect('admin'), (req, res) => getAllReservations(req, res, pool));
app.get('/api/client/reservations', protect('client'), (req, res) => getUserReservations(req, res, pool));

// 2. Création (CORRIGÉ : Fusion Date+Heure et gestion des notes)
app.post('/api/admin/reservations', protect('admin'), async (req, res) => {
    try {
        const { client_id, service_name, property_name, scheduled_date, start_time, status } = req.body;
        const finalStatus = status || 'confirmed'; 
        
        // On stocke le nom du service dans les notes pour l'affichage
        const manualNotes = service_name || "Intervention"; 

        // Fusion Date + Heure pour PostgreSQL
        const fullTimestamp = `${scheduled_date} ${start_time || '09:00'}`;

        const result = await pool.query(
            `INSERT INTO reservations 
            (user_id, scheduled_date, status, notes, created_at) 
            VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
            [client_id, fullTimestamp, finalStatus, manualNotes]
        );

        res.json({ success: true, message: "Réservation créée", id: result.rows[0].id });
    } catch (err) {
        console.error("❌ Erreur POST Reservation:", err.message);
        res.status(500).json({ success: false, message: "Erreur serveur : " + err.message });
    }
});

// 3. Modification (Route PUT standard ajoutée)
app.put('/api/admin/reservations/:id', protect('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { provider_id, status } = req.body;

        let fields = [];
        let values = [];
        let counter = 1;

        if (provider_id !== undefined) { fields.push(`provider_id = $${counter}`); values.push(provider_id); counter++; }
        if (status !== undefined) { fields.push(`status = $${counter}`); values.push(status); counter++; }

        if (fields.length === 0) return res.json({ success: true });

        values.push(id);
        const sql = `UPDATE reservations SET ${fields.join(', ')} WHERE id = $${counter}`;
        
        await pool.query(sql, values);
        res.json({ success: true, message: "Mise à jour réussie" });
    } catch (err) {
        console.error("❌ Erreur PUT Reservation:", err.message);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
});

// Legacy (optionnel, gardé pour compatibilité)
app.put('/api/admin/reservations/assign/:id', protect('admin'), (req, res) => assignProviderToReservation(req, res, pool));


// --- AUTRES ---
app.get('/api/notifications', protect(null), (req, res) => getNotificationsByUserId(req, res, pool));
app.put('/api/notifications/read', protect(null), (req, res) => markNotificationsAsRead(req, res, pool));
app.delete('/api/notifications/:id', protect(null), (req, res) => deleteNotification(req, res, pool));
app.get('/api/client/reports/net-revenue', protect('client'), (req, res) => generateOwnerNetRevenueReport(req, res, pool));
app.get('/api/admin/leads', protect('admin'), (req, res) => getAllLeads(req, res, pool));
app.get('/api/admin/requests', protect('admin'), (req, res) => getAllRequests(req, res, pool));
app.put('/api/admin/requests/status/:id', protect('admin'), (req, res) => updateRequestStatus(req, res, pool));

// Route Users pour le calendrier (CORRIGÉE : Plus de filtre role='client')
app.get('/api/admin/users', protect('admin'), async (req, res) => {
    try {
        const result = await pool.query('SELECT id, first_name, last_name, email FROM users ORDER BY id DESC');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Erreur users:", err);
        res.status(500).json({ success: false });
    }
});



app.post('/api/requests/new', protect('client'), (req, res) => handleNewRequest(req, res, pool));
app.get('/api/client/requests', protect('client'), (req, res) => getUserRequests(req, res, pool));
app.delete('/api/requests/cancel/:id', protect('client'), (req, res) => cancelRequest(req, res, pool));

server.listen(PORT, () => { console.log(`🚀 Serveur Maison des Sables en ligne sur http://localhost:${PORT}`); });