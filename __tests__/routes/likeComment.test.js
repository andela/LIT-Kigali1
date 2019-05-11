import request from 'supertest';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';
import { User, Article, Comment, Notification } from '../../database/models';
import { createArticle, signupUser, createComment } from '../mocks/db.json';

let testToken, testComment, testArticle;
describe('likeComment', () => {
  const newArticle = { ...createArticle, body: JSON.stringify(createArticle.body) };
  beforeAll(async () => {
    await User.destroy({ where: { email: signupUser.email } });
    const encryptedPassword = bcrypt.hashSync(signupUser.password, 10);
    await User.create({
      ...signupUser,
      confirmed: 'confirmed',
      password: encryptedPassword
    });
    const res1 = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({ user: { username: signupUser.email, password: signupUser.password } });
    testToken = res1.body.user.token;
    const res2 = await request(app)
      .post(`${urlPrefix}/articles`)
      .set('authorization', testToken)
      .send({ article: { ...newArticle } });
    testArticle = res2.body.article;
    const res3 = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments`)
      .set('authorization', testToken)
      .send({ comment: { ...createComment } });
    testComment = res3.body.comment;
  });
  afterAll(async () => {
    await User.destroy({ where: { email: signupUser.email } });
    await Article.destroy({ where: { id: testArticle.id } });
    await Comment.destroy({ where: { id: testComment.id } });
    await Notification.destroy({
      where: { Notification: { [Op.like]: `%${testArticle.title}%` } }
    });
  });

  test('should like a comment', async done => {
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/like`)
      .set('authorization', testToken);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(201);
    expect(res.body.message).toBe('Comment liked');
    expect(res.body.like.value).toBe('liked');
    done();
  });

  test('should unlike a comment', async () => {
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/like`)
      .set('authorization', testToken);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe('Like removed');
  });

  test('should like a comment in case it was disliked', async done => {
    await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/dislike`)
      .set('authorization', testToken);

    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/like`)
      .set('authorization', testToken);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe(201);
    expect(res.body.message).toBe('Comment liked');
    expect(res.body.like.value).toBe('liked');
    done();
  });

  test('should not like comment without authorization', async () => {
    expect.assertions(2);
    const res = await request(app).post(
      `${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/like`
    );

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No auth token');
  });

  test('should not like unexisting comment', async () => {
    expect.assertions(3);
    await Comment.destroy({ where: { id: testComment.id } });
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/like`)
      .set('authorization', testToken);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('The comment you are trying to like does not exist');
  });

  test('should dislike comment', async () => {
    await Comment.create({
      userId: testComment.userId,
      id: testComment.id,
      body: testComment.body,
      articleId: testComment.articleId
    });
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/dislike`)
      .set('authorization', testToken);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Comment disliked');
    expect(res.body.dislike.value).toBe('disliked');
  });

  test('should dislike comment in case it is liked', async () => {
    await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/like`)
      .set('authorization', testToken);

    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/dislike`)
      .set('authorization', testToken);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Comment disliked');
    expect(res.body.dislike.value).toBe('disliked');
  });

  test('should remove dislike from comment', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/dislike`)
      .set('authorization', testToken);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe('Dislike removed');
  });

  test('should not dislike comment without authorization', async () => {
    expect.assertions(2);
    const res = await request(app).post(
      `${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/dislike`
    );

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No auth token');
  });

  test('should not dislike unexisting comment', async () => {
    expect.assertions(3);
    await Comment.destroy({ where: { id: testComment.id } });
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/dislike`)
      .set('authorization', testToken);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('The comment you are trying to dislike does not exist');
  });

  test('should not dislike unexisting comment', async () => {
    expect.assertions(3);
    await Comment.destroy({ where: { id: testComment.id } });
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/dislike`)
      .set('authorization', testToken);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('The comment you are trying to dislike does not exist');
  });

  test('should get not likes', async () => {
    expect.assertions(3);
    await Comment.create({
      userId: testComment.userId,
      id: testComment.id,
      body: testComment.body,
      articleId: testComment.articleId
    });
    const res = await request(app).get(
      `${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/like`
    );

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.counts).toBe(0);
  });

  test('should get all likes for a comment', async () => {
    expect.assertions(5);
    await request(app)
      .get(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/like`)
      .set('authorization', testToken);
    const res = await request(app).get(
      `${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/like`
    );

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.likes).toBeDefined();
    expect(res.body.page).toBeDefined();
    expect(res.body.pages).toBeDefined();
  });

  test('should get not likes for unexisting comment', async () => {
    expect.assertions(3);
    const res = await request(app).get(
      `${urlPrefix}/articles/${testArticle.slug}/comments/4b557e5f-d3da-4ac0-a25b-cfd2b244eedc/like`
    );

    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('No likes found');
  });

  test('should get not likes', async () => {
    expect.assertions(3);
    const res = await request(app).get(
      `${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/dislike`
    );

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.counts).toBe(0);
  });

  test('should get all dislikes for a comment', async () => {
    expect.assertions(5);
    await request(app)
      .get(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/dislike`)
      .set('authorization', testToken);
    const res = await request(app).get(
      `${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/dislike`
    );

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.dislikes).toBeDefined();
    expect(res.body.page).toBeDefined();
    expect(res.body.pages).toBeDefined();
  });

  test('should get not likes for unexisting comment', async () => {
    expect.assertions(3);
    const fakeId = '4b557e5f-d3da-4ac0-a25b-cfd2b244eedc';
    const res = await request(app).get(
      `${urlPrefix}/articles/${testArticle.slug}/comments/${fakeId}/dislike`
    );

    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('No dislikes found');
  });
});
