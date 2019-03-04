import passport from 'passport';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import moment from 'moment';
import { User, ResetPassword, Token } from '../database/models';
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
    const {body: { user }} = req;
    let userModel = await User.findOne({where: {[Op.or]: [{ email: user.email.toLowerCase() }, { username: user.username.toLowerCase() }]}});
    if (userModel) {
      return res.status(401).json({ status: 401, message: 'Account already exist' });
    }
    const passwordHashed = await bcrypt.hash(user.password, 10);

    userModel = await User.create({
      ...user,
      email: user.email.toLowerCase(),
      username: user.username.toLowerCase(),
      password: passwordHashed
    });

    const token = jwt.sign(
      { id: userModel.get().id, userType: userModel.get().userType },
      JWT_SECRET
    );
    await userModel.createToken({ token });

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
      if (err || !user) {
        return res.status(404).json({ status: 404, message: err.message });
      }
      const token = jwt.sign({ id: user.id, userType: user.userType }, JWT_SECRET);
      await Token.create({ token, userId: user.id });
      const { confirmationCode, ...userData } = user;
      return res.json({ status: 200, user: { ...userData, token } });
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
    const {body: { user }} = req;

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
      message: 'Password reset link sent sucessfully. Please check your email!'
    });
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
      const reset = await ResetPassword.findOne({ where: { resetCode, userId } });

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
            message: 'Your password has been reset successfully!'
          });
        }
      }
    } catch (error) {
      return res.status(520);
    }
  }

  /**
   * @author Olivier
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async signout(req, res) {
    const { currentUser } = req;
    await Token.update(
      { status: 'signout', signoutAt: moment().format() },
      { where: { token: currentUser.token } }
    );
    return res.json({ status: 200, message: 'Signed out successfully' });
  }
}

export default AuthController;
