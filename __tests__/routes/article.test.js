import request from 'supertest';
import app from '../../app';
import { urlPrefix } from '../mocks/variables.json';

const fakeSlug = 'fake-slug';
const correctSlug = 'new-article';

describe('articles', () => {
  test('Should return article not found', async () => {
    expect.assertions(2);
    const res = await request(app).get(`${urlPrefix}/articles/${fakeSlug}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Article not found');
  });
  test('Should return article', async () => {
    expect.assertions(2);
    const res = await request(app).get(`${urlPrefix}/articles/${correctSlug}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});
