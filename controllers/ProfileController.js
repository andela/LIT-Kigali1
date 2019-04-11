import uuid from 'uuid';
import sequelize, { Op } from 'sequelize';
import { User, Article, Follow, Reader, Favorite } from '../database/models';
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

  /**
   * @author Manzi
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns {*} Users object
   */
  static async getProfiles(req, res) {
    const { page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;
    const { currentUser } = req;
    let users = await User.findAndCountAll({
      where: {
        userType: 'user',
        confirmed: { [Op.ne]: 'pending' },
        status: { [Op.ne]: 'blocked' }
      },
      include: {
        model: Follow,
        as: 'userFollower',
        where: { follower: currentUser ? currentUser.id : null },
        required: false,
        attributes: ['followee']
      },
      attributes: ['firstName', 'lastName', 'image', 'bio'],
      limit,
      offset
    });

    const pages = Math.ceil(users.count / limit) || 1;
    users = users.rows;
    users = users.map(data => {
      const user = { ...data.get() };
      user.followed = user.userFollower && user.userFollower.length > 0;
      delete user.userFollower;
      return user;
    });
    if (page > pages) {
      return res.status(404).json({ status: 404, message: 'The page does not exist' });
    }
    return res.status(200).json({
      status: 200,
      profiles: users,
      page,
      totalPages: pages
    });
  }

  /**
   *@author Manzi
   * @param {*} req
   * @param {*} res
   * @returns {*} User object
   */
  static async getProfile(req, res) {
    const { username } = req.params;
    const { currentUser } = req;
    const profile = await User.findOne({
      where: { username, userType: 'user' },
      attributes: ['username', 'firstName', 'lastName', 'image', 'bio', 'email', 'gender'],
      group: ['User.id', 'articles.id', 'userFollower.id'],
      include: [
        {
          model: Article,
          attributes: [
            'id',
            'slug',
            'cover',
            'title',
            'body',
            'description',
            'readingTime',
            'createdAt',
            'updatedAt',
            [sequelize.fn('COUNT', 'views.id'), 'viewCount'],
            [sequelize.fn('COUNT', 'favorites.id'), 'rating']
          ],
          as: 'articles',
          include: [
            { model: Reader, as: 'views', attributes: [] },
            {
              model: Favorite,
              as: 'favorites',
              attributes: []
            }
          ],
          group: ['articles.id']
        },
        {
          model: Follow,
          as: 'userFollower',
          where: { follower: currentUser ? currentUser.id : null },
          required: false,
          attributes: ['followee']
        }
      ]
    });
    if (!profile) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }
    return res.status(200).json({
      status: 200,
      user: {
        ...profile.get(),
        userFollower: undefined,
        followed: profile.userFollower && profile.userFollower.length > 0
      }
    });
  }

  /**
   *@author Olivier
   * @param {*} req
   * @param {*} res
   * @returns {*} User object
   */
  static async getCurrentUser(req, res) {
    const { currentUser } = req;

    return res.status(200).json({
      status: 200,
      user: {
        ...currentUser,
        password: undefined
      }
    });
  }
}

export default ProfileController;
