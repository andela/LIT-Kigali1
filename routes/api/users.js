import express from 'express';
import { celebrate } from 'celebrate';
import passport from 'passport';
import dotenv from 'dotenv';
import { authValidator, roleValidator } from '../validators';
import {
  AuthController,
  UserController,
  FollowController,
  GrantRoleController
} from '../../controllers';
import { verifyJwt } from '../../middlewares';
import { asyncHandler } from '../../helpers';

dotenv.config();
const router = express.Router();

router.post('/login', celebrate({ body: authValidator.login }), AuthController.login);

router.post('/', celebrate({ body: authValidator.signup }), AuthController.signup);

router.post('/signout', verifyJwt(), AuthController.signout);

router.get('/stats', verifyJwt({ tokenRequired: true }), asyncHandler(UserController.readingStats));

router.get('/:userId/confirm_email/:confirmationCode', UserController.confirmEmail);
router.post(
  '/forget',
  celebrate({ body: authValidator.forgetPassword }),
  AuthController.forgotPassword
);
router.put(
  '/:userId/reset/:resetCode',
  celebrate({ body: authValidator.resetPassword }),
  AuthController.resetPassword
);

/* FACEBOOK ROUTER */
router.get('/facebook', passport.authenticate('facebook'));

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  AuthController.socialLogin
);

/* TWITTER ROUTER */
router.get('/twitter', passport.authenticate('twitter'));

router.get(
  '/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  AuthController.socialLogin
);

/* GOOGLE ROUTER */
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  AuthController.socialLogin
);

router.post('/:username/follow', verifyJwt(), asyncHandler(FollowController.follow));

router.delete('/:username/unfollow', verifyJwt(), asyncHandler(FollowController.unfollow));

router.put(
  '/:username/grant',
  verifyJwt({ access: ['admin'] }),
  celebrate({ body: roleValidator }),
  asyncHandler(GrantRoleController.assignRole)
);

export default router;
