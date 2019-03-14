import express from 'express';
import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { verifyJwt } from '../../middlewares';
import app from '../../app';
import { User, Token } from '../../database/models';
import { signupUser, signupUser2 } from '../mocks/db.json';
import { urlPrefix } from '../mocks/variables.json';

const { JWT_SECRET } = process.env;
const appTest = express();
const router = express.Router();


router.get('/testJwtWithUser', verifyJwt({ access: ['user'] }));
router.get('/testJwtwithSuperAdmin', verifyJwt({ access: ['super-admin'] }));
router.get('/testJwtwithAdmin', verifyJwt({ access: ['admin'] }));
router.get('/testWithConfirmEmail', verifyJwt({ confirmEmail: true }));

appTest.use(router);
let admin;
let user2;
describe('verifyJWT', () => {
  beforeAll(async () => {
    const encryptedPassword = bcrypt.hashSync(signupUser.password, 10);
    const encryptedPassword2 = bcrypt.hashSync(signupUser2.password, 10);
    await User.create({
      ...signupUser,
      password: encryptedPassword,
      confirmed: 'confirmed',
      userType: 'admin'
    });
    await User.create({
      ...signupUser2,
      password: encryptedPassword2,
      confirmed: 'confirmed'
    });
    const res = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({
        user: {
          username: signupUser.email,
          password: signupUser.password
        }
      });
    admin = res.body.user;
    const res2 = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({
        user: {
          username: signupUser2.email,
          password: signupUser2.password
        }
      });
    user2 = res2.body.user;
  });
  afterAll(async () => {
    await User.destroy({
      where: { id: admin.id }
    });
    await User.destroy({
      where: { id: user2.id }
    });
  });

  test('it should fail without user token for user only router', async () => {
    const res = await request(appTest)
      .get('/testJwtWithUser')
      .set('authorization', admin.token);
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
    expect(res.body.message).toBe('Not authorized');
  });

  test('it should fail without user token for super admin only router', async () => {
    const res = await request(appTest)
      .get('/testJwtWithSuperAdmin')
      .set('authorization', admin.token);
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
    expect(res.body.message).toBe('Not authorized');
  });

  test('it should fail without user token for admin only router', async () => {
    const res = await request(appTest)
      .get('/testJwtWithAdmin')
      .set('authorization', user2.token);
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
    expect(res.body.message).toBe('Not authorized');
  });

  test('it should fail when email is not confirmed', async () => {
    const user = await User.findOne({
      where: { id: user2.id }
    });
    user.update({ confirmed: 'pending' });
    const { body } = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({
        user: {
          username: signupUser2.email,
          password: signupUser2.password
        }
      });
    const res = await request(appTest)
      .get('/testWithConfirmEmail')
      .set('authorization', body.user.token);
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
    expect(res.body.message).toBe('Please confirm your email');
  });
  test('it should return unexpected', async () => {
    const token = jwt.sign({ id: 24374, userType: 'user.userType' }, JWT_SECRET);
    const tokenRecord = await Token.findOne({ where: { userId: user2.id } });
    tokenRecord.update({ token });
    const res = await request(appTest)
      .get('/testJwtWithAdmin')
      .set('authorization', token);
    expect(res.status).toBe(520);
    expect(res.body.errors).toBeDefined();
  });

  test('it should return unexpected', async () => {
    const res = await request(appTest)
      .get('/testJwtWithAdmin')
      .set('authorization', 'edhfh');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('jwt malformed');
  });
});
