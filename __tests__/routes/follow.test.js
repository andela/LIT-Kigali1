import request from 'supertest';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';
import { User, Follow } from '../../database/models';
import { signupUser } from '../mocks/db.json';

let loginUser1;
let loginUser2;
const email = 'test_login@gmail.com';
const username = 'test_login';
const password = '123456';
const randomId = '27af8b1e-c0c9-4084-8304-256b2ae0c8b2';

describe('articles', () => {
  beforeAll(async done => {
    const encryptedPassword = bcrypt.hashSync('123456', 10);
    await User.create({
      ...signupUser,
      email,
      username,
      confirmed: 'confirmed',
      password: encryptedPassword
    });
    await User.create({
      ...signupUser,
      email: 'test_login1@gmail.com',
      username: 'test_login1',
      confirmed: 'confirmed',
      password: encryptedPassword
    });
    let res = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({ user: { username, password } });
    loginUser1 = res.body.user;
    res = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({ user: { username: 'test_login1', password } });
    loginUser2 = res.body.user;
    done();
  });

  afterAll(async () => {
    await User.destroy({
      where: {
        [Op.or]: [
          { email: signupUser.email },
          { email },
          { username: 'test_login' },
          { username: 'test_login1' }
        ]
      }
    }).then(() => true);
    await Follow.destroy({
      where: { followee: loginUser1.id, follower: loginUser2.id }
    });
  });

  test("Should return you can't follow yourself", async () => {
    expect.assertions(1);
    const res = await request(app)
      .post(`${urlPrefix}/users/${loginUser1.id}/follow`)
      .set('Authorization', loginUser1.token)
      .send();
    expect(res.body.message).toBe("You can't follow youself");
  });

  test('Should return user not found', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/users/${randomId}/follow`)
      .set('Authorization', loginUser1.token)
      .send();
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  test('Should return you followed', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/users/${loginUser1.id}/follow`)
      .set('Authorization', loginUser2.token)
      .send({ followee: loginUser1.id, follower: loginUser2.id });
    expect(res.body.status).toBe('201');
    expect(res.body.message).toBe('You followed test');
  });

  test('should return you unfollowed', async () => {
    expect.assertions(2);
    const res = await request(app)
      .delete(`${urlPrefix}/users/${loginUser1.id}/unfollow`)
      .set('Authorization', loginUser2.token)
      .send();
    expect(res.body.status).toBe('200');
    expect(res.body.message).toBe('You unfollowed test');
  });

  test("Should return you can't unfollow yourself", async () => {
    expect.assertions(1);
    const res = await request(app)
      .delete(`${urlPrefix}/users/${loginUser1.id}/unfollow`)
      .set('Authorization', loginUser1.token)
      .send();
    expect(res.body.message).toBe("You can't unfollow youself");
  });

  test('Should return user not found', async () => {
    expect.assertions(2);
    const res = await request(app)
      .delete(`${urlPrefix}/users/${randomId}/unfollow`)
      .set('Authorization', loginUser1.token)
      .send();
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });
});
