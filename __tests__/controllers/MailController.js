import db from '../mocks/db.json';
import {
  sendEmailConfirmationLink,
  resetPasswordEmail,
  newPasswordEmail,
  sendEmailVerified
} from '../../__mocks__/MailController';

describe('sendgrid', () => {
  test('should send the confirmation email link', async done => {
    expect.assertions(3);
    const res = await sendEmailConfirmationLink(db.mailUser);
    expect(res).toBeDefined();
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].statusCode).toBe(202);
    done();
  });

  test('should send the email confirmed email', async done => {
    expect.assertions(3);
    const res = await sendEmailVerified(db.mailUser);
    expect(res).toBeDefined();
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].statusCode).toBe(202);
    done();
  });

  test('should send the Reset password link email', async done => {
    expect.assertions(2);
    const res = await resetPasswordEmail(db.mailUser);
    expect(res).toBeDefined();
    expect(res[0].statusCode).toBe(202);
    done();
  });

  test('should send password changed email', async done => {
    expect.assertions(2);
    const res = await newPasswordEmail(db.mailUser);
    expect(res).toBeDefined();
    expect(res[0].statusCode).toBe(202);
    done();
  });
});
