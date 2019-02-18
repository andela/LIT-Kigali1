import db from '../mocks/db.json';
import { MailController } from '../../controllers';

describe('sendgrid', () => {
  test('should send the confirmation email link', async () => {
    expect.assertions(3);
    const res = await MailController.sendEmailConfirmationLink(db.mailUser);
    expect(res).toBeDefined();
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].statusCode).toBe(202);
  }, 30000);

  test('should send the email confirmed email', async () => {
    expect.assertions(3);
    const res = await MailController.sendEmailVerified(db.mailUser);
    expect(res).toBeDefined();
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].statusCode).toBe(202);
  }, 30000);

  test('should send the Reset password link email', async () => {
    expect.assertions(2);
    const res = await MailController.resetPasswordEmail(db.mailUser);
    expect(res).toBeDefined();
    expect(res[0].statusCode).toBe(202);
  }, 30000);

  test('should send password changed email', async () => {
    expect.assertions(2);
    const res = await MailController.newPasswordEmail(db.mailUser);
    expect(res).toBeDefined();
    expect(res[0].statusCode).toBe(202);
  }, 30000);
});
