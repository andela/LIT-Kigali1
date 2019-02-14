import request from 'supertest';
import jwt from 'jsonwebtoken';
import { User } from '../../database/models';
import { signupUser, profile } from '../mocks/db.json';
import { urlPrefix } from '../mocks/variables.json';
import app from '../../app';

const { JWT_SECRET } = process.env;

let testUserToken;
describe('Profile', () => {
  beforeAll(async () => {
    const { body } = await request(app)
      .post(`${urlPrefix}/users`)
      .send({ user: {
        username: signupUser.username,
        email: signupUser.email,
        password: signupUser.password
      } });
    testUserToken = body.user.token;
  });
  
  afterAll(async () => {
    await User.destroy({
      where: { email: signupUser.email }
    });
    await User.destroy({
      where: { email: profile.email }
    })
  });

  test('should create profile and send confirmation when email is provided', async () => {
      expect.assertions(11);
      const res = await request(app)
        .put(`${urlPrefix}/user`)
        .set('Authorization', testUserToken)
        .send({user: {
          ...profile
        }})
  
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Your email is changed. Please check your email for confirmation');
      expect(res.body.user.firstName).toBe(profile.firstName);
      expect(res.body.user.lastName).toBe(profile.lastName);
      expect(res.body.user.username).toBe(profile.username);
      expect(res.body.user.email).toBe(profile.email);
      expect(res.body.user.bio).toBe(profile.bio);
      expect(res.body.user.gender).toBe(profile.gender);
      expect(res.body.user.birthDate).toBeDefined();
      expect(res.body.user.image).toBe(profile.image);
      expect(res.body.user.cover).toBe(profile.cover);
    });

  test('should create profile and not send confirmation email when email is not provided', async () => {
    expect.assertions(3);
    const res = await request(app)
      .put(`${urlPrefix}/user`)
      .set('Authorization', testUserToken)
      .send({user: {
        firstName: 'Peter'
      }})

    expect(res.status).toBe(200);
    expect(res.body.user.firstName).toBe('Peter');
    expect(res.body.message).toBe('The information was updated successful');
  });

    test('should not create profile with --taken email and username', async () => {
      expect.assertions(2);
      const res = await request(app)
        .put(`${urlPrefix}/user`)
        .set('Authorization', testUserToken)
        .send({user: {
          ...profile
        }})
  
      expect(res.status).toBe(409);
      expect(res.body.errors.body[0]).toBe('email and username are already taken');
    });

    test('should not create profile with --taken email ', async () => {
      expect.assertions(2);
      const res = await request(app)
        .put(`${urlPrefix}/user`)
        .set('Authorization', testUserToken)
        .send({user: {
          email: profile.email
        }})
  
      expect(res.status).toBe(409);
      expect(res.body.errors.body[0]).toBe('email is already taken');
    });

    test('should not create profile with --taken username ', async () => {
      expect.assertions(2);
      const res = await request(app)
        .put(`${urlPrefix}/user`)
        .set('Authorization', testUserToken)
        .send({user: {
          username: profile.username
        }})
  
      expect(res.status).toBe(409);
      expect(res.body.errors.body[0]).toBe('username is already taken');
    });

    test('should not create profile with --taken username and untaken email ', async () => {
      expect.assertions(2);
      const res = await request(app)
        .put(`${urlPrefix}/user`)
        .set('Authorization', testUserToken)
        .send({user: {
          username: profile.username,
          email: 'papasava@email.com'
        }})
  
      expect(res.status).toBe(409);
      expect(res.body.errors.body[0]).toBe('username is already taken');
    });

    test('should not create profile with --taken email and untaken username ', async () => {
      expect.assertions(2);
      const res = await request(app)
        .put(`${urlPrefix}/user`)
        .set('Authorization', testUserToken)
        .send({user: {
          username: 'papasava',
          email: profile.email
        }})
  
      expect(res.status).toBe(409);
      expect(res.body.errors.body[0]).toBe('email is already taken');
    });

    test('should not create profile without --token', async () => {
      expect.assertions(2);
      await User.destroy({
        where: { email: 'john.doe@andela.com' }
      });
      const res = await request(app)
        .put(`${urlPrefix}/user`)
        .send({user: {
          ...profile
        }})
  
      expect(res.status).toBe(401);
      expect(res.body.errors.body[0]).toBe('No auth token');
    });

    test('should not create profile with --unexisting user', async () => {
      expect.assertions(2);
      await User.destroy({
        where: { email: signupUser.email }
      });
      const res = await request(app)
        .put(`${urlPrefix}/user`)
        .set('Authorization', testUserToken)
        .send({user: {
          ...profile
        }});

      expect(res.status).toBe(404);
      expect(res.body.errors.body).toBeDefined();
    });

    test('should not create profile with --malformed token', async () => {
      expect.assertions(2);
      await User.destroy({
        where: { email: signupUser.email }
      });
      const res = await request(app)
        .put(`${urlPrefix}/user`)
        .set('Authorization', 'thgdihueh-jz')
        .send({user: {
          ...profile
        }})
  
      expect(res.status).toBe(401);
      expect(res.body.errors.body).toBeDefined();
    });

    test('should not create profile with --incorrect token', async () => {
      expect.assertions(2);
      await User.destroy({
        where: { email: signupUser.email }
      });
      const token = jwt.sign({ id: 12345, userType: 'user' }, JWT_SECRET);
      const res = await request(app)
        .put(`${urlPrefix}/user`)
        .set('Authorization', token)
        .send({user: {
          ...profile
        }})
  
      expect(res.status).toBe(520);
      expect(res.body.errors.body).toBeDefined();
    });
});
