import dotenv from 'dotenv';
import { sendgrid } from '../helpers';

dotenv.config();
const { FRONTEND_URL = '/' } = process.env;

/**
 * @author Olivier
 * @param {Object} user
 * @returns {Promise} - Returns a promise
 */
export const sendEmailConfirmationLink = user => {
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
        <a href="${FRONTEND_URL}/users/${user.id}/confirm_email/${user.confirmationCode}"
          style="color: #fff; background-color: #2ABDEB; padding: 10px 20px; font-size: 1.2rem; text-align: center; text-decoration: none;"
        > Confirm email </a>
        <p style="font-size: 1.5rem; margin-top: 30px; color: #5a5a5a !important">
          Or copy the link below
        <p><br>${FRONTEND_URL}/users/${user.id}/confirm_email/${user.confirmationCode} 
      </div>
      <p style="color: #5a5a5a !important;">Thank you, <br> Authors Haven Team</p>
    </div>
  `;
  return sendgrid({ to: user.email, subject: 'Confirm your email', html: mailBody });
};

export const sendEmailVerified = user => {
  const mailBody = `
    <div style="color: #5a5a5a;">
      <div style="border-bottom: 1px solid #2ABDEB; padding: 15px;">
        <h2 style="color: #2ABDEB; text-align: center;">Authors Haven - Email verified</h2>
      </div>
      <p style="font-size: 1.2rem; line-height: 2rem; color: #5a5a5a;">
        Your email (${user.email}) has been verified. You can now proceed to update your account
        and create posts
      <p/>
      <p style="color: #5a5a5a !important;">Thank you, <br> Authors Haven Team</p>
    </div>
  `;
  return sendgrid({ to: user.email, subject: 'Email Confirmed', html: mailBody });
};

export const resetPasswordEmail = (userId, email, resetCode) => {
  const mailBody = `
  <div style="color: #5a5a5a;">
      <div style="border-bottom: 1px solid #2ABDEB; padding: 15px;">
        <h2 style="color: #2ABDEB; text-align: center;">Authors Haven - Reset your account password</h2>
      </div>
      <p style="font-size: 1.2rem; line-height: 2rem; color: #5a5a5a;">
      To reset your password, click the link below.
      <p/>
      <div style="text-align: center; padding: 20px;">
        <a href="${FRONTEND_URL}/users/${userId}/reset/${resetCode}"
          style="color: #fff; background-color: #2ABDEB; padding: 10px 20px; font-size: 1.2rem; text-align: center; text-decoration: none;"
        > Password Reset </a>
        <p style="font-size: 1.5rem; margin-top: 30px; color: #5a5a5a !important">
          Or copy the link below
        <p><br>${FRONTEND_URL}/users/${userId}/reset/${resetCode}
      </div>
      <p style="color: #5a5a5a !important;">If you didn't ask for password reset, Please ignore this message.</p>
      <p style="color: #5a5a5a !important;">Thank you, <br> Authors Haven Team</p>
    </div>
  `;
  return sendgrid({ to: email, subject: 'Password Reset', html: mailBody });
};

export const newPasswordEmail = email => {
  const mailBody = `
  <div style="color: #5a5a5a;">
      <div style="border-bottom: 1px solid #2ABDEB; padding: 15px;">
        <h2 style="color: #2ABDEB; text-align: center;">Authors Haven - Password changed</h2>
      </div>
      <div style="text-align: center; padding: 20px;">
      <p style="font-size: 1.5rem; margin-top: 30px; color: #5a5a5a !important">
      Your password has been reset successfully!</p>
    </div>
    <p style="color: #5a5a5a !important;">Thank you, <br> Authors Haven Team</p>
  </div>
      `;

  return sendgrid({ to: email, subject: 'Password Changed', html: mailBody });
};
