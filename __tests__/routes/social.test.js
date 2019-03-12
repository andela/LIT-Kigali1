import request from 'supertest';
import nock from 'nock';
import dotenv from 'dotenv';
import { facebookUser, googleUser, twitterUser } from '../mocks/db.json';
import { urlPrefix } from '../mocks/variables.json';
import app from '../../app';

dotenv.config();
jest.setTimeout(30000);

describe('SOCIAL AUTHENTICATION', () => {
  describe('User login through Twitter', () => {
    beforeAll(async () => {
      await nock('https://www.twitter.com/')
        .filteringPath(() => '/')
        .get(`${urlPrefix}/users/twitter`)
        .reply(
302, undefined, { Location: `${urlPrefix}/users/${twitterUser.user.id}/social` }
);
    });

    test('It should call twitter route', async () => {
      expect.assertions(3);
      const res = await request(app).get(`${urlPrefix}/users/twitter`);
      expect(res.status).toBe(302);
      expect(res.redirect).toBe(true);
      expect(res.redirects).toEqual([]);
    });

    test('It should call twitter callback route', async () => {
      expect.assertions(3);
      const res = await request(app).get(`${urlPrefix}/users/twitter/callback`);
      expect(res.status).toBe(302);
      expect(res.redirect).toBe(true);
      expect(res.redirects).toEqual([]);
    });

    test('Data return from callback', async () => {
      expect.assertions(2);
      const res = await request(app).get(`${urlPrefix}/users/${twitterUser.user.id}/social`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Not found');
    });
  });

  describe('User login through Google', () => {
    beforeAll(async () => {
      nock('https://www.google.com/')
        .filteringPath(() => `${urlPrefix}/users/google`)
        .get(`${urlPrefix}/users/google`)
        .reply(302, googleUser);
    });

    test('It should call google route', async () => {
      expect.assertions(3);
      const res = await request(app).get(`${urlPrefix}/users/google`);
      expect(res.status).toBe(302);
      expect(res.redirect).toBe(true);
      expect(res.redirects).toEqual([]);
    });

    test('It should call twitter callback route', async () => {
      expect.assertions(3);
      const res = await request(app).get(`${urlPrefix}/users/google/callback`);
      expect(res.status).toBe(302);
      expect(res.redirect).toBe(true);
      expect(res.redirects).toEqual([]);
    });

    test('Data return from callback', async () => {
      expect.assertions(2);
      const res = await request(app).get(`${urlPrefix}/users/${googleUser.id}/social`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Not found');
    });
  });

  describe('User login through Facebook', () => {
    beforeAll(async () => {
      nock('https://www.facebook.com/')
        .filteringPath(() => '/')
        .get('/')
        .reply(302, facebookUser);
    });

    test('It should call facebook route', async () => {
      expect.assertions(3);
      const res = await request(app).get(`${urlPrefix}/users/facebook`);
      expect(res.status).toBe(302);
      expect(res.redirect).toBe(true);
      expect(res.redirects).toEqual([]);
    });

    test('It should call twitter callback route', async () => {
      expect.assertions(3);
      const res = await request(app).get(`${urlPrefix}/users/facebook/callback`);
      expect(res.status).toBe(302);
      expect(res.redirect).toBe(true);
      expect(res.redirects).toEqual([]);
    });

    test('Data return from callback', async () => {
      expect.assertions(2);
      const res = await request(app).get(`${urlPrefix}/users/${facebookUser.id}/social`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Not found');
    });
  });
});
