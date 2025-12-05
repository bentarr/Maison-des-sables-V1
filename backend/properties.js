// properties.js

// --- 1. FONCTIONS CLIENTS ---

/**
 * [CLIENT] Récupère tous les biens associés à un utilisateur connecté.
 */
const getUserProperties = async (req, res, pool) => {
    try {
        const user_id = req.user.user_id; 

        console.log(`🔍 Récupération des biens pour l'utilisateur ID: ${user_id}`);

        // Requête sécurisée : WHERE owner_id = l'ID de l'utilisateur connecté
        const userProperties = await pool.query(
            'SELECT * FROM properties WHERE owner_id = $1 AND is_active = TRUE ORDER BY created_at DESC',
            [user_id]
        );

        if (userProperties.rows.length === 0) {
            return res.status(200).json({ message: "Aucun bien trouvé pour cet utilisateur.", properties: [] });
        }

        res.json(userProperties.rows);

    } catch (err) {
        console.error("❌ Erreur getUserProperties :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la récupération des biens." });
    }
};

// --- 2. FONCTIONS ADMIN (CRUD) ---

/**
 * [ADMIN] Récupère TOUS les biens, y compris les inactifs.
 */
const getAllProperties = async (req, res, pool) => {
    try {
        console.log("🏡 Récupération de tous les biens (Admin)...");

        // Jointure pour afficher l'email du propriétaire (pour la clarté dans le Dashboard)
        const allProperties = await pool.query(
            `SELECT 
                p.id, p.address, p.surface, p.num_rooms, p.is_active, p.owner_id,
                u.email AS owner_email, u.last_name AS owner_name
             FROM properties p
             JOIN users u ON p.owner_id = u.id
             ORDER BY p.created_at DESC`
        );

        res.json(allProperties.rows);

    } catch (err) {
        console.error("❌ Erreur getAllProperties :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la récupération de tous les biens." });
    }
};

/**
 * [ADMIN] Crée un nouveau bien et l'attribue à un propriétaire.
 */
const createProperty = async (req, res, pool) => {
    try {
        // L'Admin doit spécifier l'ID du propriétaire
        const { owner_id, address, surface, num_rooms, is_active = true } = req.body;

        if (!owner_id || !address || !surface) {
            return res.status(400).json({ error: "Propriétaire (owner_id), adresse et surface sont obligatoires." });
        }

        // Vérifier si le propriétaire existe (AMÉLIORATION DE SÉCURITÉ)
        const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [owner_id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: "Propriétaire non trouvé." });
        }

        const newProperty = await pool.query(
            `INSERT INTO properties (owner_id, address, surface, num_rooms, is_active)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, address, owner_id`,
            [owner_id, address, surface, num_rooms, is_active]
        );

        console.log(`🏠 Bien créé : ${address} (ID: ${newProperty.rows[0].id})`);
        res.status(201).json({ success: true, message: "Bien créé avec succès.", property: newProperty.rows[0] });

    } catch (err) {
        console.error("❌ Erreur createProperty :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la création du bien." });
    }
};

/**
 * [ADMIN] Met à jour les informations d'un bien.
 */
const updateProperty = async (req, res, pool) => {
    try {
        const { id } = req.params;
        const { owner_id, address, surface, num_rooms, is_active } = req.body;

        // Code pour construction de requête dynamique (similaire à updateService)
        let query = 'UPDATE properties SET updated_at = NOW()';
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (owner_id !== undefined) {
            updates.push(`owner_id = $${paramIndex++}`);
            values.push(owner_id);
        }
        if (address !== undefined) {
            updates.push(`address = $${paramIndex++}`);
            values.push(address);
        }
        if (surface !== undefined) {
            updates.push(`surface = $${paramIndex++}`);
            values.push(surface);
        }
        if (num_rooms !== undefined) {
            updates.push(`num_rooms = $${paramIndex++}`);
            values.push(num_rooms);
        }
        if (is_active !== undefined) {
            updates.push(`is_active = $${paramIndex++}`);
            values.push(is_active);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "Aucun champ à mettre à jour." });
        }

        query += ', ' + updates.join(', ') + ` WHERE id = $${paramIndex} RETURNING id, address, owner_id, is_active`;
        values.push(id);

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Bien non trouvé." });
        }

        console.log(`🔄 Bien mis à jour : ID ${id}`);
        res.json({ success: true, message: "Bien mis à jour avec succès.", property: result.rows[0] });

    } catch (err) {
        console.error("❌ Erreur updateProperty :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la mise à jour du bien." });
    }
};

/**
 * [ADMIN] Supprime ou désactive un bien.
 * AMÉLIORATION : Par sécurité, on désactive (is_active = FALSE) pour ne pas casser les requêtes ou réservations liées.
 */
const deleteProperty = async (req, res, pool) => {
    try {
        const { id } = req.params;

        // Mise à jour de 'is_active' à FALSE
        const result = await pool.query(
            `UPDATE properties
             SET is_active = FALSE, updated_at = NOW()
             WHERE id = $1
             RETURNING id, address`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Bien non trouvé." });
        }

        console.log(`🗑️ Bien désactivé : ID ${id}`);
        res.json({ success: true, message: "Bien désactivé (mis hors ligne) avec succès.", property: result.rows[0] });

    } catch (err) {
        console.error("❌ Erreur deleteProperty :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la désactivation du bien." });
    }
};


module.exports = {
    getUserProperties,
    getAllProperties,
    createProperty,
    updateProperty,
    deleteProperty
};