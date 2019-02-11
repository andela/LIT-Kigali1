import express from 'express';
import { celebrate } from 'celebrate';
import { authValidator } from '../validators';
import { AuthController } from '../../controllers';

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

export default router;
