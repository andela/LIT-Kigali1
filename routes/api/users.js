import express from 'express';
import { celebrate } from 'celebrate';
import { authValidator } from '../validators';

const { AuthController } = require('../../controllers');

const router = express.Router();

router.post(
  '/login',
  celebrate({
    body: authValidator.login
  }),
  AuthController.login
);

module.exports = router;
