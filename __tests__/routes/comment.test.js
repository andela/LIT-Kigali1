import request from 'supertest';
import { Op } from 'sequelize';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';
import { User, Article, Comment } from '../../database/models';
import {
 createArticle, signupUser, signupUser2, createComment 
} from '../mocks/db.json';

let loginUser1;
let loginUser2;
let newArticle;
let newComment;
jest.setTimeout(30000);
describe('comments', () => {
  beforeAll(async (done) => {
    let res = await request(app)
      .post(`${urlPrefix}/users`)
      .send({ user: { ...signupUser } });
    loginUser1 = res.body.user;
    res = await request(app)
      .post(`${urlPrefix}/users`)
      .send({ user: { ...signupUser2 } });
    loginUser2 = res.body.user;
    res = await Article.create({
      ...createArticle,
      userId: loginUser1.id
    });
    newArticle = res.body.article;
    done();
  });

  afterAll(async () => {
    await User.destroy({
      where: {
        [Op.or]: [{ email: signupUser.email }]
      }
    }).then(() => true);
    await Article.destroy({
      where: { tagList: { [Op.contains]: ['Test'] } }
    });
    await Comment.destroy({
      where: {
        [Op.or]: [{ userId: loginUser1.id }, { userId: loginUser2.id }]
      }
    });
  });

  /* Create a comment test cases */

  test('should return Bad Request', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.id}/comments`)
      .send();
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('should return No auth token', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.id}/comments`)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('No auth token');
  });

  test('should return Article not found', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/articles/fake-slug/comments`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('Article not found');
  });

  test('should return created comment', async () => {
    expect.assertions(4);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.slug}/comments`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { ...createComment } });
    newComment = res.body.comment;
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(201);
    expect(res.body.comment.id).toBeDefined();
    expect(res.body.comment.body).toBeDefined();
  });

  /* View a articles' comment test cases */

  test('should return No auth token', async () => {
    expect.assertions(3);
    const res = await request(app).get(`${urlPrefix}/articles/${newArticle.id}/comments`);
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('No auth token');
  });

  test("should return articles' comments", async () => {
    expect.assertions(3);
    const res = await request(app)
      .get(`${urlPrefix}/articles/${newArticle.slug}/comments`)
      .set('Authorization', loginUser1.token);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.comments).toBeDefined();
  });

  test("should return articles' comments for page 1", async () => {
    expect.assertions(5);
    const res = await request(app).get(`${urlPrefix}/comments?page=1`);
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.comments).toBeDefined();
    expect(res.body.commentsCount).toBeDefined();
    expect(res.body.page).toBe(1);
  });

  /* Update a comment test cases */

  test('should return Bad Request', async () => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/comments/${newComment.id}`)
      .send();
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('should return No auth token', async () => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/comments/${newComment.id}`)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('No auth token');
  });

  test('should return Unauthorized access', async () => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/comments/${newComment.id}`)
      .set('Authorization', loginUser2.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('Unauthorized access');
  });

  test('should return Comment not found', async () => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/comments/fake-comment-id`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('Comment not found');
  });

  test('should return updated comment', async () => {
    const commentBody = 'New body';
    expect.assertions(4);
    const res = await request(app)
      .post(`${urlPrefix}/comments/${newComment.id}`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { body: commentBody } });
    newComment = res.body.comment;
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(201);
    expect(res.body.comment.id).toBeDefined();
    expect(res.body.comment.body).toBe(commentBody);
  });

  /* Delete a comment test cases */

  test('should return No auth token', async () => {
    expect.assertions(3);
    const res = await request(app)
      .delete(`${urlPrefix}/comments/${newComment.id}`)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('No auth token');
  });

  test('should return Unauthorized access', async () => {
    expect.assertions(3);
    const res = await request(app)
      .delete(`${urlPrefix}/comments/${newComment.id}`)
      .set('Authorization', loginUser2.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('Unauthorized access');
  });

  test('should return Comment not found', async () => {
    expect.assertions(2);
    const res = await request(app)
      .delete(`${urlPrefix}/comments/fake-comment-id`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('Comment not found');
  });

  test('should return Comment deleted successfully', async () => {
    expect.assertions(4);
    const res = await request(app)
      .delete(`${urlPrefix}/comments/${newComment.id}`)
      .set('Authorization', loginUser1.token)
      .send();
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe('Comment deleted successfully');
  });
});
