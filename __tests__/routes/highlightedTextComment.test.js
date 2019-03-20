import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';
import { User, Article } from '../../database/models';
import {
  signupUser,
  createArticle,
  createComment,
  highlightedText
} from '../mocks/db.json';

let user1;
let testArticle;

describe('highlightedTextComment', async () => {
  beforeAll(async () => {
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
          password: signupUser
        }
      });
    user1 = res1.body.user;
    const res2 = await request(app)
      .post(`${urlPrefix}/articles`)
      .send({
        article: createArticle
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
          highlightedText,
        }
      });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(201);
    expect(res.body.comment.id).toBe();
    expect(res.body.comment.body).toBe(createComment.body);
    expect(res.body.comment.highlightedText).toBe(highlightedText);
  });
  test('should not comment a highlighted text if not login', async () => {
    const res = await request(app)
      .post(`${urlPrefix}/articles/${testArticle.slug}/comment-on-text`)
      .send({
        comment: {
          ...createComment,
          highlightedText,
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
          highlightedText,
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
          highlightedText: fakeText
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
});
