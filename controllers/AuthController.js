import passport from 'passport';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const { JWT_SECRET } = process.env;

/**
 * @description Authentication class
 */
class AuthController {
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
