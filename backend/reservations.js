// reservations.js (MISE À JOUR COMPLÈTE)

const { createNotification } = require('./notifications');
const { sendTransactionalEmail } = require('./emailService'); // NOUVEL IMPORT


const createReservationFromRequest = async (pool, requestData) => {
    // ... (Logique inchangée) ...
    const initialStatus = 'assigned'; 

    try {
        const { id, user_id, property_id, service_id, scheduled_date, notes } = requestData;

        console.log(`⏳ Tentative de création de réservation pour la demande ID: ${id}...`);

        const newReservation = await pool.query(
            `INSERT INTO reservations (request_id, user_id, property_id, service_id, scheduled_date, notes, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, status, request_id`,
            [id, user_id, property_id, service_id, scheduled_date, notes, initialStatus]
        );

        console.log(`✅ Réservation créée : ID ${newReservation.rows[0].id} à partir de la demande ID ${id}.`);
        
        return { success: true, reservation: newReservation.rows[0] };

    } catch (err) {
        console.error(`❌ Erreur dans createReservationFromRequest pour demande ID ${requestData.id}:`, err.message);
        return { success: false, error: err.message };
    }
};

const assignProviderToReservation = async (req, res, pool) => {
    try {
        const { id } = req.params;
        const { provider_id } = req.body;
        const io = req.io; // RÉCUPÉRER L'OBJET SOCKET.IO

        if (!provider_id) {
            return res.status(400).json({ error: "L'ID du prestataire est manquant." });
        }

        // Récupérer le nom du prestataire et l'email du propriétaire
        const providerCheck = await pool.query('SELECT sp.id, sp.name, u.email, r.user_id FROM service_providers sp JOIN reservations r ON r.provider_id IS NULL WHERE sp.id = $1 AND sp.is_active = TRUE AND r.id = $2', [provider_id, id]);
        
        if (providerCheck.rows.length === 0) {
             // On peut séparer les erreurs pour plus de clarté, mais ici on garde la simplicité
             return res.status(404).json({ error: "Prestataire non trouvé, inactif, ou Réservation déjà assignée." });
        }
        
        const providerName = providerCheck.rows[0].name;
        const userEmail = providerCheck.rows[0].email;
        const userId = providerCheck.rows[0].user_id;


        // Mise à jour de la réservation
        const result = await pool.query(
            `UPDATE reservations
             SET provider_id = $1, status = 'in_progress', assigned_at = NOW(), updated_at = NOW()
             WHERE id = $2 AND status = 'assigned'
             RETURNING id, status, provider_id, scheduled_date`, 
            [provider_id, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Réservation non trouvée ou déjà en cours de traitement." });
        }
        
        const reservationDetails = result.rows[0];

        // --- NOTIFICATION & EMAIL ---
        const scheduledDateStr = reservationDetails.scheduled_date.toISOString().substring(0, 10);
        const message = `Votre service a été assigné ! Le prestataire (${providerName}) interviendra le ${scheduledDateStr}.`;
        
        // 1. Notification In-App (WebSockets)
        await createNotification(pool, userId, message, 'reservation', reservationDetails.id, io); 
        
        // 2. Email
        const emailSubject = "📢 Prestataire assigné à votre service Maison des Sables !";
        const emailBody = `<p>Bonjour,</p><p>Bonne nouvelle ! Le prestataire **${providerName}** a été assigné à votre réservation (Service planifié pour le ${scheduledDateStr}).</p><p>Consultez votre espace client pour suivre l'avancement.</p>`;
        await sendTransactionalEmail(userEmail, emailSubject, emailBody);


        console.log(`🔗 Réservation ID ${id} assignée au prestataire ID ${provider_id}. Statut: in_progress.`);
        res.json({ success: true, message: "Prestataire assigné avec succès.", reservation: reservationDetails });

    } catch (err) {
        console.error("❌ Erreur assignProviderToReservation :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de l'assignation du prestataire." });
    }
};

const getAllReservations = async (req, res, pool) => {
    // ... (Logique Admin inchangée) ...
    try {
        console.log("🗓️ Récupération du Calendrier Maître (Admin)...");

        const allReservations = await pool.query(
            `SELECT
                r.id, 
                r.scheduled_date, 
                r.status, 
                r.notes,
                r.created_at,
                p.address AS property_address,
                s.name AS service_name,
                u.email AS owner_email,
                sp.name AS provider_name
            FROM
                reservations r
            JOIN
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
        res.status(500).json({ success: false, error: "Erreur lors de la récupération des réservations." });
    }
};


const getUserReservations = async (req, res, pool) => {
    // ... (Logique Client inchangée) ...
    try {
        const user_id = req.user.user_id; 

        console.log(`🗓️ Récupération des réservations pour le Client ID: ${user_id}...`);

        const userReservations = await pool.query(
            `SELECT
                r.id, 
                r.scheduled_date, 
                r.status, 
                r.notes,
                p.address AS property_address,
                s.name AS service_name,
                sp.name AS provider_name
            FROM
                reservations r
            JOIN
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
            return res.status(200).json({ message: "Aucune réservation trouvée pour ce client.", reservations: [] });
        }

        res.json(userReservations.rows);

    } catch (err) {
        console.error("❌ Erreur getUserReservations :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la récupération des réservations du client." });
    }
};


module.exports = {
    createReservationFromRequest,
    assignProviderToReservation,
    getAllReservations,
    getUserReservations,
};