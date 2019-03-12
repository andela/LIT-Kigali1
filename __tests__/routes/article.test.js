import request from 'supertest';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';
import { User, Article, Favorite } from '../../database/models';
import { createArticle, signupUser } from '../mocks/db.json';

let loginUser1;
let loginUser2;
let newArticle;
let testArticle;
const email = 'test_login@gmail.com';
const username = 'test_login';
const password = '123456';
const fakeSlug = 'fake-slug';

describe('articles', () => {
  beforeAll(async done => {
    const encryptedPassword = bcrypt.hashSync('123456', 10);
    await User.create({
      ...signupUser,
      email,
      username,
      confirmed: 'confirmed',
      password: encryptedPassword,
    });
    await User.create({
      ...signupUser,
      email: 'test_login1@gmail.com',
      username: 'test_login1',
      confirmed: 'confirmed',
      password: encryptedPassword,
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
      .set('Authorization', loginUser1.token)
      .send({ article: createArticle });
    testArticle = res.body.article;
    done();
  });

  afterAll(async () => {
    await User.destroy({
      where: {
        [Op.or]: [
          { email: signupUser.email },
          { email },
          { username: 'test_login' },
          { username: 'test_login1' },
        ],
      },
    }).then(() => true);
    await Article.destroy({ where: { tagList: { [Op.contains]: ['test'] } } });
    await Favorite.destroy({ where: { articleId: newArticle.id } });
  });

  test('should return created article', async () => {
    expect.assertions(4);
    const res = await request(app)
      .post(`${urlPrefix}/articles`)
      .set('Authorization', loginUser1.token)
      .send({ article: createArticle });
    newArticle = res.body.article;
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(201);
    expect(res.body.article).toBeDefined();
    expect(res.body.article.slug).toBeDefined();
  }, 30000);

  test('Should return article not found', async () => {
    expect.assertions(2);
    const res = await request(app).get(`${urlPrefix}/articles/${fakeSlug}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Article not found');
  });

  test('should return article', async () => {
    expect.assertions(5);
    const res = await request(app).get(`${urlPrefix}/articles/${newArticle.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.article).toBeDefined();
    expect(res.body.article.author).toBeDefined();
    expect(res.body.article.author.following).toBe(false);
    expect(res.body.article.favoritesCount).toBeDefined();
  });

  test('Fetch Articles - should return articles', async () => {
    expect.assertions(3);
    const res = await request(app).get(`${urlPrefix}/articles`);
    expect(res.status).toBe(200);
    expect(res.body.articles).toBeDefined();
    expect(res.body.articlesCount).toBeDefined();
  });

  test('Fetch Articles - should return articles for page 2', async () => {
    expect.assertions(4);
    const res = await request(app).get(`${urlPrefix}/articles?page=2`);
    expect(res.status).toBe(200);
    expect(res.body.articles).toBeDefined();
    expect(res.body.articlesCount).toBeDefined();
    expect(res.body.page).toBe(2);
  });

  test('Fetch Articles - should return articles with the tag test', async () => {
    expect.assertions(4);
    const res = await request(app).get(`${urlPrefix}/articles?tag=test`);
    expect(res.status).toBe(200);
    expect(res.body.articles).toBeDefined();
    expect(res.body.articles[0].tagList).toContain('test');
    expect(res.body.articlesCount).toBeDefined();
  });

  test('Fetch Articles - should return articles by favorited tag test', async () => {
    expect.assertions(4);
    const res = await request(app).get(`${urlPrefix}/articles?favorited=${loginUser1.username}`);
    expect(res.status).toBe(200);
    expect(res.body.articles).toBeDefined();
    expect(res.body.articles[0].tagList).toContain('test');
    expect(res.body.articlesCount).toBeDefined();
  });

  test('Fetch Articles - should return articles from author test_login', async () => {
    expect.assertions(4);
    const res = await request(app).get(`${urlPrefix}/articles?author=test_login`);
    expect(res.status).toBe(200);
    expect(res.body.articles).toBeDefined();
    expect(res.body.articles[0].author.username).toBe('test_login');
    expect(res.body.articlesCount).toBeDefined();
  });

  test('Update - should return article not found', async () => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/articles/${fakeSlug}`)
      .set('Authorization', loginUser1.token)
      .send({ article: createArticle });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Article not found');
  });

  test('Update - should update article', async () => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/articles/${newArticle.slug}`)
      .set('Authorization', loginUser1.token)
      .send({ article: createArticle });
    expect(res.status).toBe(200);
    expect(res.body.article).toBeDefined();
  });

  test('Update - should update article slug', async () => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/articles/${newArticle.slug}`)
      .set('Authorization', loginUser1.token)
      .send({ article: { ...createArticle, title: 'new article slug' } });
    newArticle.slug = res.body.article.slug || newArticle.slug;
    expect(res.status).toBe(200);
    expect(res.body.article).toBeDefined();
  });

  test('Delete - should return Article not found', async () => {
    expect.assertions(2);
    const res = await request(app)
      .delete(`${urlPrefix}/articles/fake-article-slug`)
      .set('Authorization', loginUser1.token);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Article not found');
  });

  test('Delete - should return No auth token', async () => {
    expect.assertions(2);
    const res = await request(app).delete(`${urlPrefix}/articles/${newArticle.slug}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No auth token');
  });

  test('Delete - should return Unauthorized access', async () => {
    expect.assertions(2);
    const res = await request(app)
      .delete(`${urlPrefix}/articles/${newArticle.slug}`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Unauthorized access');
  });

  test('Delete - should delete an article', async () => {
    expect.assertions(2);
    const res = await request(app)
      .delete(`${urlPrefix}/articles/${newArticle.slug}`)
      .set('Authorization', loginUser1.token);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Article deleted successfully');
  });

  test('Delete - should return article not found', async () => {
    expect.assertions(2);
    const res = await request(app)
      .delete(`${urlPrefix}/articles/${fakeSlug}`)
      .set('Authorization', loginUser1.token);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Article not found');
  });

  test('like an unexisting article', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${fakeSlug}/like`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Article not found');
  });

  test('like an article', async () => {
    expect.assertions(3);
    const article = await Article.findOne({ where: { slug: newArticle.slug } });
    article.update({ status: 'published' });
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.slug}/like`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Liked');
    expect(res.body.article).toBeDefined();
  });

  test('dislike a liked article', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.slug}/dislike`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(200);
    expect(res.body.article).toBeDefined();
    expect(res.body.message).toBe('Disliked');
  });

  test('Remove dislike from an article', async () => {
    expect.assertions(4);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.slug}/dislike`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.message).toBe('Dislike Removed successfully');
    expect(res.body.article).toBeDefined();
  });

  test('dislike an article', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.slug}/dislike`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(200);
    expect(res.body.article).toBeDefined();
    expect(res.body.message).toBe('Disliked');
  });

  test('dislike an unexisting article', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${fakeSlug}/dislike`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Article not found');
  });

  test('like a disliked article', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.slug}/like`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Liked');
    expect(res.body.article).toBeDefined();
  });

  test('Remove like from an article', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.slug}/like`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Like Removed successfully');
    expect(res.body.article).toBeDefined();
  });

  test('Search article by title', async () => {
    expect.assertions(2);
    const res = await request(app).get(`${urlPrefix}/articles/search?title=${testArticle.title}`);
    expect(res.status).toBe(200);
    expect(res.body.articles).toBeDefined();
  });

  test('Search article by author', async () => {
    expect.assertions(2);
<<<<<<< HEAD
    const res = await request(app).get(
      `${urlPrefix}/articles/search?author=${loginUser1.username}`
    );
=======
    const res = await request(app).get(`${urlPrefix}/articles/search?author=${loginUser1.username}`,);
>>>>>>> fix(hound): fix some prettier issues
    expect(res.status).toBe(200);
    expect(res.body.articles).toBeDefined();
  });

  test('Search article by tags', async () => {
    expect.assertions(2);
    const res = await request(app).get(`${urlPrefix}/articles/search?tag=test`);
    expect(res.status).toBe(200);
    expect(res.body.articles).toBeDefined();
  });

  test('Search unexisting article by title', async () => {
    expect.assertions(2);
    const res = await request(app).get(`${urlPrefix}/articles/search?title=fake article`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Not found');
  });

  test('Get reading time of an article', async () => {
    expect.assertions(1);
    const res = await request(app)
      .get(`${urlPrefix}/articles/${testArticle.slug}`)
      .set('Authorization', loginUser2.token);
    expect(res.body.article.readingTime).toBeDefined();
  });
});
