import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';
import { User, Article, Comment } from '../../database/models';
import {
  signupUser,
  createArticle,
  createComment,
  partialArticle
} from '../mocks/db.json';

let user1;
let testArticle;
let comment;

describe('highlightedTextComment', () => {
  const newArticle = {
    ...createArticle,
    body: JSON.stringify(createArticle.body)
  }
  beforeAll(async () => {
    await User.destroy({
      where: {
        email: signupUser.email
      }
    })
    const encryptedPassword = bcrypt.hashSync(signupUser.password, 10);
    await User.create({
      ...signupUser,
      confirmed: 'confirmed',
      password: encryptedPassword
    });
    const res1 = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({
        user: {
          username: signupUser.email,
          password: signupUser.password
        }
      });
    user1 = res1.body.user;
    const res2 = await request(app)
      .post(`${urlPrefix}/articles`)
      .set('authorization', user1.token)
      .send({
        article: newArticle
      });
    testArticle = res2.body.article;
  });
  afterAll(async () => {
    await User.destroy({
      id: user1.id
    });
    await Article.destroy({
      where: {
        id: testArticle.id
      }
    });
  });

  test('should comment a highlighted text', async () => {
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comment-on-text`)
      .set('authorization', user1.token)
      .send({
        comment: {
          ...createComment,
          ...partialArticle
        }
      });
    console.log(res.body);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(201);
    expect(res.body.comment.id).toBeDefined();
    expect(res.body.comment.body).toBe(createComment.body);
    expect(res.body.comment.highlightedText).toBe(partialArticle.highlightedText);
    expect(res.body.comment.startPoint).toBeDefined();
    expect(res.body.comment.endPoint).toBeDefined();
  });
  test('should not comment a highlighted text if not login', async () => {
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comment-on-text`)
      .send({
        comment: {
          ...createComment,
          ...partialArticle,
        }
      });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No auth token');
  });
  test('should not comment a highlighted text if article does not exist', async () => {
    const fakeSlug = 'gdjj-dhbd';
    const res = await request(app)
      .post(`${urlPrefix}/articles/${fakeSlug}/comment-on-text`)
      .set('authorization', user1.token)
      .send({
        comment: {
          ...createComment,
          ...partialArticle,
        }
      });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Article not found');
  });
  test('should not comment a highlighted text if highlighted text is not in the article', async () => {
    const fakeText = 'gdjj-dhbd';
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comment-on-text`)
      .set('authorization', user1.token)
      .send({
        comment: {
          ...createComment,
          highlightedText: fakeText,
          startPoint: 5,
          endPoint: 14
        }
      });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('The text you highlighted is not in the article');
  });
  test('should not comment a highlighted text without a comment body', async () => {
    const fakeText = 'gdjj-dhbd';
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comment-on-text`)
      .set('authorization', user1.token)
      .send({
        comment: {
          highlightedText: fakeText
        }
      });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
  test('should not comment a highlighted text without a comment body', async () => {
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comment-on-text`)
      .set('authorization', user1.token)
      .send({
        comment: {
          ...createComment
        }
      });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
  test('should update comment on highlighted text', async () => {
    comment = await Comment.create({
      userId: user1.id,
      articleId: testArticle.id,
      body: 'wow nice one',
      highlightedText: 'culpa',
      startPoint: 5,
      endPoint: 10
    });
    const res = await request(app)
      .put(`${urlPrefix}/articles/${testArticle.slug}/comment-on-text/${comment.id}`)
      .set('authorization', user1.token)
      .send({
        comment: {
          body: 'hello world',
          highlightedText: 'pa',
          startPoint: 8,
          endPoint: 10
        }
      });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.comment.highlightedText).toBe('pa');
    expect(res.body.comment.startPoint).toBe(8);
    expect(res.body.comment.endPoint).toBe(10);
    expect(res.body.comment.body).toBe('hello world');
  });

  test('should update comment on highlighted text', async () => {
    const res = await request(app)
      .put(`${urlPrefix}/articles/${testArticle.slug}/comment-on-text/${comment.id}`)
      .set('authorization', user1.token)
      .send({
        comment: {
          body: 'hello africa',
        }
      });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.comment.body).toBe('hello africa');
  });

  test('should not update comment on highlighted text without authorization', async () => {
    const res = await request(app)
      .put(`${urlPrefix}/articles/${testArticle.slug}/comment-on-text/${comment.id}`)
      .send({
        comment: {
          body: 'hello world',
          highlightedText: 'pa',
          startPoint: 8,
          endPoint: 10
        }
      });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No auth token');
  });

  test('should not update comment on highlighted text without authorization', async () => {
    const res = await request(app)
      .put(`${urlPrefix}/articles/${testArticle.slug}/comment-on-text/${comment.id}`)
      .set('authorization', user1.token)
      .send({
        comment: {
          body: 'hello world',
          highlightedText: 'pa',
          endPoint: 10
        }
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Please provide both startPoint and endPoint');
  });

  test('should not update comment on highlighted text without authorization', async () => {
    const res = await request(app)
      .put(`${urlPrefix}/articles/${testArticle.slug}/comment-on-text/${comment.id}`)
      .set('authorization', user1.token)
      .send({
        comment: {
          body: 'hello world',
          highlightedText: 'pa',
          startPoint: 7,
          endPoint: 9
        }
      });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('The text you highlighted is not in the article');
  });

  test('should not update comment on highlighted text without authorization', async () => {
    const res = await request(app)
      .put(`${urlPrefix}/articles/${testArticle.slug}/comment-on-text/${user1.id}`)
      .set('authorization', user1.token)
      .send({
        comment: {
          body: 'hello world',
          highlightedText: 'pa',
          startPoint: 7,
          endPoint: 9
        }
      });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Comment not found');
  });
});
