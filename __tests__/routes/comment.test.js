import request from 'supertest';
import bcrypt from 'bcrypt';
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
jest.setTimeout(50000);
describe('comments', () => {
  beforeAll(async done => {
    await User.destroy({
      where: {
        [Op.or]: [{ email: signupUser.email }, { email: signupUser2.email }]
      }
    }).then(() => true);
    const encryptedPassword = bcrypt.hashSync(signupUser.password, 10);
    const encryptedPassword2 = bcrypt.hashSync(signupUser2.password, 10);
    await User.create({
      ...signupUser,
      confirmed: 'confirmed',
      password: encryptedPassword
    });
    const res = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({ user: { username: signupUser.email, password: signupUser.password } });
    loginUser1 = res.body.user;
    await User.create({
      ...signupUser2,
      confirmed: 'confirmed',
      password: encryptedPassword2
    });
    const res2 = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({ user: { username: signupUser2.email, password: signupUser2.password } });
    loginUser2 = res2.body.user;
    const res3 = await Article.create({
      ...createArticle,
      slug: slugString(createArticle.title),
      userId: loginUser1.id
    });
    newArticle = res3.get();
    done();
  });

  afterAll(async () => {
    await User.destroy({
      where: {
        [Op.or]: [{ email: signupUser.email }, { email: signupUser2.email }]
      }
    }).then(() => true);
    await Article.destroy({
      where: [{ id: newArticle.id }, { tagList: { [Op.contains]: ['test'] } }]
    });
    await Comment.destroy({
      where: {
        [Op.or]: [{ userId: loginUser1.id }, { userId: loginUser2.id }]
      }
    });
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

  test('Comment history - This comment was not edited', async done => {
    const res = await request(app)
      .get(`${urlPrefix}/articles/${newArticle.slug}/comments/${newComment.id}/edited`)
      .set('Authorization', loginUser1.token);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBeDefined();
    done();
  });

  /* Update a comment test cases */

  test('UPDATE - should return Bad Request', async done => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/articles/${newArticle.slug}/comments/${newComment.id}`)
      .send();
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    done();
  });

  test('UPDATE - should return No auth token', async done => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/articles/${newArticle.slug}/comments/${newComment.id}`)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('No auth token');
    done();
  });

  test('UPDATE - should return Unauthorized access', async done => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/articles/${newArticle.slug}/comments/${newComment.id}`)
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
      .put(`${urlPrefix}/articles/${newArticle.slug}/comments/fake-comment-id`)
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
      .put(`${urlPrefix}/articles/${newArticle.slug}/comments/${newArticle.id}`)
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
      .put(`${urlPrefix}/articles/${newArticle.slug}/comments/${newComment.id}`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { body: commentBody } });
    newComment = res.body.comment;
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.comment.id).toBeDefined();
    expect(res.body.comment.body).toBe(commentBody);
    done();
  });

  test('Comment history - should return old version', async done => {
    const res = await request(app)
      .get(`${urlPrefix}/articles/${newArticle.slug}/comments/${newComment.id}/edited`)
      .set('Authorization', loginUser1.token);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.editedComment.id).toBeDefined();
    expect(res.body.editedComment).toBeDefined();
    done();
  });

  test('Comment history - should fail to return old version- wrong token', async done => {
    const res = await request(app)
      .get(`${urlPrefix}/articles/${newArticle.slug}/comments/${newComment.id}/edited`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
    expect(res.body.status).toBe(401);
    expect(res.body.message).toBeDefined();
    done();
  });

  test('Comment history - should fail to return old version', async done => {
    const res = await request(app)
      .get(
        `${urlPrefix}/articles/${
          newArticle.slug
        }/comments/0ded7537-c7c2-4d4c-84d8-e941c84e965f/edited`
      )
      .set('Authorization', loginUser1.token);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBeDefined();
    done();
  });

  test('UPDATE - should return updated comment', async done => {
    const commentBody = 'New body';
    expect.assertions(4);
    const res = await request(app)
      .put(`${urlPrefix}/articles/${newArticle.slug}/comments/${newComment.id}`)
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
      .delete(`${urlPrefix}/articles/${newArticle.slug}/comments/${newComment.id}`)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(401);
    expect(res.body.comment).toBeUndefined();
    expect(res.body.message).toBe('No auth token');
    done();
  });

  test('DELETE - should return Unauthorized access', async done => {
    expect.assertions(3);
    const res = await request(app)
      .delete(`${urlPrefix}/articles/${newArticle.slug}/comments/${newComment.id}`)
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
      .delete(`${urlPrefix}/articles/${newArticle.slug}/comments/fake-comment-id`)
      .set('Authorization', loginUser1.token)
      .send({ comment: { ...createComment } });
    expect(res.status).toBe(500);
    expect(res.body.status).toBe(500);
    done();
  });

  test('DELETE - should return Comment not found', async done => {
    expect.assertions(3);
    const res = await request(app)
      .delete(`${urlPrefix}/articles/${newArticle.slug}/comments/${newArticle.id}`)
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
      .delete(`${urlPrefix}/articles/${newArticle.slug}/comments/${newComment.id}`)
      .set('Authorization', loginUser1.token)
      .send();
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe('Comment deleted successfully');
    done();
  });
});
