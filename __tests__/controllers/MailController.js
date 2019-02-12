import db from '../mocks/db.json';
import { MailController } from '../../controllers';

describe('sendgrid', () => {
  test('should send the confirmation email', async () => {
    expect.assertions(3);
    const res = await MailController.sendConfirmationEmail(db.mailUser);
    expect(res).toBeDefined();
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].statusCode).toBe(202);
  }, 30000);
});
