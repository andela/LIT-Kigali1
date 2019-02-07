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
  '/signup',
  celebrate({
    body: authValidator.signup
  }),
  AuthController.signup
);

module.exports = router;
