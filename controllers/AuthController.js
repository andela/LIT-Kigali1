import passport from "passport";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { Op } from "sequelize";
import { User } from "../database/models";
const { JWT_SECRET } = process.env;

class AuthController {
  /**
   * @author Chris
   * @author Olivier
   * @description Log In the user
   */
  static async login(req, res, next) {
    const { username, password } = req.body;
    passport.authenticate("login", async (err, user, info) => {
      try {
        if (err || !user) {
          const error = new Error("An Error occured");
          return next(error);
        }
        req.login(user, { session: false }, async error => {
          if (error) return next(error);
          //user password in the token so we pick only the email and id
          const body = { _id: user._id, email: user.email };
          //Sign the JWT token and populate the payload with the user email and id
          const token = jwt.sign({ user: body }, JWT_SECRET);

          // assign our jwt to the cookie
          res.cookie("jwt", jwt, { httpOnly: true, secure: true });
          //Send back the token to the user
          return res.json({ token, user });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  }
}
export default AuthController;
