import express from 'express';
import { celebrate } from 'celebrate';
import { authValidator } from '../validators';
import { AuthController, UserController } from '../../controllers';
import { verifyJwt } from '../../middlewares';

const router = express.Router();
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

export default router;
