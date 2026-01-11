// emailService.js (LOGIQUE INTELLIGENTE CORRIGÉE)
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuration du transporteur
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'mail.maison-des-sables.fr', 
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE === 'true', 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});

const sendTransactionalEmail = async (toEmail, subject, htmlContent) => {
    try {
        if (!toEmail || !subject || !htmlContent) {
            console.error("❌ Email: Paramètres d'envoi manquants.");
            return { success: false, error: "Paramètres requis manquants." };
        }

        const info = await transporter.sendMail({
            from: `"Maison des Sables" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: subject,
            html: htmlContent,
        });

        console.log(`📧 Email envoyé à ${toEmail}. ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };

    } catch (err) {
        console.error("❌ Erreur Nodemailer :", err.message);
        return { success: false, error: "Erreur technique email." };
    }
};

/**
 * Template intelligent
 * DISTINCTION : On regarde si "property_details" est rempli pour savoir si c'est une estimation.
 */
const sendNewLeadEmail = async (leadData) => {
    const { email, name, phone, message, service_name, property_details } = leadData;
    
    // CORRECTION ICI : On ne regarde pas le nom du service, mais si on a des détails de bien !
    // Si property_details existe, c'est le simulateur. Sinon, c'est le contact simple.
    const isEstimation = property_details && property_details.length > 0;
    
    const subject = isEstimation ? `💰 Nouvelle Estimation : ${name}` : `🔔 Nouveau Prospect : ${name}`;
    
    // Si c'est une estimation, on affiche "TYPE DE BIEN". Sinon "VOTRE BESOIN".
    const labelBesoin = isEstimation ? "TYPE DE BIEN & ESTIMATION" : "VOTRE BESOIN";
    
    // Si c'est une estimation, on affiche le détail du calcul. Sinon le nom du service choisi dans la liste.
    const valeurBesoin = isEstimation ? property_details : service_name;

    const htmlContent = `
        <div style="font-family: sans-serif; color: #2C241B; max-width: 600px; border: 1px solid #E5E7EB; padding: 25px; border-radius: 10px;">
            <h2 style="color: #C5A059; border-bottom: 2px solid #F9F7F2; padding-bottom: 10px;">
                ${isEstimation ? 'Détails de l\'estimation' : 'Nouvelle demande de contact'}
            </h2>
            <p style="margin-top: 20px;"><strong>NOM :</strong> ${name}</p>
            <p><strong>EMAIL :</strong> <a href="mailto:${email}" style="color: #C5A059; text-decoration: none;">${email}</a></p>
            <p><strong>TÉLÉPHONE :</strong> ${phone || 'Non communiqué'}</p>
            
            <div style="margin-top: 20px; border-left: 3px solid #C5A059; padding-left: 10px;">
                <p style="margin: 0; font-size: 10px; text-transform: uppercase; color: #9CA3AF; letter-spacing: 1px;">${labelBesoin}</p>
                <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 16px;">${valeurBesoin || 'Non spécifié'}</p>
            </div>
            
            <div style="background: #F9F7F2; padding: 15px; border-radius: 5px; margin-top: 20px;">
                <p style="margin-top: 0; font-size: 10px; text-transform: uppercase; color: #9CA3AF;">MESSAGE :</p>
                <p style="font-style: italic; white-space: pre-line; margin-bottom: 0;">${message || 'Aucun message.'}</p>
            </div>
            <p style="margin-top: 30px; font-size: 11px; color: #9CA3AF; text-align: center;">Maison des Sables • Notification Automatique</p>
        </div>
    `;

    return await sendTransactionalEmail(process.env.EMAIL_USER, subject, htmlContent);
};

module.exports = { sendTransactionalEmail, sendNewLeadEmail };