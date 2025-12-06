// backend/reservations.js (VERSION CORRIGÉE ET COMPLÈTE)

const { createNotification } = require('./notifications');
const { sendTransactionalEmail } = require('./emailService');

// --- CRÉATION AUTOMATIQUE ---
const createReservationFromRequest = async (pool, requestData, io) => {
    const initialStatus = 'assigned'; 

    try {
        const { id, user_id, property_id, service_id, scheduled_date, notes } = requestData;

        console.log(`⏳ Création réservation (Demande ID: ${id})...`);

        const newReservation = await pool.query(
            `INSERT INTO reservations (request_id, user_id, property_id, service_id, scheduled_date, notes, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, status, request_id`,
            [id, user_id, property_id || null, service_id, scheduled_date, notes, initialStatus]
        );

        console.log(`✅ Réservation créée : ID ${newReservation.rows[0].id}`);
        return { success: true, reservation: newReservation.rows[0] };

    } catch (err) {
        console.error(`❌ Erreur createReservationFromRequest :`, err.message);
        return { success: false, error: err.message };
    }
};

// --- ASSIGNATION & MODIFICATION PRESTATAIRE ---
const assignProviderToReservation = async (req, res, pool) => {
    try {
        const { id } = req.params;
        const { provider_id } = req.body;
        const io = req.io;

        if (!provider_id) return res.status(400).json({ error: "ID prestataire manquant." });

        // Vérification du prestataire
        const providerCheck = await pool.query('SELECT id, name FROM service_providers WHERE id = $1 AND is_active = TRUE', [provider_id]);
        if (providerCheck.rows.length === 0) return res.status(404).json({ error: "Prestataire introuvable." });
        
        const providerName = providerCheck.rows[0].name;

        // MISE À JOUR : Correction ici pour permettre la modification (OR status = 'in_progress')
        const result = await pool.query(
            `UPDATE reservations
             SET provider_id = $1, status = 'in_progress', assigned_at = NOW(), updated_at = NOW()
             WHERE id = $2 AND (status = 'assigned' OR status = 'in_progress')
             RETURNING id, status, provider_id, scheduled_date, user_id`, 
            [provider_id, id]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: "Réservation introuvable ou déjà traitée." });
        
        const reservationDetails = result.rows[0];

        // --- NOTIFICATIONS ---
        const scheduledDateStr = reservationDetails.scheduled_date.toISOString().substring(0, 10);
        const message = `Mise à jour : Prestataire (${providerName}) assigné pour le ${scheduledDateStr}.`;
        
        // 1. Notification In-App
        await createNotification(pool, reservationDetails.user_id, message, 'reservation', reservationDetails.id, io); 
        
        // 2. Email Transactionnel
        const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [reservationDetails.user_id]);
        if(userRes.rows.length > 0) {
             const emailSubject = "📢 Mise à jour prestataire !";
             const emailBody = `<p>Le prestataire **${providerName}** a été assigné (ou mis à jour) pour votre réservation du ${scheduledDateStr}.</p>`;
             await sendTransactionalEmail(userRes.rows[0].email, emailSubject, emailBody);
        }

        res.json({ success: true, message: "Prestataire assigné avec succès.", reservation: reservationDetails });

    } catch (err) {
        console.error("❌ Erreur assignProviderToReservation :", err.message);
        res.status(500).json({ success: false, error: "Erreur serveur." });
    }
};

// --- VUE CALENDRIER ADMIN (Toutes les réservations) ---
const getAllReservations = async (req, res, pool) => {
    try {
        console.log("🗓️ Récupération Calendrier Maître (Admin)...");

        const allReservations = await pool.query(
            `SELECT
                r.id, r.scheduled_date, r.status, r.notes, r.created_at,
                p.address AS property_address,    -- Peut être NULL (Lifestyle)
                s.name AS service_name,
                u.email AS owner_email,
                u.first_name AS client_firstname, -- POUR LA MODALE
                u.last_name AS client_lastname,   -- POUR LA MODALE
                sp.name AS provider_name,
                sp.id AS provider_id              -- POUR LA PRÉSÉLECTION
            FROM
                reservations r
            LEFT JOIN -- LEFT JOIN obligatoire pour les services sans maison
                properties p ON r.property_id = p.id
            JOIN
                services s ON r.service_id = s.id
            JOIN
                users u ON r.user_id = u.id
            LEFT JOIN 
                service_providers sp ON r.provider_id = sp.id
            ORDER BY
                r.scheduled_date ASC`
        );

        res.json(allReservations.rows);

    } catch (err) {
        console.error("❌ Erreur getAllReservations :", err.message);
        res.status(500).json({ success: false, error: "Erreur récupération." });
    }
};

// --- VUE CALENDRIER CLIENT (Ses réservations uniquement) ---
const getUserReservations = async (req, res, pool) => {
    try {
        const user_id = req.user.user_id; 
        console.log(`🗓️ Réservations Client ID: ${user_id}...`);

        const userReservations = await pool.query(
            `SELECT
                r.id, r.scheduled_date, r.status, r.notes,
                p.address AS property_address,
                s.name AS service_name,
                sp.name AS provider_name
            FROM
                reservations r
            LEFT JOIN 
                properties p ON r.property_id = p.id
            JOIN
                services s ON r.service_id = s.id
            LEFT JOIN 
                service_providers sp ON r.provider_id = sp.id
            WHERE
                r.user_id = $1
            ORDER BY
                r.scheduled_date ASC`,
            [user_id]
        );

        if (userReservations.rows.length === 0) {
            return res.status(200).json({ message: "Aucune réservation.", reservations: [] });
        }

        res.json(userReservations.rows);

    } catch (err) {
        console.error("❌ Erreur getUserReservations :", err.message);
        res.status(500).json({ success: false, error: "Erreur récupération." });
    }
};

module.exports = {
    createReservationFromRequest,
    assignProviderToReservation,
    getAllReservations,
    getUserReservations,
};