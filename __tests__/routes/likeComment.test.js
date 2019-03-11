import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';
import { User, Article, Comment } from '../../database/models';
import { createArticle, signupUser, createComment } from '../mocks/db.json';

let testToken, testComment, testArticle;
describe('likeComment', () => {
  beforeAll(async () => {
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
      .send({ article: { ...createArticle } });
    testArticle = res2.body.article;
    const res3 = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.id}/comments`)
      .set('authorization', testToken)
      .send({ comment: { ...createComment } });
    testComment = res3.body.comment;
  });
  afterAll(async () => {
    await User.destroy({ where: { email: signupUser.email } });
    await Article.destroy({ where: { id: testArticle.id } });
    await Comment.destroy({ where: { id: testComment.id } });
  });

  test('should like a comment', async () => {
    expect.assertions(4);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/like`)
      .set('authorization', testToken);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe(201);
    expect(res.body.message).toBe('comment liked successfully');
    expect(res.body.like.value).toBe('liked');
  });

  test('should unlike a comment', async () => {
    expect.assertions(4);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/like`)
      .set('authorization', testToken);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe('like removed successfully');
  });

  test('should not like comment without authorization', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/like`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No auth token');
  });

  test('should not like unexisting comment', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/like`)
      .set('authorization', testToken);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('The comment you are trying to like does not exist');
  });

  test('should dislike comment', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/dislike`)
      .set('authorization', testToken);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Comment disliked successfully');
    expect(res.body.dislike.value).toBe('disliked');
  });

  test('should remove dislike from comment', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/dislike`)
      .set('authorization', testToken);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Disliked removed successfully');
  });

  test('should not dislike comment without authorization', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/dislike`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No auth token');
  });

  test('should not dislike unexisting comment', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comments/${testComment.id}/dislike`)
      .set('authorization', testToken);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('The comment you are trying to dislike does not exist');
  });
});
