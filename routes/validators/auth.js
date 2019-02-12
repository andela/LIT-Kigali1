import { Joi } from 'celebrate';

const signup = {
  user: Joi.object().keys({
    username: Joi.string()
      .required()
      .trim(),
    password: Joi.string()
      .required()
      .min(6),
    email: Joi.string()
      .email()
      .required()
      .trim()
  })
};
const login = {
  user: Joi.object().keys({
    password: Joi.string()
      .required()
      .min(6)
      .max(60),
    username: Joi.string()
      .required()
      .trim()
      .min(6)
      .max(60)
  })
};

export default {
  signup,
  login
};
