import uuid from 'uuid';
import { Op } from 'sequelize';
import { User, Article, Follow } from '../database/models';
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
        const emailOwner = await User.findOne({ where: { email } });
        const usernameOwner = await User.findOne({ where: { username } });
        if (emailOwner && usernameOwner) {
          message = 'email and username are';
        } else if (emailOwner) {
          message = 'email is';
        } else if (usernameOwner) {
          message = 'username is';
        }
      } else if (email) {
        const emailOwner = await User.findOne({ where: { email } });
        if (emailOwner) {
          message = 'email is';
        }
      } else if (username) {
        const usernameOwner = await User.findOne({ where: { username } });
        if (usernameOwner) {
          message = 'username is';
        }
      }
      if (message) {
        return res
          .status(409)
          .send({ status: 409, errors: { body: [`${message} already taken`] } });
      }
    }
    const profile = await User.findOne({
      attributes: { exclude: ['password', 'status', 'userType', 'createdAt'] },
      where: { id },
    });
    profile.update({
      updateAt: new Date(),
      ...user,
      confirmationCode: uuid.v4(),
      confirmed: 'pending',
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
      user: userData,
    });
  }

  /**
   * @author Manzi
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns {*} Users object
   */
  static async getProfiles(req, res) {
    const { currentUser } = req;
    let include;
    if (currentUser) {
      include = {
        model: Follow,
        as: 'userFollower',
        where: { follower: currentUser.id },
        required: false,
        attributes: ['followee'],
      };
    }
    let users = await User.findAll({
      where: {
        userType: 'user',
        confirmed: { [Op.ne]: 'pending' },
        status: { [Op.ne]: 'blocked' },
      },
      include,
      attributes: ['firstName', 'lastName', 'image', 'bio'],
    });
    users = users.map(data => {
      // const user = { ...data.get(), followed: false };
      const user = { ...data.get() };
      user.followed = user.userFollower && user.userFollower.length > 0;
      delete user.userFollower;
      return user;
    });
    return res.status(200).json({ status: 200, profiles: users });
  }

  /**
   * @author Manzi
   * @param {*} req
   * @param {*} res
   * @returns {*} User object
   */
  static async getProfile(req, res) {
    const { username } = req.params;
    const profile = await User.findOne({
      where: { username, userType: 'user' },
      attributes: ['username', 'firstName', 'lastName', 'image', 'bio', 'email', 'gender'],
      include: { model: Article, attributes: ['title', 'description'] },
    });
    if (!profile) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }
    return res.status(200).json({ status: 200, user: profile });
  }
}

export default ProfileController;
