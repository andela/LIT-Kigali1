import request from 'supertest';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { User } from '../../database/models';
import { signupUser } from '../mocks/db.json';
import { urlPrefix } from '../mocks/variables.json';
import app from '../../app';

const email = 'test_login@gmail.com';
const username = 'test_login';
describe('auth', () => {
  beforeAll(async () => {
    await User.destroy({
      where: { [Op.or]: [{ email: signupUser.email }, { email }] }
    }).then(() => true);
  });

  afterAll(async () => {
    await User.destroy({
      where: { [Op.or]: [{ email: signupUser.email }, { email }] }
    }).then(() => true);
  });

  test('Signup- bad request', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/users`)
      .send({ user: { email: 'test@email.com', password: 'test@test' } });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Bad Request');
  });

  test('Signup- success', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/users`)
      .send({ user: { username: 'test', email: 'test@email.com', password: 'test@test' } });
    expect(res.status).toBe(201);
    expect(res.body).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.message).toBe(
      'Account created sucessfully. Please check your email for confirmation'
    );
  });

  test('Signup- account already exist', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/users`)
      .send({ user: { username: 'test', email: 'test@email.com', password: 'test@test' } });
    expect(res.status).toBe(401);
    expect(res.body).toBeDefined();
    expect(res.body.message).toBe('Account already exist');
  });

  test('should return Bad Request message', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({ user: { email: 'fake@email.com', password: 'test@test' } });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Bad Request');
  });

  test("should return Username and password don't match", async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({ user: { username: 'fake@email.com', password: 'test@test' } });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Email and password don't match");
  });

  test('should return user data and token', async () => {
    expect.assertions(3);
    const password = '123456';
    const encryptedPassword = bcrypt.hashSync('123456', 10);
    await User.create({
      ...signupUser,
      email,
      username,
      password: encryptedPassword
    });
    const res = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({ user: { username, password } });
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.token).toBeDefined();
  });
});
