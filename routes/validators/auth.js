import { Joi } from "celebrate";

const signup = {
  firstName: Joi.string()
    .required()
    .trim(),
  lastName: Joi.string()
    .required()
    .trim(),
  password: Joi.string()
    .required()
    .min(6),
  email: Joi.string()
    .email()
    .required()
    .trim(),
  gender: Joi.string().valid("Male", "Female"),
  birthDate: Joi.date()
};
const login = {
  password: Joi.string()
    .required()
    .min(6)
    .max(60),
  username: Joi.string()
    .required()
    .trim()
    .min(6)
    .max(60)
};

export default {
  signup,
  login
};
