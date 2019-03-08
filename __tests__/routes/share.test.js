import request from 'supertest';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';
import { User, Article } from '../../database/models';
import { createArticle2, signupUser } from '../mocks/db.json';

let loginUser1;
let loginUser2;
let newArticle2;
const email = 'test_login@gmail.com';
const username = 'test_login';
const password = '123456';
const fakeSlug = 'fake-slug';
jest.setTimeout(30000);

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
    res = await request(app)
      .post(`${urlPrefix}/articles`)
      .set('Authorization', loginUser2.token)
      .send({ article: createArticle2 });
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
    await Article.destroy({ where: { tagList: { [Op.contains]: ['share', 'social'] } } });
  });

  test('should return created article', async () => {
    expect.assertions(4);
    const res = await request(app)
      .post(`${urlPrefix}/articles`)
      .set('Authorization', loginUser1.token)
      .send({ article: createArticle2 });
    newArticle2 = res.body.article;
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(201);
    expect(res.body.article).toBeDefined();
    expect(res.body.article.slug).toBeDefined();
  });

  test('should share article on twitter', async () => {
    const res = await request(app).get(`${urlPrefix}/articles/${newArticle2.slug}/share/twitter`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test('should fail to share article on twitter', async () => {
    const res = await request(app).get(`${urlPrefix}/articles/${fakeSlug}/share/twitter`);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });

  test('should share article on Facebook', async () => {
    const res = await request(app).get(`${urlPrefix}/articles/${newArticle2.slug}/share/facebook`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test('should fail to share article on Facebook', async () => {
    const res = await request(app).get(`${urlPrefix}/articles/${fakeSlug}/share/facebook`);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });

  test('should share article on Linkedin', async () => {
    const res = await request(app).get(`${urlPrefix}/articles/${newArticle2.slug}/share/linkedin`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test('should fail to share article on Linkedin', async () => {
    const res = await request(app).get(`${urlPrefix}/articles/${fakeSlug}/share/linkedin`);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });

  test('should share article on email', async () => {
    const res = await request(app).get(`${urlPrefix}/articles/${newArticle2.slug}/share/email`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test('should fail to share article on email', async () => {
    const res = await request(app).get(`${urlPrefix}/articles/${fakeSlug}/share/email`);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });
});
