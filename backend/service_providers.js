// service_providers.js

/**
 * [ADMIN] Crée un nouveau prestataire de service.
 */
const createProvider = async (req, res, pool) => {
    try {
        const { name, speciality, contact_email, contact_phone, is_active = true } = req.body;

        if (!name || !speciality || !contact_email) {
            return res.status(400).json({ error: "Nom, spécialité et email de contact sont obligatoires." });
        }

        const newProvider = await pool.query(
            `INSERT INTO service_providers (name, speciality, contact_email, contact_phone, is_active)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, speciality, contact_email`,
            [name, speciality, contact_email, contact_phone, is_active]
        );

        console.log(`👷 Prestataire créé : ${name} (${speciality})`);
        res.status(201).json({ success: true, message: "Prestataire créé avec succès.", provider: newProvider.rows[0] });

    } catch (err) {
        console.error("❌ Erreur createProvider :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la création du prestataire." });
    }
};

/**
 * [ADMIN] Récupère TOUS les prestataires (actifs et inactifs).
 */
const getAllProviders = async (req, res, pool) => {
    try {
        console.log("👥 Récupération de tous les prestataires (Admin)...");

        // Récupère tous les champs de la table service_providers
        const allProviders = await pool.query(
            `SELECT * FROM service_providers
             ORDER BY name ASC`
        );

        res.json(allProviders.rows);

    } catch (err) {
        console.error("❌ Erreur getAllProviders :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la récupération des prestataires." });
    }
};

/**
 * [ADMIN] Met à jour les informations d'un prestataire.
 */
const updateProvider = async (req, res, pool) => {
    try {
        const { id } = req.params;
        const { name, speciality, contact_email, contact_phone, is_active } = req.body;

        // Construction dynamique de la requête de mise à jour
        let query = 'UPDATE service_providers SET updated_at = NOW()';
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (speciality !== undefined) {
            updates.push(`speciality = $${paramIndex++}`);
            values.push(speciality);
        }
        if (contact_email !== undefined) {
            updates.push(`contact_email = $${paramIndex++}`);
            values.push(contact_email);
        }
        if (contact_phone !== undefined) {
            updates.push(`contact_phone = $${paramIndex++}`);
            values.push(contact_phone);
        }
        if (is_active !== undefined) {
            updates.push(`is_active = $${paramIndex++}`);
            values.push(is_active);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "Aucun champ à mettre à jour." });
        }

        query += ', ' + updates.join(', ') + ` WHERE id = $${paramIndex} RETURNING id, name, is_active`;
        values.push(id);

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Prestataire non trouvé." });
        }

        console.log(`🔄 Prestataire mis à jour : ID ${id}`);
        res.json({ success: true, message: "Prestataire mis à jour avec succès.", provider: result.rows[0] });

    } catch (err) {
        console.error("❌ Erreur updateProvider :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la mise à jour du prestataire." });
    }
};

/**
 * [ADMIN] Désactive un prestataire (sécurité).
 */
const deleteProvider = async (req, res, pool) => {
    try {
        const { id } = req.params;

        // On désactive (is_active = FALSE) au lieu de supprimer
        const result = await pool.query(
            `UPDATE service_providers
             SET is_active = FALSE, updated_at = NOW()
             WHERE id = $1
             RETURNING id, name`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Prestataire non trouvé." });
        }

        console.log(`🗑️ Prestataire désactivé : ID ${id}`);
        res.json({ success: true, message: "Prestataire désactivé avec succès.", provider: result.rows[0] });

    } catch (err) {
        console.error("❌ Erreur deleteProvider :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la désactivation du prestataire." });
    }
};

module.exports = {
    createProvider,
    getAllProviders,
    updateProvider,
    deleteProvider,
};