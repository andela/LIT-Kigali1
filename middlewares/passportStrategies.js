import bcrypt from 'bcrypt';
import passport from 'passport';
import { Op } from 'sequelize';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy } from 'passport-jwt';
import { User } from '../database/models';

import 'dotenv/config';

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
          return done(new Error('Email or Password is incorrect'));
        }
        const passwordMatch = await bcrypt.compare(password, user.get().password);
        if (!passwordMatch) {
          return done(new Error('Email or Password is incorrect'));
        }
        // Send the user information to the next middleware
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
      jwtFromRequest: req => req.cookies.jwt,
      secretOrKey: JWT_SECRET
    },
    (jwtPayload, done) => {
      if (Date.now() > jwtPayload.expires) {
        return done('jwt expired');
      }

      return done(null, jwtPayload);
    }
  )
);

export default passport;
