import request from 'supertest';
import bcrypt from 'bcrypt';
import { urlPrefix } from '../mocks/variables.json';
import { User, Article, Favorite } from '../../database/models';
import app from '../../app';
import { signupUser } from '../mocks/db.json';

let testUser;
let articleSlug;
let testUserId;
describe('5 star Rating', () => {
  beforeAll(async () => {
    const encryptedPassword = bcrypt.hashSync(signupUser.password, 10);
    await User.create({
      ...signupUser,
      confirmed: 'confirmed',
      password: encryptedPassword
    });
    const res = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({ user: { username: signupUser.email, password: signupUser.password } });
    testUser = res.body.user;
    testUserId = res.body.user.id;
    const testArticle = await request(app)
      .post(`${urlPrefix}/articles`)
      .set('authorization', testUser.token)
      .send({
        article: {
          title: 'HelloTest',
          description: 'Hello Test',
          body: 'heloo  jnfdkenjsnfnvndn nnFDFKJN NFSJDNF NCDLFN  NJSNF'
        }
      });
    articleSlug = testArticle.body.article.slug;
  });
  afterAll(async () => {
    await User.destroy({ where: { email: signupUser.email } });
    await Favorite.destroy({ where: { userId: testUserId } });
    await Article.destroy({ where: { title: 'HelloTest' } });
  });
  test('should not rate unpublished article', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${articleSlug}/rating`)
      .set('Authorization', testUser.token)
      .send({ rate: 3 });
    expect(res.status).toBe(404);
    expect(res.body.errors.body[0]).toBe('Article not found');
  });
  test('should rate an article', async () => {
    expect.assertions(4);
    const article = await Article.findOne({ where: { slug: articleSlug } });
    article.update({ status: 'published' });
    const res = await request(app)
      .post(`${urlPrefix}/articles/${articleSlug}/rating`)
      .set('Authorization', testUser.token)
      .send({ rate: 3 });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('article has been rated successfully');
    expect(res.body.rate.rating).toBe(3);
    expect(res.body.averageRate).toBeDefined();
  });
  test('should overide an existing article rating', async () => {
    expect.assertions(4);
    const article = await Article.findOne({ where: { slug: articleSlug } });
    article.update({ status: 'published' });
    const res = await request(app)
      .post(`${urlPrefix}/articles/${articleSlug}/rating`)
      .set('Authorization', testUser.token)
      .send({ rate: 4 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Rating updated successfully');
    expect(res.body.rate.rating).toBe(4);
    expect(res.body.averageRate).toBeDefined();
  });
  test('should not rate unexisting article', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/hjakksmjjfklaldk/rating`)
      .set('Authorization', testUser.token)
      .send({ rate: 3 });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.errors.body[0]).toBe('Article not found');
  });
  test('should not rate without token', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/articles/hjakksmjjfklaldk/rating`)
      .send({ rate: 3 });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No auth token');
  });
  test('should not rate with invalid input', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/hjakksmjjfklaldk/rating`)
      .send({ rate: 6 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Bad Request');
    expect(res.body.errors[0].message).toBe('"rate" must be less than or equal to 5');
  });
  test('should not delete rate form unexisting article', async () => {
    expect.assertions(2);
    const article = await Article.findOne({ where: { slug: articleSlug } });
    article.update({ status: 'unpublished' });
    const res = await request(app)
      .delete(`${urlPrefix}/articles/${articleSlug}/rating`)
      .set('authorization', testUser.token);

    expect(res.status).toBe(404);
    expect(res.body.errors.body[0]).toBe('rating not found');
  });
  test('should delete rate from article', async () => {
    expect.assertions(2);
    const article = await Article.findOne({ where: { slug: articleSlug } });
    article.update({ status: 'published' });
    const res = await request(app)
      .delete(`${urlPrefix}/articles/${articleSlug}/rating`)
      .set('authorization', testUser.token);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Rating removed successfully');
  });
  test('should not delete unexisting rating', async () => {
    expect.assertions(2);
    const res = await request(app)
      .delete(`${urlPrefix}/articles/${articleSlug}/rating`)
      .set('authorization', testUser.token);

    expect(res.status).toBe(404);
    expect(res.body.errors.body[0]).toBe('rating not found');
  });
  test('should not get unexisting rating', async () => {
    expect.assertions(3);
    const res = await request(app).get(`${urlPrefix}/articles/${articleSlug}/rating`);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('No rating for such article');
  });
  test('should not get rating for unpublished article', async () => {
    expect.assertions(3);
    const article = await Article.findOne({ where: { slug: articleSlug } });
    article.update({ status: 'unpublished' });
    const res = await request(app).get(`${urlPrefix}/articles/${articleSlug}/rating`);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('Rating not found');
  });
  test('should get rating for a given article', async () => {
    expect.assertions(6);
    const article = await Article.findOne({ where: { slug: articleSlug } });
    article.update({ status: 'published' });
    const rate = await Favorite.findOne({ where: { articleId: article.get().id } });
    rate.update({ rating: 4 });
    const res = await request(app).get(`${urlPrefix}/articles/${articleSlug}/rating`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.averageRate).toBeDefined();
    expect(res.body.ratings).toBeDefined();
    expect(res.body.page).toBeDefined();
    expect(res.body.pages).toBeDefined();
  });
});
