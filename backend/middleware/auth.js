// middleware/auth.js (VERSION AMÉLIORÉE ET FLEXIBLE)

const jwt = require('jsonwebtoken');

/**
 * Middleware de protection des routes.
 * @param {string | null} requiredRole - Le rôle nécessaire ('admin', 'client', ou null pour juste être connecté).
 */
const protect = (requiredRole) => (req, res, next) => {
    // 1. Récupérer l'en-tête d'autorisation
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Accès refusé. Jeton non fourni." });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. Vérifier et décoder le jeton
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 

        // 3. VÉRIFIER LE RÔLE (Conditionnel)
        // On vérifie le rôle UNIQUEMENT si un rôle est spécifié (ex: 'admin')
        if (requiredRole && req.user.role !== requiredRole) {
            // 403: Interdit - Le rôle n'est pas bon
            return res.status(403).json({ error: "Accès refusé. Droits insuffisants (" + requiredRole + " requis)." });
        }
        
        // Tout est bon, on passe à la route !
        next();

    } catch (err) {
        console.error("Erreur de vérification JWT :", err.message);
        // 401: Le jeton est invalide ou a expiré
        return res.status(401).json({ error: "Jeton invalide ou expiré." });
    }
};

module.exports = { protect };