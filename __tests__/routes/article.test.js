import request from 'supertest';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';
import { User, Article } from '../../database/models';
import { createArticle, signupUser } from '../mocks/db.json';

let loginUser;
const email = 'test_login@gmail.com';
const username = 'test_login';
const password = '123456';
describe('users', () => {
  beforeAll(async () => {
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
    loginUser = res.body.user;
  });

  afterAll(async () => {
    await User.destroy({
      where: { [Op.or]: [{ email: signupUser.email }, { email }, { username: 'test_login' }] }
    }).then(() => true);
    await Article.destroy({
      where: { tagList: { $contains: ['Test'] } }
    });
  });

  test('should return created article', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/articles`)
      .set('Authorization', loginUser.token)
      .send({ article: createArticle });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(201);
    expect(res.body.article).toBeDefined();
  }, 30000);
});
