import 'dotenv/config';
import { sendgrid } from '../helpers';

const { FRONTEND_URL = '/' } = process.env;

/**
 * @author Olivier
 * @param {Object} user
 * @returns {Promise} - Returns a promise
 */
export const sendConfirmationEmail = (user = {}) => {
  const mailBody = `
    <div style="color: #5a5a5a;">
      <div style="border-bottom: 1px solid #2ABDEB; padding: 15px;">
        <h2 style="color: #2ABDEB; text-align: center;">Authors Haven - Email Confirmation</h2>
      </div>
      <p style="font-size: 1.2rem; line-height: 2rem; color: #5a5a5a;">
        Thank you for creating an account with us, please proceed to confirm your email (${
          user.email
        }).
      <p/>
      <div style="text-align: center; padding: 20px;">
        <a href="${FRONTEND_URL}/profile/${user.id}/confirm_email/${user.confirmationCode}"
          style="color: #fff; background-color: #2ABDEB; padding: 10px 20px; font-size: 1.2rem; text-align: center; text-decoration: none;"
        > Confirm email </a>
        <p style="font-size: 1.5rem; margin-top: 30px; color: #5a5a5a !important">
          Or copy the link below
        <p><br>${FRONTEND_URL}/profile/${user.id}/confirm_email/${user.confirmationCode} 
      </div>
      <p style="color: #5a5a5a !important;">Thank you, <br> Authors Haven Team</p>
    </div>
  `;
  return sendgrid({ to: user.email, subject: 'Email Confirmation', html: mailBody });
};
