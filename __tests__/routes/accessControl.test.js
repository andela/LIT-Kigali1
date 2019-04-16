import request from 'supertest';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import app from '../../app';
import { User } from '../../database/models';
import { urlPrefix } from '../mocks/variables.json';
import { signupUser, signupUser2 } from '../mocks/db.json';

let superAdmin;
let user1;
let user2;
let admin;

describe('RBAC', () => {
  beforeAll(async () => {
    await User.destroy({
      where: {
        [Op.or]: [
          { email: signupUser.email },
          { email: signupUser2.email },
          { username: 'superAdmin' },
          { username: 'admin' }
        ]
      }
    }).then(() => true);
    const encryptedPassword = bcrypt.hashSync('123456', 10);
    await User.create({
      username: 'superAdmin',
      userType: 'super-admin',
      email: 'superadmin@author.haven',
      password: encryptedPassword,
      confirmed: 'confirmed'
    });
    await User.create({
      ...signupUser,
      confirmed: 'confirmed',
      password: encryptedPassword
    });
    await User.create({
      ...signupUser2,
      confirmed: 'confirmed',
      password: encryptedPassword
    });
    await User.create({
      username: 'admin',
      userType: 'admin',
      email: 'admin@author.haven',
      password: encryptedPassword,
      confirmed: 'confirmed'
    });
    const res1 = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({
        user: {
          username: 'superadmin@author.haven',
          password: '123456'
        }
      });
    superAdmin = res1.body.user;
    const res2 = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({
        user: {
          username: signupUser.email,
          password: '123456'
        }
      });
    user1 = res2.body.user;
    const res3 = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({
        user: {
          username: signupUser2.email,
          password: '123456'
        }
      });
    user2 = res3.body.user;
    const res4 = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({
        user: {
          username: 'admin@author.haven',
          password: '123456'
        }
      });
    admin = res4.body.user;
  });

  afterAll(async () => {
    await User.destroy({
      where: {
        [Op.or]: [
          { email: signupUser.email },
          { email: signupUser2.email },
          { username: 'superAdmin' },
          { username: 'admin' }
        ]
      }
    }).then(() => true);
  });

  test('should not grant access if user not admin', async () => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/users/${user1.username}/grant`)
      .set('authorization', user1.token)
      .send({ role: 'admin' });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
    expect(res.body.message).toBe('Not authorized');
  });

  test('should not grant access with invalid input', async () => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/users/${user1.username}/grant`)
      .set('authorization', superAdmin.token)
      .send({ role: 'dhfjs' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Bad Request');
  });

  test('should grant access', async () => {
    expect.assertions(4);
    const res = await request(app)
      .put(`${urlPrefix}/users/${user1.username}/grant`)
      .set('authorization', superAdmin.token)
      .send({ role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe(`admin role granted to ${user1.username}`);
    expect(res.body.user.userType).toBe('admin');
  });

  test('should inform a user in case role is already granted', async () => {
    expect.assertions(3);
    await User.update({ userType: 'admin' }, { where: { username: user1.username } });
    const res = await request(app)
      .put(`${urlPrefix}/users/${user1.username}/grant`)
      .set('authorization', superAdmin.token)
      .send({ role: 'admin' });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe(409);
    expect(res.body.message).toBe(`${user1.username} is already an admin`);
  });

  test('should inform a user in case role is already granted', async () => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/users/${user2.username}/grant`)
      .set('authorization', superAdmin.token)
      .send({ role: 'user' });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe(409);
    expect(res.body.message).toBe(`${user2.username} is already a user`);
  });

  test('should not grant access if user does not exist', async () => {
    expect.assertions(3);
    const fakeName = 'rtvdr';
    const res = await request(app)
      .put(`${urlPrefix}/users/${fakeName}/grant`)
      .set('authorization', superAdmin.token)
      .send({ role: 'admin' });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  test('should not grant super-admin when you are an admin', async () => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/users/${user2.username}/grant`)
      .set('authorization', admin.token)
      .send({ role: 'super-admin' });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
    expect(res.body.message).toBe('Not authorized');
  });
});
