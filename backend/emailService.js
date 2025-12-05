// emailService.js (NOUVEAU FICHIER)

const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuration du transporteur (utilise SMTP)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email', // Hôte SMTP de votre fournisseur
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true pour SSL/TLS (port 465), false pour d'autres
    auth: {
        user: process.env.EMAIL_USER, // Votre email
        pass: process.env.EMAIL_PASS, // Votre mot de passe/application
    },
});

/**
 * Envoie un email transactionnel (validation, assignation, etc.).
 */
const sendTransactionalEmail = async (toEmail, subject, htmlContent) => {
    try {
        if (!toEmail || !subject || !htmlContent) {
            console.error("❌ Email: Paramètres d'envoi manquants.");
            return { success: false, error: "Paramètres d'email requis manquant." };
        }

        const info = await transporter.sendMail({
            from: `"Maison des Sables" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: subject,
            html: htmlContent,
        });

        console.log(`📧 Email envoyé à ${toEmail}. Message ID: ${info.messageId}`);
        // Log utile pour le débogage (si vous utilisez un service comme Ethereal)
        if (process.env.NODE_ENV !== 'production' && process.env.EMAIL_HOST === 'smtp.ethereal.email' && nodemailer.getTestMessageUrl) {
            console.log(`URL de prévisualisation: ${nodemailer.getTestMessageUrl(info)}`);
        }
        
        return { success: true, messageId: info.messageId };

    } catch (err) {
        console.error("❌ Erreur Nodemailer :", err.message);
        return { success: false, error: "Erreur lors de l'envoi de l'email." };
    }
};

module.exports = { sendTransactionalEmail };