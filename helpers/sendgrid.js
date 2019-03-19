import mail from '@sendgrid/mail';
import 'dotenv/config';

const { SENDGRID_API_KEY } = process.env;

mail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * @author Olivier
 * @param {Object} msg
 */
const send = msg => {
  const defaultMsg = {
    to: msg.to || 'admin@authors-haven.com',
    bcc: msg.bcc || undefined,
    cc: msg.cc || undefined,
    from: msg.from || 'Authors Haven <no_reply@authors-haven.com>',
    subject: msg.subject || 'Authors Haven',
    text: msg.text || undefined,
    html: msg.html || '<strong>Authors Haven Team</strong>'
  };
  return mail.send(defaultMsg);
};

export default send;
