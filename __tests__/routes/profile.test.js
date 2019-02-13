import request from 'supertest';
import { User } from '../../database/models';
import { signupUser } from '../mocks/db.json';
import { urlPrefix } from '../mocks/variables.json';
import app from '../../app';

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
    });

    test('create profile', async () => {
        expect.assertions(10);
        const profile = {
          firstName: 'John',
          lastName: 'Doe',
          username: 'doe201',
          email: 'john.doe@andela.com',
          bio: 'I am software at Andela',
          gender: 'Male',
          birthDate: '12 June 1999',
          image: 'https://planetbotanix.com/wp-content/uploads/2017/08/Female-Avatar-1-300x300.jpg',
          cover: 'https://www.eta.co.uk/wp-content/uploads/2012/09/Cycling-by-water-resized-min.jpg'
        }
        const res = await request(app)
          .put(`${urlPrefix}/user`)
          .set('Authorization', testUserToken)
          .send({user: {
            ...profile
          }})
    
        expect(res.status).toBe(200);
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
      test('create profile without --token', async () => {
        expect.assertions(1);
        await User.destroy({
          where: { email: signupUser.email }
        });
        const profile = {
          firstName: 'John',
          lastName: 'Doe',
          username: 'doe201',
          email: 'john.doe@andela.com',
          bio: 'I am software at Andela',
          gender: 'Male',
          birthDate: '12 June 1999',
          image: 'https://planetbotanix.com/wp-content/uploads/2017/08/Female-Avatar-1-300x300.jpg',
          cover: 'https://www.eta.co.uk/wp-content/uploads/2012/09/Cycling-by-water-resized-min.jpg'
        }
        const res = await request(app)
          .put(`${urlPrefix}/user`)
          .send({user: {
            ...profile
          }})
    
        expect(res.status).toBe(401);
      });

      test('create profile with --unexisting user', async () => {
        expect.assertions(2);
        await User.destroy({
          where: { email: signupUser.email }
        });
        const profile = {
          firstName: 'John',
          lastName: 'Doe',
          username: 'doe201',
          email: 'john.doe@andela.com',
          bio: 'I am software at Andela',
          gender: 'Male',
          birthDate: '12 June 1999',
          image: 'https://planetbotanix.com/wp-content/uploads/2017/08/Female-Avatar-1-300x300.jpg',
          cover: 'https://www.eta.co.uk/wp-content/uploads/2012/09/Cycling-by-water-resized-min.jpg'
        }
        const res = await request(app)
          .put(`${urlPrefix}/user`)
          .set('Authorization', testUserToken)
          .send({user: {
            ...profile
          }})
    
        expect(res.status).toBe(404);
        expect(res.body.errors.body).toBeDefined();
      });

});