import request from 'supertest';
import nock from 'nock';
import dotenv from 'dotenv';
import { facebookUser, googleUser } from '../mocks/db.json';
import { urlPrefix } from '../mocks/variables.json';
import app from '../../app';
import mockRequest from '../../__mocks__/mockRequest';
import mockResponse from '../../__mocks__/mockResponse';
import socialLogin from '../../__mocks__/socialLogin';

dotenv.config();

jest.setTimeout(30000);

describe('SOCIAL AUTHENTICATION', () => {
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
  });

  describe('User login through Facebook', () => {
    beforeAll(() => {
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

    test('It should call facebook callback route', async () => {
      expect.assertions(3);
      const res = await request(app).get(`${urlPrefix}/users/facebook/callback`);
      expect(res.status).toBe(302);
      expect(res.redirect).toBe(true);
      expect(res.redirects).toEqual([]);
    });

    test('test socialLogin controller', async () => {
      const req = mockRequest({ username: 'hugo' });
      const res = mockResponse();
      await socialLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      // expect(res.json).toHaveBeenCalledWith({ username: 'hugo' });
    });
    // test('It should call twitter callback route', () => {
    //   // expect.assertions(2);
    //   nock(`${SERVER_URL}`)
    //     .log(console.log)
    //     .filteringPath(() => '/api/v1/users/facebook/callback')
    //     .get('/api/v1/users/facebook/callback')
    //     .reply(200, { status: 200, user: profile });

    //   // const res = await request(app).get(`${urlPrefix}/users/facebook/callback`);
    //   // expect(res.status).toBe(200);
    //   // expect(res.body.status).toBe(200);
    //   console.log(SERVER_URL, nock.pendingMocks());
    //   return request(app)
    //     .get(`${urlPrefix}/users/facebook/callback`)
    //     .then(res => {
    //       expect(res.status).toBe(200);
    //       expect(res.body.status).toBe(200);
    //     });
    // });
  });
});
