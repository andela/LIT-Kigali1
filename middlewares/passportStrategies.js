import bcrypt from 'bcrypt';
import passport from 'passport';
import { Op } from 'sequelize';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import 'dotenv/config';
import { User, Token } from '../database/models';

const {
  SERVER_URL,
  JWT_SECRET,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  GOOGLE_CONSUMER_KEY,
  GOOGLE_CONSUMER_SECRET
} = process.env;

passport.use('login',
  new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    },
    async (username, password, done) => {
      let user;
      try {
        user = await User.findOne({ where: { [Op.or]: [{ email: username }, { username }] } });
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
    }));
passport.use('jwt',
  new JWTStrategy({
      jwtFromRequest: ExtractJwt.fromHeader('authorization'),
      secretOrKey: JWT_SECRET,
      passReqToCallback: true
    },
    async (req, jwtPayload, done) => {
      const { authorization } = req.headers;
      try {
        const token = await Token.findOne({ where: { status: 'active', token: authorization } });
        if (!token) {
          return done(
null, false, { message: 'Invalid token. Please login.' }
);
        }
        const user = await User.findOne({
          where: { id: jwtPayload.id },
          attributes: { exclude: ['password'] }
        });
        if (!user) {
          return done(
null, false, { message: 'user does not exist' }
);
        }
        return done(null, { ...user.get(), token: token.token });
      } catch (error) {
        return done(error);
      }
    }));

passport.serializeUser((user, callback) => {
  callback(null, user);
});

passport.deserializeUser(async (user, callback) => {
  const foundUser = await User.findOne({ where: { id: user.id } });
  callback(null, foundUser);
});

passport.use(new TwitterStrategy({
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: `http://${SERVER_URL}/api/v1/users/twitter/callback`,
      session: false
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const data = profile._json;
        const user = await User.findOrCreate({
          where: { username: profile.id },
          defaults: {
            username: data.id,
            email: `${data.username}@twitter.com`,
            firstName: data.screen_name,
            password: data.id,
            socialId: data.id,
            authType: 'twitter',
            image: data.profile_image_url || null
          }
        });
        return done(null, user[0].get());
      } catch (err) {
        return done(err, null);
      }
    }));

passport.use(new FacebookStrategy({
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: `http://${SERVER_URL}/api/v1/users/facebook/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const data = profile._json;
        const user = await User.findOrCreate({
          where: { username: profile.id },
          defaults: {
            username: data.id,
            email: data.id,
            firstName: data.name,
            password: data.id,
            socialId: data.id,
            authType: 'facebook',
            image: data.profileUrl || null
          }
        });
        return done(null, user[0].get());
      } catch (error) {
        return done(error);
      }
    }));

passport.use(new GoogleStrategy({
      clientID: GOOGLE_CONSUMER_KEY,
      clientSecret: GOOGLE_CONSUMER_SECRET,
      callbackURL: `http://${SERVER_URL}/api/v1/users/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const data = profile._json;
        const user = await User.findOrCreate({
          where: { socialId: profile.id },
          defaults: {
            username: data.id,
            email: data.id,
            firstName: data.displayName,
            password: profile.id,
            socialId: profile.id,
            authType: 'Gmail',
            image: data.image.url || null
          }
        });
        return done(null, user[0].get());
      } catch (err) {
        return done(err, null);
      }
    }));

export default passport;
