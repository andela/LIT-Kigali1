import { sendgrid } from '../../helpers';

describe('sendgrid', () => {
  test('should send the test email', async () => {
    expect.assertions(3);
    const res = await sendgrid({ to: 'oesukam@gmail.com' });
    expect(res).toBeDefined();
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].statusCode).toBe(202);
  }, 30000);
});
