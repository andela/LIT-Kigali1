import request from 'supertest';
import { Op } from 'sequelize';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';
import { User, Article, Comment } from '../../database/models';
import { createArticle, signupUser, signupUser2, createComment } from '../mocks/db.json';
import { slugString } from '../../helpers';

let loginUser1;
let loginUser2;
let newArticle;
let newComment;
jest.setTimeout(30000);
describe('comments', () => {
  beforeAll(async done => {
    let res = await request(app)
      .post(`${urlPrefix}/users`)
      .send({
        user: {
          email: signupUser.email,
          username: signupUser.username,
          password: signupUser.password
        }
      });
    loginUser1 = res.body.user;
    res = await request(app)
      .post(`${urlPrefix}/users`)
      .send({
        user: {
          email: signupUser2.email,
          username: signupUser2.username,
          password: signupUser2.password
        }
      });
    loginUser2 = res.body.user;
    res = await Article.create({
      ...createArticle,
      slug: slugString(createArticle.title),
      userId: loginUser1.id
    });
    newArticle = res.get();
    done();
  });

  afterAll(async () => {
    await User.destroy({
      where: {
        [Op.or]: [{ email: signupUser.email }, { email: signupUser2.email }]
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

  test('CREATE - should return Bad Request', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.id}/comments`)
      .send();
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('CREATE - should return No auth token', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.id}/comments`)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('No auth token');
  });

  test('CREATE - should return Article not found', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/fake-slug/comments`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('Article not found');
  });

  test('CREATE - should return created comment', async () => {
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

  test('CREATE - should return Parent comment not found', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.slug}/comments`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { ...createComment, parentId: newArticle.id } });
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('Parent comment not found');
  });

  test('CREATE - should return created comment with parentId', async () => {
    expect.assertions(4);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.slug}/comments`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { ...createComment, parentId: newComment.id } });
    newComment = res.body.comment;
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(201);
    expect(res.body.comment.id).toBeDefined();
    expect(res.body.comment.body).toBeDefined();
  });

  /* View a articles' comment test cases */

  test('VIEW - should return No auth token', async () => {
    expect.assertions(3);
    const res = await request(app).get(`${urlPrefix}/articles/${newArticle.id}/comments`);
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('No auth token');
  });

  test('VIEW - should return Article not found', async () => {
    expect.assertions(3);
    const res = await request(app)
      .get(`${urlPrefix}/articles/fake-article-slug/comments`)
      .set('Authorization', loginUser1.token);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('Article not found');
  });

  test("VIEW - should return articles' comments", async () => {
    expect.assertions(3);
    const res = await request(app)
      .get(`${urlPrefix}/articles/${newArticle.slug}/comments`)
      .set('Authorization', loginUser1.token);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.comments).toBeDefined();
  });

  test("VIEW - should return articles' comments for page 1", async () => {
    expect.assertions(5);
    const res = await request(app)
      .get(`${urlPrefix}/articles/${newArticle.slug}/comments?page=1`)
      .set('Authorization', loginUser1.token);

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.comments).toBeDefined();
    expect(res.body.commentsCount).toBeDefined();
    expect(res.body.page).toBe(1);
  });

  /* Update a comment test cases */

  test('UPDATE - should return Bad Request', async () => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/comments/${newComment.id}`)
      .send();
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('UPDATE - should return No auth token', async () => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/comments/${newComment.id}`)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('No auth token');
  });

  test('UPDATE - should return Unauthorized access', async () => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/comments/${newComment.id}`)
      .set('Authorization', loginUser2.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('Unauthorized access');
  });

  test('UPDATE - should return internal error', async () => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/comments/fake-comment-id`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(500);
    expect(res.body.status).toBe(500);
  });

  test('UPDATE - should return Comment not found', async () => {
    const commentBody = 'New body';
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/comments/${newArticle.id}`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { body: commentBody } });
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('Comment not found');
  });

  test('UPDATE - should return updated comment', async () => {
    const commentBody = 'New body';
    expect.assertions(4);
    const res = await request(app)
      .put(`${urlPrefix}/comments/${newComment.id}`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { body: commentBody } });
    newComment = res.body.comment;
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.comment.id).toBeDefined();
    expect(res.body.comment.body).toBe(commentBody);
  });

  /* Delete a comment test cases */

  test('DELETE - should return No auth token', async () => {
    expect.assertions(3);
    const res = await request(app)
      .delete(`${urlPrefix}/comments/${newComment.id}`)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('No auth token');
  });

  test('DELETE - should return Unauthorized access', async () => {
    expect.assertions(3);
    const res = await request(app)
      .delete(`${urlPrefix}/comments/${newComment.id}`)
      .set('Authorization', loginUser2.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('Unauthorized access');
  });

  test('DELETE - should return internal error', async () => {
    expect.assertions(2);
    const res = await request(app)
      .delete(`${urlPrefix}/comments/fake-comment-id`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(500);
    expect(res.body.status).toBe(500);
  });

  test('DELETE - should return Comment not found', async () => {
    expect.assertions(3);
    const res = await request(app)
      .delete(`${urlPrefix}/comments/${newArticle.id}`)
      .set('Authorization', loginUser1.token)
      .send();
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('Comment not found');
  });

  test('DELETE - should return Comment deleted successfully', async () => {
    expect.assertions(3);
    const res = await request(app)
      .delete(`${urlPrefix}/comments/${newComment.id}`)
      .set('Authorization', loginUser1.token)
      .send();
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe('Comment deleted successfully');
  });
});
