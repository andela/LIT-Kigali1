import { User } from '../../database/models';
import { signupUser } from '../mocks/db.json';

describe('User model', () => {
  beforeAll(async () => {
    await User.destroy({ where: { email: signupUser.email } });
  });

  test('Create a user', async () => {
    expect.assertions(1);
    const res = await User.create({ ...signupUser });
    expect(res.get()).toHaveProperty('email', signupUser.email);
  });

  test('Find a user', async () => {
    expect.assertions(1);
    const res = await User.findOne({ where: { email: signupUser.email } });
    expect(res.get()).toHaveProperty('email', signupUser.email);
  });

  test('Update a user', async () => {
    expect.assertions(1);
    const [, userData] = await User.update(
      { firstName: 'Olivier' },
      { where: { email: signupUser.email }, returning: true, plain: true },
    );
    expect(userData.firstName).toBe('Olivier');
  });

  test('Delete a user', async () => {
    expect.assertions(1);
    const res = await User.destroy({ where: { email: signupUser.email } });
    expect(res).toBe(1);
  });
});
