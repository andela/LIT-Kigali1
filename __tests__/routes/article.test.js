import request from 'supertest';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';
import { User, Article } from '../../database/models';
import { createArticle, signupUser } from '../mocks/db.json';

let loginUser;
let newArticle;
const email = 'test_login@gmail.com';
const username = 'test_login';
const password = '123456';
const fakeSlug = 'fake-slug';

describe('articles', () => {
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
      where: { tagList: { [Op.contains]: ['Test'] } }
    });
  });

  test('should return created article', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles`)
      .set('Authorization', loginUser.token)
      .send({ article: createArticle });
    newArticle = res.body.article;
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(201);
    expect(res.body.article).toBeDefined();
  }, 30000);

  test('Should return article not found', async () => {
    expect.assertions(2);
    const res = await request(app).get(`${urlPrefix}/articles/${fakeSlug}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Article not found');
  });

  test('should return article', async () => {
    expect.assertions(3);
    const res = await request(app).get(`${urlPrefix}/articles/${newArticle.slug}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.article).toBeDefined();
  });

  test('Update - should update article', async () => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/articles/${newArticle.slug}`)
      .set('Authorization', loginUser.token)
      .send({ article: createArticle });
    expect(res.status).toBe(200);
    expect(res.body.article).toBeDefined();
  });

  test('Update - should return article not found', async () => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/articles/${fakeSlug}`)
      .set('Authorization', loginUser.token)
      .send({ article: createArticle });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Article not found');
  });

  test('should delete an article', async () => {
    expect.assertions(3);
    const res = await request(app)
      .delete(`${urlPrefix}/articles/${newArticle.slug}`)
      .set('Authorization', loginUser.token);
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.message).toBe('Article deleted successfully');
  });
});
