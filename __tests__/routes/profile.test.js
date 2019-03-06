import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../../database/models';
import { signupUser, profile } from '../mocks/db.json';
import { urlPrefix } from '../mocks/variables.json';
import app from '../../app';

const { JWT_SECRET } = process.env;

let loginUser1;
const email = 'test_login@gmail.com';
const username = 'test_login';
const password = '123456';
jest.setTimeout(50000);
describe('Profile', () => {
  beforeAll(async (done) => {
    const encryptedPassword = bcrypt.hashSync('123456', 10);
    await User.create({
      ...signupUser,
      email,
      username,
      confirmed: 'confirmed',
      password: encryptedPassword
    });
    const res = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({ user: { username, password } });
    loginUser1 = res.body.user;
    done();
  });

  afterAll(async (done) => {
    await User.destroy({ where: { email: signupUser.email } });
    await User.destroy({ where: { email: profile.email } });
    done();
  });

  test('should create profile and send confirmation when email is provided', async (done) => {
    expect.assertions(11);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({ user: { ...profile } });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Your email has changed. Please check your email for confirmation');
    expect(res.body.user.firstName).toBe(profile.firstName);
    expect(res.body.user.lastName).toBe(profile.lastName);
    expect(res.body.user.username).toBe(profile.username);
    expect(res.body.user.email).toBe(profile.email);
    expect(res.body.user.bio).toBe(profile.bio);
    expect(res.body.user.gender).toBe(profile.gender);
    expect(res.body.user.birthDate).toBeDefined();
    expect(res.body.user.image).toBe(profile.image);
    expect(res.body.user.cover).toBe(profile.cover);
    done();
  });

  test('should create profile and not send confirmation email when email is not provided', async (done) => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({ user: { firstName: 'Peter' } });

    expect(res.status).toBe(200);
    expect(res.body.user.firstName).toBe('Peter');
    expect(res.body.message).toBe('The information was updated successful');
    done();
  });

  test('should not create profile with --taken email and username', async (done) => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({ user: { ...profile } });

    expect(res.status).toBe(409);
    expect(res.body.errors.body[0]).toBe('email and username are already taken');
    done();
  });

  test('should not create profile with --taken email ', async (done) => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({ user: { email: profile.email } });

    expect(res.status).toBe(409);
    expect(res.body.errors.body[0]).toBe('email is already taken');
    done();
  });

  test('should not create profile with --taken username ', async (done) => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({ user: { username: profile.username } });

    expect(res.status).toBe(409);
    expect(res.body.errors.body[0]).toBe('username is already taken');
    done();
  });

  test('should not create profile with --taken username and untaken email ', async (done) => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({
        user: {
          username: profile.username,
          email: 'papasava@email.com'
        }
      });

    expect(res.status).toBe(409);
    expect(res.body.errors.body[0]).toBe('username is already taken');
    done();
  });

  test('should not create profile with --taken email and untaken username ', async (done) => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({
        user: {
          username: 'papasava',
          email: profile.email
        }
      });

    expect(res.status).toBe(409);
    expect(res.body.errors.body[0]).toBe('email is already taken');
    done();
  });

  test('should not create profile without --token', async () => {
    expect.assertions(2);
    await User.destroy({ where: { email: 'john.doe@andela.com' } });
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .send({ user: { ...profile } });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No auth token');
  });

  test('should not create profile with --unexisting user', async (done) => {
    expect.assertions(2);
    await User.destroy({ where: { email: signupUser.email } });
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({ user: { ...profile } });

    expect(res.status).toBe(404);
    expect(res.body.message).toBeDefined();
    done();
  });

  test('should not create profile with --malformed token', async (done) => {
    expect.assertions(2);
    await User.destroy({ where: { email: signupUser.email } });
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', 'thgdihueh-jz')
      .send({ user: { ...profile } });

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
    done();
  });

  test('should not create profile with --incorrect token', async (done) => {
    expect.assertions(2);
    await User.destroy({ where: { email: signupUser.email } });
    const token = jwt.sign({ id: 12345, userType: 'user' }, JWT_SECRET);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', token)
      .send({ user: { ...profile } });

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
    done();
  });
});
