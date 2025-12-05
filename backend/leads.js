// GESTION DES LEADS ET REQUÊTES (PROSPECTS & CLIENTS) -- Leads.js

// On importe la fonction d'automatisation
const { createReservationFromRequest } = require('./reservations'); 
const { createNotification } = require('./notifications');
const { sendTransactionalEmail } = require('./emailService'); // NOUVEL IMPORT

// ---------------------------------------------------
// 1. GESTION DES PROSPECTS (Non connectés)
// ---------------------------------------------------

const handleNewLead = async (req, res, pool) => {
    try {
        // 1. On récupère les infos du formulaire
        const { email, name, phone, message, service_name, type_bien, surface } = req.body;

        console.log("📩 Nouveau prospect reçu :", email);

        // 2. ON STOCKE JUSTE LA DEMANDE (Pas de création de compte User)
        // On met tout dans la table 'leads' qui sert de boîte de réception
        await pool.query(
            `INSERT INTO leads (email, name, phone, type_bien, surface, service_interest, message)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [email, name, phone, type_bien, surface, service_name, message]
        );

        // 3. On répond au site que c'est bien reçu
        res.json({ success: true, message: "Demande transmise à l'équipe." });

    } catch (err) {
        console.error("❌ Erreur Lead :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de l'enregistrement." });
    }
};

// ---------------------------------------------------
// 2. GESTION DES REQUÊTES CLIENTS (Connectés)
// ---------------------------------------------------

/**
 * Gère une nouvelle requête de service par un utilisateur connecté.
 */
const handleNewRequest = async (req, res, pool) => {
    try {
        const user_id = req.user.user_id; 
        const { property_id, service_id, scheduled_date, notes } = req.body; 

        if (!property_id || !service_id || !scheduled_date) {
            return res.status(400).json({ error: "Champs manquants (bien, service, ou date)." });
        }

        console.log(`✨ Nouvelle requête de service pour l'utilisateur ID: ${user_id}`);

        // Insertion dans la BDD (table 'requests')
        const newRequest = await pool.query(
            `INSERT INTO requests (user_id, property_id, service_id, scheduled_date, notes, status)
             VALUES ($1, $2, $3, $4, $5, 'pending')
             RETURNING id, status`,
            [user_id, property_id, service_id, scheduled_date, notes]
        );

        res.status(201).json({ 
            success: true, 
            message: "Votre demande de service a été enregistrée et est en attente de validation.", 
            requestId: newRequest.rows[0].id 
        });

    } catch (err) {
        console.error("❌ Erreur Nouvelle Requête :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de l'enregistrement de la requête." });
    }
};

/**
 * Récupère toutes les requêtes de service pour un utilisateur connecté.
 */
const getUserRequests = async (req, res, pool) => {
    try {
        const user_id = req.user.user_id;
        
        console.log(`📑 Récupération des requêtes pour l'utilisateur ID: ${user_id}`);

        // Requête pour récupérer les demandes de service de cet utilisateur.
        const userRequests = await pool.query(
            `SELECT
                r.id,
                r.scheduled_date,
                r.notes,
                r.status,
                r.created_at,
                p.address AS property_address,
                s.name AS service_name
            FROM
                requests r
            JOIN
                properties p ON r.property_id = p.id
            JOIN
                services s ON r.service_id = s.id
            WHERE
                r.user_id = $1
            ORDER BY
                r.created_at DESC`,
            [user_id]
        );

        if (userRequests.rows.length === 0) {
            return res.status(200).json({ message: "Vous n'avez aucune demande de service en cours.", requests: [] });
        }

        res.json(userRequests.rows);

    } catch (err) {
        console.error("❌ Erreur getUserRequests :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la récupération de vos demandes." });
    }
};

/**
 * Annule une demande de service spécifique pour l'utilisateur.
 */
const cancelRequest = async (req, res, pool) => {
    try {
        const user_id = req.user.user_id;
        const { id } = req.params; 

        if (!id) {
            return res.status(400).json({ error: "L'ID de la demande est manquant." });
        }

        // Requête de mise à jour sécurisée : vérifie l'ID de la demande ET l'ID de l'utilisateur.
        const result = await pool.query(
            `UPDATE requests
             SET status = 'cancelled', updated_at = NOW()
             WHERE id = $1 AND user_id = $2 AND status = 'pending'
             RETURNING id, status`,
            [id, user_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Demande non trouvée, non autorisée, ou déjà validée/refusée." });
        }

        console.log(`❌ Demande ID: ${id} annulée par utilisateur ID: ${user_id}`);
        res.json({ success: true, message: `La demande ID ${id} a été annulée.`, request: result.rows[0] });

    } catch (err) {
        console.error("❌ Erreur cancelRequest :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de l'annulation de la demande." });
    }
};


// ---------------------------------------------------
// 3. GESTION ADMIN (Vérification du rôle 'admin' par le middleware)
// ---------------------------------------------------

const getAllLeads = async (req, res, pool) => {
    try {
        const allLeads = await pool.query(
            'SELECT * FROM leads ORDER BY created_at DESC' 
        );

        res.json(allLeads.rows);

    } catch (err) {
        console.error("❌ Erreur getAllLeads :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la récupération des leads." });
    }
};

/**
 * Récupère TOUTES les requêtes de services (clients connectés) pour l'Admin.
 */
const getAllRequests = async (req, res, pool) => {
    try {
        // L'Admin doit voir toutes les infos de la requête, y compris qui l'a demandée (user_id)
        const allRequests = await pool.query(
            `SELECT
                r.id, r.scheduled_date, r.notes, r.status, r.created_at,
                p.address AS property_address,
                s.name AS service_name,
                u.email AS user_email,
                u.first_name,
                u.last_name
            FROM
                requests r
            JOIN
                properties p ON r.property_id = p.id
            JOIN
                services s ON r.service_id = s.id
            JOIN
                users u ON r.user_id = u.id -- JOINTURE avec la table users pour savoir qui est le client
            ORDER BY
                r.created_at DESC`
        );

        res.json(allRequests.rows);
    } catch (err) {
        console.error("❌ Erreur getAllRequests :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la récupération de toutes les demandes." });
    }
};


/**
 * Met à jour le statut d'une demande de service (Validation ou Refus).
 */
const updateRequestStatus = async (req, res, pool) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 
        const io = req.io; // RÉCUPÉRER L'OBJET SOCKET.IO

        if (!id || !status) {
            return res.status(400).json({ error: "ID de demande ou statut manquant." });
        }

        const validStatuses = ['validated', 'rejected', 'in_progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Statut invalide." });
        }

        // Mise à jour de la demande et récupération des données nécessaires
        const result = await pool.query(
            `UPDATE requests
             SET status = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING id, status, user_id, property_id, service_id, scheduled_date, notes`, 
            [status, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Demande non trouvée." });
        }

        const updatedRequest = result.rows[0];

        // Récupérer l'email de l'utilisateur pour l'email transactionnel
        const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [updatedRequest.user_id]);
        const userEmail = userResult.rows[0] ? userResult.rows[0].email : null;


        // --- LOGIQUE NOTIFICATION & EMAIL ---
        let emailSubject, emailBody;
        
        if (status === 'rejected') {
            await createNotification(pool, updatedRequest.user_id, "Votre demande a été refusée.", 'alert', null, io); // NOTIF IN-APP
            emailSubject = "❌ Mise à jour de votre demande Maison des Sables";
            emailBody = `<p>Bonjour,</p><p>Après examen, nous avons dû **refuser** votre demande de service planifiée pour le ${updatedRequest.scheduled_date.toISOString().substring(0, 10)}. Veuillez nous contacter pour plus de détails.</p>`;
        } else if (status === 'validated') {
            await createNotification(pool, updatedRequest.user_id, "Votre demande a été acceptée et est en cours de planification.", 'success', null, io); // NOTIF IN-APP
            emailSubject = "✅ Votre demande Maison des Sables est acceptée !";
            emailBody = `<p>Bonjour,</p><p>Votre demande de service planifiée pour le ${updatedRequest.scheduled_date.toISOString().substring(0, 10)} a été **acceptée** par notre équipe.</p><p>Une réservation a été créée et un prestataire vous sera bientôt assigné. Consultez votre espace client pour les détails.</p>`;
        }

        if (userEmail && emailSubject) {
            await sendTransactionalEmail(userEmail, emailSubject, emailBody); // EMAIL
        }


        // --- LOGIQUE D'AUTOMATISATION ---
        if (updatedRequest.status === 'validated') {
            console.log(`Demande ${id} validée. Tentative de création de réservation...`);
            
            // Appel de la fonction d'automatisation
            const reservationResult = await createReservationFromRequest(pool, updatedRequest, io);

            if (reservationResult.success) {
                res.json({ 
                    success: true, 
                    message: `Statut mis à jour à '${status}'. Réservation #${reservationResult.reservation.id} créée.`, 
                    request: updatedRequest 
                });
            } else {
                console.error(`🔴 ALERTE : Échec de création de réservation pour la demande ID ${id}.`);
                res.status(500).json({ 
                    success: true,
                    warning: "La demande a été validée, mais la réservation automatique a échoué. Vérifiez les logs.", 
                    request: updatedRequest 
                });
            }
        } else {
             // Si le statut est 'rejected' ou autre, on répond sans automatisation
            console.log(`✅ Demande ID: ${id} mise à jour au statut: ${status}`);
            res.json({ success: true, message: `Statut mis à jour à '${status}'.`, request: updatedRequest });
        }


    } catch (err) {
        console.error("❌ Erreur updateRequestStatus :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la mise à jour du statut." });
    }
};


module.exports = { handleNewLead, getAllLeads, handleNewRequest, getUserRequests, cancelRequest, getAllRequests, updateRequestStatus };