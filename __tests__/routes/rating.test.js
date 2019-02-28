import request from 'supertest';
import { urlPrefix } from '../mocks/variables.json';
import { User } from '../../database/models';
import app from '../../app';
import { signupUser } from '../mocks/db.json';

let testUserToken;
describe('Profile', () => {
  beforeAll(async () => {
    const { body } = await request(app)
      .post(`${urlPrefix}/users`)
      .send({
        user: {
          username: signupUser.username,
          email: signupUser.email,
          password: signupUser.password
        }
      });
    testUserToken = body.user.token;
  });
  afterAll(async () => {
    await User.destroy({
      where: { email: signupUser.email }
    });
  });

  test('should rate an article', async () => {
    expect.assertions(1);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', testUserToken)
      .send({});

    expect(res.status).toBe(200);
  });
});
