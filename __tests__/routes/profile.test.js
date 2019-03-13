import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, Follow } from '../../database/models';
import { signupUser, profile } from '../mocks/db.json';
import { urlPrefix } from '../mocks/variables.json';
import app from '../../app';

const { JWT_SECRET } = process.env;

let loginUser1;
const email = 'test_login@gmail.com';
const username = 'test_login';
const password = '123456';
const randomUser = 'random';
const aFollowee = '5b8168be-7451-4ebb-a364-ef9293e707c2';
jest.setTimeout(50000);
describe('Profile', () => {
  beforeAll(async done => {
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
    await Follow.findOrCreate({ where: { followee: aFollowee.id, follower: loginUser1.id } });

    done();
  });

  afterAll(async done => {
    await User.destroy({ where: { email: signupUser.email } });
    await User.destroy({ where: { email: profile.email } });
    await Follow.destroy({ where: { followee: aFollowee.id, follower: loginUser1.id } });
    done();
  });

  test('should create profile and send confirmation when email is provided', async done => {
    expect.assertions(11);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({ user: { ...profile } });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      'Your email has changed. Please check your email for confirmation'
    );
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

  test('should create profile and not send confirmation email when email is not provided', async done => {
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

  test('should not create profile with --taken email and username', async done => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({ user: { ...profile } });

    expect(res.status).toBe(409);
    expect(res.body.errors.body[0]).toBe('email and username are already taken');
    done();
  });

  test('should not create profile with --taken email ', async done => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({ user: { email: profile.email } });

    expect(res.status).toBe(409);
    expect(res.body.errors.body[0]).toBe('email is already taken');
    done();
  });

  test('should  update  email ', async done => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({ user: { email: 'doe@doe.com' } });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      'Your email has changed. Please check your email for confirmation'
    );
    const user = await User.findOne({ where: { email: 'doe@doe.com' } });
    user.update({ email: profile.email });
    done();
  });

  test('should not create profile with --taken username ', async done => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({ user: { username: profile.username } });

    expect(res.status).toBe(409);
    expect(res.body.errors.body[0]).toBe('username is already taken');
    done();
  });

  test('should update username ', async done => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({ user: { username: 'claudine' } });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('The information was updated successful');
    done();
  });

  test('should not create profile with --taken username and untaken email ', async done => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({
        user: {
          username: 'claudine',
          email: 'papasava@email.com'
        }
      });

    expect(res.status).toBe(409);
    expect(res.body.errors.body[0]).toBe('username is already taken');
    done();
  });

  test('should not create profile with --taken email and untaken username ', async done => {
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

  test('should not create profile with --unexisting user', async done => {
    expect.assertions(2);
    await User.destroy({ where: { email: signupUser.email } });
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', loginUser1.token)
      .send({ user: { ...profile } });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid token. Please login.');
    done();
  });

  test('should not create profile with --malformed token', async done => {
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

  test('should not create profile with --incorrect token', async done => {
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

  test('should get user profile', async done => {
    expect.assertions(3);
    const encryptedPassword = bcrypt.hashSync('123456', 10);
    const aUser = await User.create({
      ...signupUser,
      email,
      username,
      confirmed: 'confirmed',
      password: encryptedPassword
    });
    const res = await request(app).get(`${urlPrefix}/profiles/${aUser.username}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.user).toBeDefined();
    await User.destroy({ where: { username: aUser.username } });
    done();
  });

  test('Should return user not found', async done => {
    expect.assertions(3);
    const res = await request(app).get(`${urlPrefix}/profiles/${randomUser}`);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('User not found');
    done();
  });

  test('Should get user profiles list', async done => {
    expect.assertions(5);
    const res = await request(app)
      .get(`${urlPrefix}/profiles?page=1`)
      .set('Authorization', loginUser1.token);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.profiles).toBeDefined();
    expect(res.body.page).toBeDefined();
    expect(res.body.totalPages).toBeDefined();
    done();
  });

  test('Should get user profiles without token list', async done => {
    expect.assertions(5);
    const res = await request(app).get(`${urlPrefix}/profiles?page=1`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.profiles).toBeDefined();
    expect(res.body.page).toBeDefined();
    expect(res.body.totalPages).toBeDefined();
    done();
  });

  test('Should return page must be larger than or equal to 1', async done => {
    expect.assertions(2);
    const res = await request(app).get(`${urlPrefix}/profiles?page=0`);
    expect(res.body.message).toBe('Bad Request');
    expect(res.body.errors[0].message).toBe('"page" must be larger than or equal to 1');
    done();
  });

  test('should return page is required', async done => {
    expect.assertions(2);
    const res = await request(app).get(`${urlPrefix}/profiles`);
    expect(res.body.message).toBe('Bad Request');
    expect(res.body.errors[0].message).toBe('"page" is required');
    done();
  });
  test('Should return page does not exist', async done => {
    expect.assertions(3);
    const res = await request(app).get(`${urlPrefix}/profiles?page=1000`);
    console.log(res.body);
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
    expect(res.body.message).toBe('The page does not exist');
    done();
  });
});
