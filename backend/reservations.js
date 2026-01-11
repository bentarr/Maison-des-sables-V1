// backend/reservations.js
const { createNotification } = require('./notifications');
const { sendTransactionalEmail } = require('./emailService');

// --- CRÉATION AUTOMATIQUE (Depuis demande client) ---
const createReservationFromRequest = async (pool, requestData, io) => {
    const initialStatus = 'assigned'; 
    try {
        const { id, user_id, property_id, service_id, scheduled_date, notes } = requestData;
        console.log(`⏳ Création réservation (Demande ID: ${id})...`);

        // Récupération du prix
        const serviceQuery = await pool.query('SELECT price FROM services WHERE id = $1', [service_id]);
        let priceToStore = 0;
        if (serviceQuery.rows.length > 0) priceToStore = serviceQuery.rows[0].price;

        const newReservation = await pool.query(
            `INSERT INTO reservations (request_id, user_id, property_id, service_id, scheduled_date, notes, status, total_price)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, status, request_id, total_price`,
            [id, user_id, property_id || null, service_id, scheduled_date, notes, initialStatus, priceToStore]
        );
        console.log(`✅ Réservation créée : ID ${newReservation.rows[0].id}`);
        return { success: true, reservation: newReservation.rows[0] };
    } catch (err) {
        console.error(`❌ Erreur createReservationFromRequest :`, err.message);
        return { success: false, error: err.message };
    }
};

// --- ASSIGNATION (GARDÉ POUR COMPATIBILITÉ) ---
const assignProviderToReservation = async (req, res, pool) => {
    // ... (Logique existante conservée si besoin)
};

// --- VUE CALENDRIER ADMIN (CORRIGÉE : Heure, Client, Titre) ---
const getAllReservations = async (req, res, pool) => {
    try {
        console.log("🗓️ Récupération Calendrier Maître...");

        const allReservations = await pool.query(
            `SELECT
                r.id, 
                r.user_id, -- INDISPENSABLE pour faire le lien avec le client
                r.scheduled_date,
                -- 1. HEURE PROPRE
                TO_CHAR(r.scheduled_date, 'HH24:MI') as start_time,
                r.status, 
                r.notes, 
                r.created_at,
                r.total_price,
                COALESCE(p.address, 'Lieu spécifié en notes') AS property_address,
                -- 2. TITRE (Service ou Notes)
                COALESCE(s.name, r.notes, 'Intervention') AS service_name,
                -- 3. INFOS CLIENT
                u.email AS owner_email,
                u.first_name AS client_firstname,
                u.last_name AS client_lastname,
                sp.name AS provider_name,
                sp.id AS provider_id
            FROM
                reservations r
            LEFT JOIN properties p ON r.property_id = p.id
            LEFT JOIN services s ON r.service_id = s.id
            LEFT JOIN users u ON r.user_id = u.id 
            LEFT JOIN service_providers sp ON r.provider_id = sp.id
            ORDER BY
                r.scheduled_date ASC`
        );
        
        console.log(`✅ ${allReservations.rows.length} réservations envoyées.`);
        res.json(allReservations.rows);

    } catch (err) {
        console.error("❌ Erreur getAllReservations :", err.message);
        res.status(500).json({ success: false, error: "Erreur récupération." });
    }
};

const getUserReservations = async (req, res, pool) => {
    try {
        const user_id = req.user.user_id; 
        const userReservations = await pool.query(
            `SELECT r.*, s.name AS service_name, sp.name AS provider_name 
             FROM reservations r 
             JOIN services s ON r.service_id = s.id 
             LEFT JOIN service_providers sp ON r.provider_id = sp.id 
             WHERE r.user_id = $1 ORDER BY r.scheduled_date ASC`,
            [user_id]
        );
        res.json(userReservations.rows);
    } catch (err) { res.status(500).json({ error: "Erreur" }); }
};

module.exports = {
    createReservationFromRequest,
    assignProviderToReservation,
    getAllReservations,
    getUserReservations,
};