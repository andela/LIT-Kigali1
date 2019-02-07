import passport from 'passport';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { User } from '../database/models';

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
    let user;
    let token;
    const { body } = req;
    try {
      user = await User.findOne({
        where: { [Op.or]: [{ email: body.email }, { username: body.username }] }
      });
      if (user) {
        return res.status(401).json({ status: 401, message: 'Account already exist' });
      }
      const password = await bcrypt.hash(body.password, 10);

      user = await User.create({ ...body, password });

      token = jwt.sign({ id: user.id, userType: user.userType }, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ status: 401, message: 'Please try again' });
    }

    res.cookie('jwt', jwt, { httpOnly: true, secure: true });
    const { password, ...userData } = user.get();
    return res.status(201).json({
      status: 201,
      message: 'Account created sucessfully',
      token,
      User: userData
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
    passport.authenticate('login', async (err, user) => {
      try {
        if (err || !user) {
          return res.status(404).json({ message: err.message });
        }
        req.login(user, { session: false }, async error => {
          if (error) return next(error);
          const body = { id: user.id, username: user.username };
          const token = jwt.sign({ user: body }, JWT_SECRET);

          res.cookie('jwt', jwt, { httpOnly: true, secure: true });

          return res.json({ token, user });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  }
}
export default AuthController;
