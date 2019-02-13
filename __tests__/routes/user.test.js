import request from 'supertest';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';
import { User } from '../../database/models';
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
});
