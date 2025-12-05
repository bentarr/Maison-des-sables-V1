// financials.js (NOUVEAU FICHIER)

/**
 * [CLIENT] Génère un rapport de revenus nets pour un propriétaire sur une période donnée.
 * NOTE: Nécessite la table 'expenses' (Dépenses) pour le calcul net.
 */
const generateOwnerNetRevenueReport = async (req, res, pool) => {
    try {
        const owner_id = req.user.user_id;

        console.log(`📈 Génération du rapport de revenus pour l'utilisateur ID: ${owner_id}`);

        // 1. Calcul des REVENUS BRUTS (Prix du service pour les réservations 'completed')
        const totalRevenue = await pool.query(
            `SELECT COALESCE(SUM(s.price), 0) AS total_gross_revenue
             FROM reservations r
             JOIN services s ON r.service_id = s.id
             WHERE r.user_id = $1 AND r.status = 'completed'`,
            [owner_id]
        );
        const grossRevenue = parseFloat(totalRevenue.rows[0].total_gross_revenue);


        // 2. Calcul des DÉPENSES (Coûts Prestataires, frais de conciergerie, etc.)
        // NOTE: Ceci suppose que la table 'expenses' existe et lie les dépenses à l'owner_id.
        const totalExpenses = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total_expenses
             FROM expenses
             WHERE owner_id = $1`,
            [owner_id]
        );
        const totalExpensesAmount = parseFloat(totalExpenses.rows[0].total_expenses);


        // 3. Calcul du NET
        const netRevenue = grossRevenue - totalExpensesAmount;

        res.json({
            success: true,
            owner_id: owner_id,
            gross_revenue: grossRevenue.toFixed(2),
            total_expenses: totalExpensesAmount.toFixed(2),
            net_revenue: netRevenue.toFixed(2),
        });

    } catch (err) {
        // L'erreur la plus probable est qu'une table (comme 'expenses') n'existe pas.
        console.error("❌ Erreur generateOwnerNetRevenueReport :", err.message);
        res.status(500).json({ success: false, error: "Erreur lors de la génération du rapport financier. Vérifiez le schéma BDD (table expenses)." });
    }
};

module.exports = { generateOwnerNetRevenueReport };