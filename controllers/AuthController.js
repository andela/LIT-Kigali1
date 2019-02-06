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
        req.login(user, { session: false }, async (error) => {
          if (error) return next(error);
          // user password in the token so we pick only the username and id
          const body = { id: user.id, username: user.username };
          // Sign the JWT token and populate the payload with the user email and id
          const token = jwt.sign({ user: body }, JWT_SECRET);

          // assign our jwt to the cookie
          res.cookie('jwt', jwt, { httpOnly: true, secure: true });
          // Send back the token to the user
          return res.json({ token, user });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  }
}
export default AuthController;
