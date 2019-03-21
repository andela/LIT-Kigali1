import request from 'supertest';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';
import { User, Follow, Article, Notification } from '../../database/models';
import { signupUser, createArticle } from '../mocks/db.json';

let loginUser1;
let loginUser2;
const email = 'test_login@gmail.com';
const username = 'test_login';
const password = '123456';
let notificationId;
let newArticle2;
let newArticle;

describe('articles', () => {
  beforeAll(async done => {
    const encryptedPassword = bcrypt.hashSync('123456', 10);
    await User.create({
      ...signupUser,
      email,
      username,
      confirmed: 'confirmed',
      password: encryptedPassword
    });
    await User.create({
      ...signupUser,
      email: 'test_login1@gmail.com',
      username: 'test_login1',
      confirmed: 'confirmed',
      password: encryptedPassword
    });
    let res = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({ user: { username, password } });
    loginUser1 = res.body.user;
    res = await request(app)
      .post(`${urlPrefix}/users/login`)
      .send({ user: { username: 'test_login1', password } });
    loginUser2 = res.body.user;
    done();
  });

  afterAll(async () => {
    await User.destroy({
      where: {
        [Op.or]: [
          { email: signupUser.email },
          { email },
          { username: 'test_login' },
          { username: 'test_login1' }
        ]
      }
    }).then(() => true);
    await Follow.destroy({ where: { followee: loginUser1.id, follower: loginUser2.id } });
    await Notification.destroy({
      where: {
        [Op.or]: [
          { link: 'http://localhost:3000/api/v1/articles/Test article' },
          { userId: loginUser1.id }
        ]
      }
    });
    await Article.destroy({ where: { tagList: { [Op.contains]: ['test'] } } });
  });

  test('get notification - should fail to return notification for user 1', async () => {
    expect.assertions(3);
    const res = await request(app)
      .get(`${urlPrefix}/notifications`)
      .set('Authorization', loginUser1.token);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });

  test('Should return you followed', async () => {
    expect.assertions(2);
    const res = await request(app)
      .post(`${urlPrefix}/profiles/${loginUser1.username}/follow`)
      .set('Authorization', loginUser2.token)
      .send({ followee: loginUser1.username, follower: loginUser2.username });
    expect(res.body.status).toBe(201);
    expect(res.body.message).toBe('You followed test');
  });

  test('should return created article one', async () => {
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

  test('should return created article two', async () => {
    expect.assertions(4);
    const res = await request(app)
      .post(`${urlPrefix}/articles`)
      .set('Authorization', loginUser1.token)
      .send({ article: createArticle });
    newArticle2 = res.body.article;
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(201);
    expect(res.body.article).toBeDefined();
    expect(res.body.article.slug).toBeDefined();
  }, 30000);

  test('like an article', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle2.slug}/like`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Liked');
    expect(res.body.article).toBeDefined();
  });

  test('like an article', async () => {
    expect.assertions(3);
    const res = await request(app)
      .post(`${urlPrefix}/articles/${newArticle2.slug}/like`)
      .set('Authorization', loginUser1.token);
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

  test('disable notification - success', async () => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/notifications/disable`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test('disable notification - fail', async () => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/notifications/disable`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  test('get notification - should fail to return notification for user 1', async () => {
    expect.assertions(3);
    const res = await request(app)
      .get(`${urlPrefix}/notifications`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  test('enable notification - success', async () => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/notifications/enable`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test('enable notification - fail', async () => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/notifications/enable`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  test('get notification - should return notification for user 1', async () => {
    expect.assertions(4);
    const res = await request(app)
      .get(`${urlPrefix}/notifications`)
      .set('Authorization', loginUser2.token);
    notificationId = res.body.notifications[0].id;
    expect(res.status).toBe(200);
    expect(res.body.notifications).toBeDefined();
    expect(res.body.status).toBe(200);
    expect(res.body.notificationsCount).toBeDefined();
  });

  test('get one notification', async () => {
    expect.assertions(3);
    const res = await request(app)
      .get(`${urlPrefix}/notifications/${notificationId}`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(200);
    expect(res.body.notification).toBeDefined();
    expect(res.body.status).toBe(200);
  });

  test('mark all notification as read', async () => {
    expect.assertions(2);
    const res = await request(app)
      .put(`${urlPrefix}/notifications`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
  });

  test('get notification - should fail', async () => {
    expect.assertions(3);
    const res = await request(app)
      .get(`${urlPrefix}/notifications/${notificationId}`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(404);
    expect(res.body.message).toBeDefined();
    expect(res.body.status).toBe(404);
  });

  test('get notification - should fail to mark all notification as read', async () => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/notifications`)
      .set('Authorization', loginUser2.token);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });
});
