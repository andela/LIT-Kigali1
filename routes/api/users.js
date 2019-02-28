import express from 'express';
import { celebrate } from 'celebrate';
import passport from 'passport';
import dotenv from 'dotenv';
import { User } from '../../database/models';
import { authValidator } from '../validators';
import { AuthController, UserController } from '../../controllers';
import { verifyJwt } from '../../middlewares';

dotenv.config();
const router = express.Router();
const { SERVER_URL } = process.env;

router.post(
  '/login',
  celebrate({
    body: authValidator.login
  }),
  AuthController.login
);

router.post(
  '/',
  celebrate({
    body: authValidator.signup
  }),
  AuthController.signup
);

router.post('/signout', verifyJwt(), AuthController.signout);

router.get('/:userId/confirm_email/:confirmationCode', UserController.confirmEmail);
router.post(
  '/forget',
  celebrate({
    body: authValidator.forgetPassword
  }),
  AuthController.forgotPassword
);
router.put(
  '/:userId/reset/:resetCode',
  celebrate({
    body: authValidator.resetPassword
  }),
  AuthController.resetPassword
);

/* FACEBOOK ROUTER */
router.get('/facebook', passport.authenticate('facebook'));

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res) => {
    res.status(302).redirect(`http://${SERVER_URL}/api/v1/users/${req.user.username}/social/`);
  }
);

/* TWITTER ROUTER */
router.get('/twitter', passport.authenticate('twitter'));

router.get(
  '/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(`http://${SERVER_URL}/api/v1/users/${req.user.username}/social/`);
  }
);

/* GOOGLE ROUTER */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile']
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(`http://${SERVER_URL}/api/v1/users/${req.user.username}/social/`);
  }
);

router.get('/:username/social/', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(404).json({ status: 404, message: 'Not found' });
  res.render('index', {
    user: user.get(),
    title: 'User profile'
  });
});

export default router;
