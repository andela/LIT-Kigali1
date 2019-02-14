import passport from 'passport';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { User, ResetPassword } from '../database/models';
import { sendEmailConfirmationLink, resetPasswordEmail, newPasswordEmail } from './MailController';

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
        where: { [Op.or]: [{ email: user.email }, { username: user.username }] }
      });
      if (userModel) {
        return res.status(401).json({ status: 401, message: 'Account already exist' });
      }
      const password = await bcrypt.hash(user.password, 10);

      userModel = await User.create({ ...user, password });

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

  /**
   * @author Caleb
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async forgotPassword(req, res) {
    const {
      body: { user }
    } = req;

    try {
      const reset = await User.findOne({
        where: { email: user.email, confirmed: 'confirmed' },
        attributes: ['id', 'email']
      });
      if (!reset) {
        return res
          .status(404)
          .json({ status: 404, message: 'No user found with that email address' });
      }
      const { id, email } = reset.get();
      const createReset = await ResetPassword.create({ userId: id });
      const { resetCode } = createReset.get();
      await resetPasswordEmail(id, email, resetCode);
      res.status(201).json({
        status: 201,
        message: 'Password reset link sent sucessfully. Please check your email!',
        ResetPassword: createReset
      });
    } catch (error) {
      return res.status(401).json({ message: 'Please try again' });
    }
  }

  /**
   * @author Caleb
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async resetPassword(req, res) {
    const { resetCode, userId } = req.params;
    const { body } = req;
    try {
      const reset = await ResetPassword.findOne({
        where: { resetCode, userId }
      });

      if (body.newPassword !== body.confirmNewpassword) {
        res.status(400).json({ status: 400, message: "Passwords don't match" });
      }
      if (!reset) {
        res.status(404).json({ status: 404, message: 'invalid token' });
      }

      if (body.newPassword === body.confirmNewpassword) {
        const expirationTime = reset.createdAt.setMinutes(reset.createdAt.getMinutes() + 30);
        const presentTime = new Date();

        if (expirationTime < presentTime) {
          res
            .status(401)
            .json({ status: 401, message: 'Expired token, Please request a new Token' });
        }

        if (expirationTime > presentTime) {
          const user = await User.findOne({
            where: { id: userId },
            attributes: ['id', 'email']
          });

          const password = await bcrypt.hash(body.newPassword, 10);
          await user.update({ password });
          await newPasswordEmail(user.email);
          res.status(200).json({
            status: 200,
            user: { ...user.get() },
            message: 'Your password has been reset successfully!'
          });
        }
      }
    } catch (error) {
      return res.status(401);
    }
  }
}
export default AuthController;
