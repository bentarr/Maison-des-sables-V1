// notifications.js (NOUVEAU FICHIER)

/**
 * [SYSTEME] Crée une nouvelle notification dans la table 'notifications'.
 * @param {object} pool - Le pool de connexion à la BDD.
 * @param {number} userId - L'ID de l'utilisateur destinataire.
 * @param {string} message - Le contenu du message.
 * @param {string} type - Le type de notification ('alert', 'success', 'reservation').
 * @param {number} [reservationId=null] - L'ID de la réservation associée (optionnel).
 * @param {object} io - L'objet Socket.IO (pour la mise à jour en temps réel).
 */
const createNotification = async (pool, userId, message, type, reservationId = null, io) => {
    try {
        if (!userId || !message || !type) {
            console.error("❌ Erreur: Paramètres de notification manquants.");
            return { success: false, error: "Paramètres requis manquant pour la notification." };
        }

        const result = await pool.query(
            `INSERT INTO notifications (user_id, message, type, related_reservation_id)
             VALUES ($1, $2, $3, $4)
             RETURNING id, created_at, is_read`,
            [userId, message, type, reservationId]
        );
        
        const newNotification = { 
            id: result.rows[0].id, 
            message, 
            type, 
            created_at: result.rows[0].created_at, 
            is_read: result.rows[0].is_read,
            related_reservation_id: reservationId
        };
        
        // --- EMISSION SOCKET.IO (Temps Réel) ---
        if (io) {
            // Envoie la notification à tous les clients qui écoutent la 'room' de cet utilisateur
            io.to(userId).emit('new_notification', newNotification); 
        }

        console.log(`🛎️ Notification créée pour l'utilisateur ID ${userId} : ${message.substring(0, 30)}...`);
        return { success: true, notification: newNotification };

    } catch (err) {
        console.error("❌ Erreur createNotification :", err.message);
        return { success: false, error: "Erreur lors de la création de la notification." };
    }
};

/**
 * [CLIENT/ADMIN] Récupère les notifications d'un utilisateur.
 */
const getNotificationsByUserId = async (req, res, pool) => {
    try {
        const userId = req.user.user_id;

        const notifications = await pool.query(
            `SELECT 
                id, message, type, is_read, created_at, related_reservation_id 
             FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );
        
        res.json(notifications.rows);

    } catch (err) {
        console.error("❌ Erreur getNotificationsByUserId :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la récupération des notifications." });
    }
};

/**
 * [CLIENT/ADMIN] Marque une ou toutes les notifications comme lues.
 */
const markNotificationsAsRead = async (req, res, pool) => {
    try {
        const userId = req.user.user_id;
        const { notificationId } = req.body; 

        let query;
        let values = [userId];

        if (notificationId) {
            query = `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND id = $2 RETURNING id`;
            values.push(notificationId);
        } else {
            query = `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 RETURNING id`;
        }

        const result = await pool.query(query, values);
        
        console.log(`✅ ${result.rowCount} notifications marquées comme lues pour l'utilisateur ID ${userId}.`);
        res.json({ success: true, message: `${result.rowCount} notification(s) mise(s) à jour.` });

    } catch (err) {
        console.error("❌ Erreur markNotificationsAsRead :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la mise à jour du statut des notifications." });
    }
};

module.exports = {
    createNotification,
    getNotificationsByUserId,
    markNotificationsAsRead,
};