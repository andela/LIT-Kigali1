import request from 'supertest';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';
import { User, ResetPassword } from '../../database/models';
import { signupUser } from '../mocks/db.json';

const fakeConfirmationCode = '07e83585-41e5-4fb2-b5d0-a7b52b55aba1';
const fakeUserId = '457d032c-6d0f-4be5-b46a-032def5d6f2e';
let user;
describe('users', () => {
  beforeAll(async () => {
    await User.destroy({
      where: { email: signupUser.email }
    });
    user = await User.create({ ...signupUser });
  });
  test('should return invalid confirmation code -fake userid and confirmationCode', async () => {
    expect.assertions(2);
    const res = await request(app).get(
      `${urlPrefix}/users/${fakeUserId}/confirm_email/${fakeConfirmationCode}`
    );
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Invalid confirmation code');
  }, 30000);

  test('should return invalid confirmation code -correct userId -fake confirmationCode', async () => {
    expect.assertions(2);
    const res = await request(app).get(
      `${urlPrefix}/users/${user.id}/confirm_email/${fakeConfirmationCode}`
    );
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid confirmation code');
  });

  test('should return test@email.com has been confirmed', async () => {
    expect.assertions(2);
    await user.update({ confirmationCode: fakeConfirmationCode, confirmed: 'pending' });
    const res = await request(app).get(
      `${urlPrefix}/users/${user.id}/confirm_email/${fakeConfirmationCode}`
    );
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('test@email.com has been confirmed');
  });

  test('should return test@email.com has already been confirmed', async () => {
    expect.assertions(2);
    await user.update({ confirmationCode: null, confirmed: 'confirmed' });
    const res = await request(app).get(
      `${urlPrefix}/users/${user.id}/confirm_email/${fakeConfirmationCode}`
    );
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('test@email.com has already been confirmed');
  });

  // Forget password tests
  test('Password reset link sent sucessfully', async () => {
    const res = await request(app)
      .post(`${urlPrefix}/users/forget`)
      .send({ user: { email: 'test@email.com' } });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Password reset link sent sucessfully. Please check your email!');
  }, 30000);

  test('No user found with that email address', async () => {
    const res = await request(app)
      .post(`${urlPrefix}/users/forget`)
      .send({ user: { email: 'fake@email.com' } });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('No user found with that email address');
  });
  test('Bad request- password forget', async () => {
    const res = await request(app)
      .post(`${urlPrefix}/users/forget`)
      .send({ user: { emailx: 'fake@email.com' } });
    expect(res.status).toBe(400);
  });

  test('No user found with that email address- Unconfirmed email', async () => {
    await user.update({ confirmed: 'pending' });
    const res = await request(app)
      .post(`${urlPrefix}/users/forget`)
      .send({ user: { email: 'test@email.com' } });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('No user found with that email address');
  });

  // Reset password tests
  test('Reset password- fail', async () => {
    const reset = await ResetPassword.findOne({ where: { userId: user.id } });
    const res = await request(app)
      .put(`${urlPrefix}/users/${reset.userId}/reset/${reset.resetCode}`)
      .send({ newPassword: 'mugiha', confirmNewpassword: 'mugisha' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Passwords don't match");
  });

  test('Reset password- Bad request', async () => {
    const reset = await ResetPassword.findOne({ where: { userId: user.id } });
    const res = await request(app)
      .put(`${urlPrefix}/users/${reset.userId}/reset/${reset.resetCode}`)
      .send({ newPassword: 'mugisha', confirmpassword: 'mugisha' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Bad Request');
  });

  test('Reset password- invalid token', async () => {
    const reset = await ResetPassword.findOne({ where: { userId: user.id } });
    const res = await request(app)
      .put(`${urlPrefix}/users/${reset.userId}/reset/7ced290d-f51a-472c-8086-7e8161fc40b9`)
      .send({ newPassword: 'mugisha', confirmNewpassword: 'mugisha' });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('invalid token');
  }, 30000);

  test('Reset password- success', async () => {
    const reset = await ResetPassword.findOne({ where: { userId: user.id } });
    const res = await request(app)
      .put(`${urlPrefix}/users/${reset.userId}/reset/${reset.resetCode}`)
      .send({ newPassword: 'mugisha', confirmNewpassword: 'mugisha' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Your password has been reset successfully!');
  });
});
