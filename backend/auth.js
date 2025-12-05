// Auth.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. FONCTION D'INSCRIPTION (Register)
const register = async (req, res, pool) => {
    try {
        const { email, password, first_name, last_name, phone, role } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(401).json({ error: "Cet email est déjà utilisé." });
        }

        // Hacher le mot de passe (Cryptage)
        const saltRound = 10;
        const password_hash = await bcrypt.hash(password, saltRound);

        // Enregistrer dans la BDD
        // On force le rôle 'client' par défaut si rien n'est précisé, sauf si on demande explicitement 'admin'
        const userRole = role === 'admin' ? 'admin' : 'client';

        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, role',
            [email, password_hash, first_name, last_name, phone, userRole]
        );

        // Créer le Token (Badge)
        const token = jwt.sign({ user_id: newUser.rows[0].id, role: userRole }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ message: "Inscription réussie !", token, user: newUser.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erreur Serveur (Register)");
    }
};

// 2. FONCTION DE CONNEXION (Login)
const login = async (req, res, pool) => {
    try {
        const { email, password } = req.body;

        // Chercher l'utilisateur
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        // Générer le Token
        const token = jwt.sign({ user_id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ 
            message: "Connexion réussie !",
            token, 
            user: { 
                id: user.rows[0].id, 
                email: user.rows[0].email, 
                first_name: user.rows[0].first_name, 
                role: user.rows[0].role 
            } 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erreur Serveur (Login)");
    }
};

module.exports = { register, login };