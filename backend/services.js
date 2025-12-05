// services.js

// --- 1. FONCTIONS PUBLIQUES/CLIENTS ---

/**
 * Récupère tous les services actifs disponibles pour affichage dans le catalogue.
 */
const getAllServices = async (req, res, pool) => {
    try {
        console.log("📖 Récupération du catalogue de services...");

        // On ne montre que les services marqués comme ACTIFS (is_active = TRUE)
        const allServices = await pool.query(
            `SELECT 
                id, 
                name, 
                description, 
                price, 
                duration_estimate 
             FROM services
             WHERE is_active = TRUE 
             ORDER BY name ASC`
        );

        res.json(allServices.rows);

    } catch (err) {
        console.error("❌ Erreur getAllServices (Client) :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la récupération du catalogue de services." });
    }
};


// --- 2. FONCTIONS ADMIN (CRUD) ---

/**
 * [ADMIN] Crée un nouveau service.
 */
const createService = async (req, res, pool) => {
    try {
        const { name, description, price, duration_estimate, is_active = true } = req.body;

        if (!name || !price) {
            return res.status(400).json({ error: "Le nom et le prix du service sont obligatoires." });
        }

        const newService = await pool.query(
            `INSERT INTO services (name, description, price, duration_estimate, is_active)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, price`,
            [name, description, price, duration_estimate, is_active]
        );

        console.log(`✨ Service créé : ${name} (ID: ${newService.rows[0].id})`);
        res.status(201).json({ success: true, message: "Service créé avec succès.", service: newService.rows[0] });

    } catch (err) {
        console.error("❌ Erreur createService :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la création du service." });
    }
};

/**
 * [ADMIN] Met à jour un service existant.
 */
const updateService = async (req, res, pool) => {
    try {
        const { id } = req.params;
        const { name, description, price, duration_estimate, is_active } = req.body;

        // Construire la requête de manière dynamique pour ne mettre à jour que les champs fournis
        let query = 'UPDATE services SET updated_at = NOW()';
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(description);
        }
        if (price !== undefined) {
            updates.push(`price = $${paramIndex++}`);
            values.push(price);
        }
        if (duration_estimate !== undefined) {
            updates.push(`duration_estimate = $${paramIndex++}`);
            values.push(duration_estimate);
        }
        if (is_active !== undefined) {
            updates.push(`is_active = $${paramIndex++}`);
            values.push(is_active);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "Aucun champ à mettre à jour." });
        }

        query += ', ' + updates.join(', ') + ` WHERE id = $${paramIndex} RETURNING id, name, price, is_active`;
        values.push(id);

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Service non trouvé." });
        }

        console.log(`🔄 Service mis à jour : ID ${id}`);
        res.json({ success: true, message: "Service mis à jour avec succès.", service: result.rows[0] });

    } catch (err) {
        console.error("❌ Erreur updateService :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la mise à jour du service." });
    }
};

/**
 * [ADMIN] Supprime ou désactive un service.
 * AMÉLIORATION : Par sécurité, on désactive le service (is_active = FALSE) plutôt que de le supprimer définitivement.
 */
const deleteService = async (req, res, pool) => {
    try {
        const { id } = req.params;

        // Mise à jour de 'is_active' à FALSE
        const result = await pool.query(
            `UPDATE services
             SET is_active = FALSE, updated_at = NOW()
             WHERE id = $1
             RETURNING id, name`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Service non trouvé." });
        }

        console.log(`🗑️ Service désactivé : ID ${id}`);
        res.json({ success: true, message: "Service désactivé (mis hors ligne) avec succès.", service: result.rows[0] });

    } catch (err) {
        console.error("❌ Erreur deleteService :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la désactivation du service." });
    }
};

module.exports = {
    getAllServices,
    createService,
    updateService,
    deleteService
};