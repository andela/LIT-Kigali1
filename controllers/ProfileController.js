import uuid from 'uuid';
import { User } from '../database/models';
import { sendEmailConfirmationLink } from './MailController';

/**
 * @description ProfileContoller class
 */
class ProfileController {
  /**
   * @author Daniel
   * @param {*} req
   * @param {*} res
   * @returns {*} user object
   */
  static async createProfile(req, res) {
    const { user } = req.body;
    const { id } = req.currentUser;
    const { email, username } = req.body.user;
    if (email || username) {
      let message;
      if (email && username) {
        const emailOwner = await User.findOne({
          where: { email }
        });
        const usernameOwner = await User.findOne({
          where: { username }
        });
        if (emailOwner && usernameOwner) {
          message = 'email and username are';
        } else if (emailOwner) {
          message = 'email is';
        } else if (usernameOwner) {
          message = 'username is';
        }
      } else if (email) {
        const emailOwner = await User.findOne({
          where: { email }
        });
        if (emailOwner) {
          message = 'email is';
        }
      } else if (username) {
        const usernameOwner = await User.findOne({
          where: { username }
        });
        if (usernameOwner) {
          message = 'username is';
        }
      }
      if (message) {
        return res.status(409).send({
          errors: {
            body: [`${message} already taken`]
          }
        });
      }
    }
    const profile = await User.findOne({
      attributes: { exclude: ['password', 'status', 'userType', 'createdAt'] },
      where: { id }
    });
    profile.update({
      updateAt: new Date(),
      ...user,
      confirmationCode: uuid.v4(),
      confirmed: 'pending'
    });
    let message;
    if (user.email) {
      await sendEmailConfirmationLink({ ...profile.get() });
      message = 'Your email has changed. Please check your email for confirmation';
    } else {
      message = 'The information was updated successful';
    }
    const { confirmationCode, ...userData } = profile.get();
    return res.status(200).send({
      statu: 200,
      message,
      user: userData
    });
  }
}

export default ProfileController;
