import bcrypt from 'bcrypt';
import passport from 'passport';
import { Op } from 'sequelize';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import 'dotenv/config';
import { User, Token } from '../database/models';

const { JWT_SECRET } = process.env;

passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },
    async (username, password, done) => {
      let user;
      try {
        user = await User.findOne({
          where: { [Op.or]: [{ email: username }, { username }] }
        });
        if (!user) {
          return done(new Error("Email and password don't match"));
        }
        const passwordMatch = await bcrypt.compare(password, user.get().password);
        if (!passwordMatch) {
          return done(new Error("Email and password don't match"));
        }
        return done(null, { ...user.get(), password: undefined });
      } catch (error) {
        done(error);
      }
    }
  )
);
passport.use(
  'jwt',
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader('authorization'),
      secretOrKey: JWT_SECRET,
      passReqToCallback: true
    },
    async (req, jwtPayload, done) => {
      const { authorization } = req.headers;
      try {
        const token = await Token.findOne({ where: { status: 'active', token: authorization } });
        if (!token) {
          return done(null, false, { message: 'Invalid token. Please login.' });
        }
        const user = await User.findOne({
          where: { id: jwtPayload.id },
          attributes: { exclude: ['password'] }
        });
        if (!user) {
          return done(null, false, { message: 'user does not exist' });
        }
        return done(null, { ...user.get(), token: token.token });
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
