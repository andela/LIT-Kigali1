import request from 'supertest';
import { Op } from 'sequelize';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';
import { User, Article, Comment } from '../../database/models';
import {
 createArticle, signupUser, signupUser2, createComment 
} from '../mocks/db.json';
import { slugString } from '../../helpers';

let loginUser1;
let loginUser2;
let newArticle;
let newComment;
jest.setTimeout(50000);
describe('comments', () => {
  beforeAll(async () => {
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
  });

  afterAll(async () => {
    await User.destroy({where: { [Op.or]: [{ email: signupUser.email }, { email: signupUser2.email }] }}).then(() => true);
    await Article.destroy({ where: { tagList: { [Op.contains]: ['Test'] } } });
    await Comment.destroy({where: { [Op.or]: [{ userId: loginUser1.id }, { userId: loginUser2.id }] }});
  });

  /* Create a comment test cases */

  test('CREATE - should return Bad Request', async done => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.id}/comments`)
      .send();
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    done();
  });

  test('CREATE - should return No auth token', async done => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.id}/comments`)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('No auth token');
    done();
  });

  test('CREATE - should return Article not found', async done => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/fake-slug/comments`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('Article not found');
    done();
  });

  test('CREATE - should return created comment', async done => {
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
    done();
  });

  test('CREATE - should return Parent comment not found', async done => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle.slug}/comments`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { ...createComment, parentId: newArticle.id } });
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('Parent comment not found');
    done();
  });

  test('CREATE - should return created comment with parentId', async done => {
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
    done();
  });

  /* View a articles' comment test cases */

  test('VIEW - should return No auth token', async done => {
    expect.assertions(3);
    const res = await request(app).get(`${urlPrefix}/articles/${newArticle.id}/comments`);
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('No auth token');
    done();
  });

  test('VIEW - should return Article not found', async done => {
    expect.assertions(3);
    const res = await request(app)
      .get(`${urlPrefix}/articles/fake-article-slug/comments`)
      .set('Authorization', loginUser1.token);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('Article not found');
    done();
  });

  test("VIEW - should return articles' comments", async done => {
    expect.assertions(3);
    const res = await request(app)
      .get(`${urlPrefix}/articles/${newArticle.slug}/comments`)
      .set('Authorization', loginUser1.token);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.comments).toBeDefined();
    done();
  });

  test("VIEW - should return articles' comments for page 1", async done => {
    expect.assertions(5);
    const res = await request(app)
      .get(`${urlPrefix}/articles/${newArticle.slug}/comments?page=1`)
      .set('Authorization', loginUser1.token);

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.comments).toBeDefined();
    expect(res.body.commentsCount).toBeDefined();
    expect(res.body.page).toBe(1);
    done();
  });

  /* Update a comment test cases */

  test('UPDATE - should return Bad Request', async done => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/comments/${newComment.id}`)
      .send();
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    done();
  });

  test('UPDATE - should return No auth token', async done => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/comments/${newComment.id}`)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('No auth token');
    done();
  });

  test('UPDATE - should return Unauthorized access', async done => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/comments/${newComment.id}`)
      .set('Authorization', loginUser2.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('Unauthorized access');
    done();
  });

  test('UPDATE - should return internal error', async done => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/comments/fake-comment-id`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(500);
    expect(res.body.status).toBe(500);
    done();
  });

  test('UPDATE - should return Comment not found', async done => {
    const commentBody = 'New body';
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/comments/${newArticle.id}`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { body: commentBody } });
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('Comment not found');
    done();
  });

  test('UPDATE - should return updated comment', async done => {
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
    done();
  });

  /* Delete a comment test cases */

  test('DELETE - should return No auth token', async done => {
    expect.assertions(3);
    const res = await request(app)
      .delete(`${urlPrefix}/comments/${newComment.id}`)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('No auth token');
    done();
  });

  test('DELETE - should return Unauthorized access', async done => {
    expect.assertions(3);
    const res = await request(app)
      .delete(`${urlPrefix}/comments/${newComment.id}`)
      .set('Authorization', loginUser2.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('Unauthorized access');
    done();
  });

  test('DELETE - should return internal error', async done => {
    expect.assertions(2);
    const res = await request(app)
      .delete(`${urlPrefix}/comments/fake-comment-id`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(500);
    expect(res.body.status).toBe(500);
    done();
  });

  test('DELETE - should return Comment not found', async done => {
    expect.assertions(3);
    const res = await request(app)
      .delete(`${urlPrefix}/comments/${newArticle.id}`)
      .set('Authorization', loginUser1.token)
      .send();
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe('Comment not found');
    done();
  });

  test('DELETE - should return Comment deleted successfully', async done => {
    expect.assertions(3);
    const res = await request(app)
      .delete(`${urlPrefix}/comments/${newComment.id}`)
      .set('Authorization', loginUser1.token)
      .send();
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe('Comment deleted successfully');
    done();
  });
});
