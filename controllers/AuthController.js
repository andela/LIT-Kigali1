import passport from 'passport';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { User } from '../database/models';
import { sendEmailConfirmationLink } from './MailController';

const { JWT_SECRET } = process.env;

/**
 * @description Authentication class
 */
class AuthController {
  /**
   * @author Caleb
   * @author Manzi
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async signup(req, res) {
    let userModel;
    let token;
    const {
      body: { user }
    } = req;
    try {
      userModel = await User.findOne({
        where: {
          [Op.or]: [{ email: user.email.toLowerCase() }, { username: user.username.toLowerCase() }]
        }
      });
      if (userModel) {
        return res.status(401).json({ status: 401, message: 'Account already exist' });
      }
      const password = await bcrypt.hash(user.password, 10);

      userModel = await User.create({
        ...user,
        email: user.email.toLowerCase(),
        username: user.username.toLowerCase(),
        password
      });

      token = jwt.sign({ id: userModel.get().id, userType: userModel.get().userType }, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ status: 401, message: 'Please try again' });
    }

    await sendEmailConfirmationLink({ ...userModel.get() });

    const { password, confirmationCode, ...userData } = userModel.get();

    return res.status(201).json({
      status: 201,
      message: 'Account created sucessfully. Please check your email for confirmation',
      user: { ...userData, token }
    });
  }

  /**
   * @author Chris
   * @author Olivier
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async login(req, res, next) {
    const { user: loginUser } = req.body;
    req.body.username = loginUser.username;
    req.body.password = loginUser.password;
    passport.authenticate('login', async (err, user) => {
      try {
        if (err || !user) {
          return res.status(404).json({ status: 404, message: err.message });
        }
        const token = jwt.sign({ id: user.id, userType: user.userType }, JWT_SECRET);
        const { confirmationCode, ...userData } = user;
        return res.json({ status: 200, user: { ...userData, token } });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  }
}

export default AuthController;
