import request from 'supertest';
import { urlPrefix } from '../mocks/variables.json';
import app from '../../app';

describe('users', () => {
  test('should return invalid confirmation code ', async () => {
    expect.assertions(2);
    const fakeConfirmationCode = '07e83585-41e5-4fb2-b5d0-a7b52b55aba1';
    const fakeUserId = '457d032c-6d0f-4be5-b46a-032def5d6f2e';
    const res = await request(app).get(
      `${urlPrefix}/users/${fakeUserId}/confirm_email/${fakeConfirmationCode}`
    );
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Invalid confirmation code');
  }, 30000);
});
