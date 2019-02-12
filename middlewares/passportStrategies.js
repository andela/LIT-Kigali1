import bcrypt from 'bcrypt';
import passport from 'passport';
import { Op } from 'sequelize';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import 'dotenv/config';
import { User } from '../database/models';

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
      secretOrKey: JWT_SECRET
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findOne({
          where : {id: jwtPayload.id}
        });
        if (!user) {
          return done(null, false, { message: 'user does not exist' });
        }
        return done(null, user.get());
      } catch(error) {
       return done(error);
      }
    }
  )
)

export default passport;
