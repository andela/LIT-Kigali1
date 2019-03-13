import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../app';
import { User } from '../../database/models';
import { urlPrefix } from '../mocks/variables.json';
import { signupUser } from '../mocks/db.json';

let admin;
let user1;

describe('RBAC', () => {
  beforeAll(async () => {
    const encryptedPassword = bcrypt.hashSync('123456', 10);
    await User.create({
      username: 'admin',
      userType: 'super-admin',
      email: 'admin@author.haven',
      password: encryptedPassword,
      confirmed: 'confirmed'
    });
    await User.create({
      ...signupUser,
      confirmed: 'confirmed',
      password: encryptedPassword
    });
    const res1 = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({
        user: {
          username: 'admin@author.haven',
          password: '123456'
        }
      });
    admin = res1.body.user;
    const res2 = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({
        user: {
          username: signupUser.email,
          password: signupUser.password
        }
      });
    user1 = res2.body.user;
  });

  afterAll(async () => {
    await User.destroy({ where: { id: admin.id } });
    await User.destroy({ where: { id: user1.id } });
  });

  test('should not grant access if user not admin', async () => {
    const res = await request(app)
      .put(`${urlPrefix}/users/${user1.id}/grant`)
      .set('authorization', user1.token)
      .send({ role: 'admin' });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
    expect(res.body.message).toBe('Not authorized');
  });

  test('should not grant access with invalid input', async () => {
    const fakeId = '8ed16da2-0041-40e0-bce1-3cb7b69bafa0';
    const res = await request(app)
      .put(`${urlPrefix}/users/${fakeId}/grant`)
      .set('authorization', admin.token)
      .send({ role: 'dhfjs' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
    expect(res.body.message).toBe('Invalid input');
  });

  test('should grant access', async () => {
    const res = await request(app)
      .put(`${urlPrefix}/users/${user1.id}/grant`)
      .set('authorization', admin.token)
      .send({ role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe('Admin access granted');
    expect(res.body.user.userType).toBe('admin');
  });

  test('should not grant access if user does not exist', async () => {
    const fakeId = '8ed16da2-0041-40e0-bce1-3cb7b69bafa0';
    const res = await request(app)
      .put(`${urlPrefix}/users/${fakeId}/grant`)
      .set('authorization', admin.token)
      .send({ role: 'admin' });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });
});
