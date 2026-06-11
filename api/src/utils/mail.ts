import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.mail.host,
  port: env.mail.port,
  secure: env.mail.port === 465,
  auth: {
    user: env.mail.user,
    pass: env.mail.pass,
  },
});

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
): Promise<void> => {
  await transporter.sendMail({
    from: `"Central Africa Homes" <${env.mail.from}>`,
    to: email,
    subject: 'Réinitialisation de mot de passe',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe. Ce lien expire dans 1 heure.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Réinitialiser mon mot de passe
        </a>
        <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      </div>
    `,
  });
};
