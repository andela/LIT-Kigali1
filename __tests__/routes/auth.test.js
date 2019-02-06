import request from 'supertest';
import bcrypt from 'bcrypt';
import { User } from '../../database/models';
import { signupUser } from '../mocks/db.json';
import { urlPrefix } from '../mocks/variables.json';
import app from '../../app';

describe('auth', () => {
  beforeAll(async () => {
    await User.destroy({
      where: { email: signupUser.email }
    }).then(() => true);
  });

  afterAll(async () => {
    await User.destroy({
      where: { email: signupUser.email }
    }).then(() => true);
  });

  test('should return Bad Request message', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({ email: 'fake@email.com', password: 'test@test' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Bad Request');
  });

  test("should return Username and password don't match", async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({ username: 'fake@email.com', password: 'test@test' });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Email or Password is incorrect');
  });

  test('should return user data and token', async () => {
    expect.assertions(3);
    const password = '123456';
    const encryptedPassword = bcrypt.hashSync('123456', 10);
    await User.create({ ...signupUser, password: encryptedPassword });
    const res = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({ username: signupUser.email, password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
  });
});
