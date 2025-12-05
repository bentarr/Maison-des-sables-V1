// server.js (MISE À JOUR COMPLÈTE)

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const http = require('http'); // NOUVEAU
const { Server } = require('socket.io'); // NOUVEAU
require('dotenv').config();

// --- IMPORTS DES MODULES ---
const { register, login } = require('./auth');
const { handleNewLead, getAllLeads, handleNewRequest, getUserRequests, cancelRequest, getAllRequests, updateRequestStatus } = require('./leads'); 
const { protect } = require('./middleware/auth'); 
const { getUserProperties, getAllProperties, createProperty, updateProperty, deleteProperty } = require('./properties'); 
const { getAllServices, createService, updateService, deleteService } = require('./services'); 
const { createProvider, getAllProviders, updateProvider, deleteProvider } = require('./service_providers'); 
const { createReservationFromRequest, assignProviderToReservation, getAllReservations, getUserReservations } = require('./reservations'); 
const { createNotification, getNotificationsByUserId, markNotificationsAsRead } = require('./notifications');
const { generateOwnerNetRevenueReport } = require('./financials'); // NOUVEL IMPORT

const app = express();
const PORT = process.env.PORT || 5000;

// --- CONFIGURATION SOCKET.IO ---
const server = http.createServer(app); // Créer un serveur HTTP à partir de l'app Express
const io = new Server(server, { // Initialiser Socket.IO
    cors: {
        origin: "*", // A AJUSTER pour la production (URL de votre Front-end)
        methods: ["GET", "POST"]
    }
});

// Exposer 'io' à toutes les requêtes (middleware) pour qu'il soit accessible dans les contrôleurs
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
    console.log(`📡 Utilisateur connecté: ${socket.id}`);
    
    // Ceci est la logique Front-end : dès qu'un utilisateur s'authentifie, il doit rejoindre sa "room"
    // socket.on('authenticate', (userId) => { socket.join(userId); });

    socket.on('disconnect', () => {
        console.log(`🔌 Utilisateur déconnecté: ${socket.id}`);
    });
});
// ------------------------------------


// --- CONNEXION BDD ---
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// --- MIDDLEWARES ---
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

// 3. Leads (Formulaire de contact - Public)
app.post('/api/contact/lead', (req, res) => handleNewLead(req, res, pool));


// --- ROUTES SERVICES (Public/Admin) ---

// 11. Route Publique : Catalogue de Services
app.get('/api/services/catalogue', (req, res) => getAllServices(req, res, pool));

// 12. Admin : Créer un service (CREATE)
app.post('/api/admin/services', protect('admin'), (req, res) => createService(req, res, pool));

// 13. Admin : Voir TOUS les services (y compris inactifs - READ)
app.get('/api/admin/services', protect('admin'), (req, res) => getAllServices(req, res, pool));

// 14. Admin : Mettre à jour un service (UPDATE)
app.put('/api/admin/services/:id', protect('admin'), (req, res) => updateService(req, res, pool));

// 15. Admin : Supprimer un service (DELETE/Désactiver)
app.delete('/api/admin/services/:id', protect('admin'), (req, res) => deleteService(req, res, pool));


// --- ROUTES PROPERTIES (Admin/Client) ---

// 6. Client : Voir les biens du client
app.get('/api/client/properties', protect('client'), (req, res) => getUserProperties(req, res, pool));

// 16. Admin : Voir TOUS les biens (READ)
app.get('/api/admin/properties', protect('admin'), (req, res) => getAllProperties(req, res, pool));

// 17. Admin : Créer un bien (CREATE)
app.post('/api/admin/properties', protect('admin'), (req, res) => createProperty(req, res, pool));

// 18. Admin : Mettre à jour un bien (UPDATE)
app.put('/api/admin/properties/:id', protect('admin'), (req, res) => updateProperty(req, res, pool));

// 19. Admin : Supprimer un bien (DELETE/Désactiver)
app.delete('/api/admin/properties/:id', protect('admin'), (req, res) => deleteProperty(req, res, pool));


// --- ROUTES PRESTATAIRES (Admin) ---

// 20. Admin : Créer un prestataire (CREATE)
app.post('/api/admin/providers', protect('admin'), (req, res) => createProvider(req, res, pool));

// 21. Admin : Voir tous les prestataires (READ)
app.get('/api/admin/providers', protect('admin'), (req, res) => getAllProviders(req, res, pool));

// 22. Admin : Mettre à jour un prestataire (UPDATE)
app.put('/api/admin/providers/:id', protect('admin'), (req, res) => updateProvider(req, res, pool));

// 23. Admin : Supprimer/Désactiver un prestataire (DELETE)
app.delete('/api/admin/providers/:id', protect('admin'), (req, res) => deleteProvider(req, res, pool));


// --- ROUTES RESERVATIONS/ADMIN (Calendrier/Assignation) ---

// 24. Admin : Assigner un prestataire à une réservation
app.put('/api/admin/reservations/assign/:id', protect('admin'), (req, res) => assignProviderToReservation(req, res, pool));

// 25. Admin : Vue Calendrier Maître (Voir toutes les réservations)
app.get('/api/admin/reservations', protect('admin'), (req, res) => getAllReservations(req, res, pool));


// --- ROUTES RESERVATIONS/CLIENT (Calendrier Client) ---

// 26. Client : Vue Calendrier (Voir ses réservations)
app.get('/api/client/reservations', protect('client'), (req, res) => getUserReservations(req, res, pool));


// --- ROUTES NOTIFICATIONS (Client/Admin) ---

// 27. Récupérer les notifications
app.get('/api/notifications', protect('client'), (req, res) => getNotificationsByUserId(req, res, pool));

// 28. Marquer les notifications comme lues
app.put('/api/notifications/read', protect('client'), (req, res) => markNotificationsAsRead(req, res, pool));


// --- ROUTES FINANCIÈRES (Client) ---

// 29. NOUVEAU : Client : Génération du rapport de revenus nets
app.get('/api/client/reports/net-revenue', protect('client'), (req, res) => generateOwnerNetRevenueReport(req, res, pool));


// --- ROUTES ADMIN (Autres) ---

// 4. Admin : Voir les leads (prospects)
app.get('/api/admin/leads', protect('admin'), (req, res) => getAllLeads(req, res, pool));

// 9. Admin : Voir toutes les requêtes clients
app.get('/api/admin/requests', protect('admin'), (req, res) => getAllRequests(req, res, pool));

// 10. Admin : Valider/Refuser une demande (Update)
app.put('/api/admin/requests/status/:id', protect('admin'), (req, res) => updateRequestStatus(req, res, pool));


// --- ROUTES CLIENT (Rôle 'client' obligatoire) ---

// 5. Client : Création de demande
app.post('/api/requests/new', protect('client'), (req, res) => handleNewRequest(req, res, pool));

// 7. Client : Voir les demandes de service du client
app.get('/api/client/requests', protect('client'), (req, res) => getUserRequests(req, res, pool));

// 8. Client : Annulation d'une demande de service
app.delete('/api/requests/cancel/:id', protect('client'), (req, res) => cancelRequest(req, res, pool));


// --- DÉMARRAGE ---
// ATTENTION : On démarre le serveur HTTP, pas l'app Express
server.listen(PORT, () => {
    console.log(`🚀 Serveur Maison des Sables en ligne sur http://localhost:${PORT}`);
});