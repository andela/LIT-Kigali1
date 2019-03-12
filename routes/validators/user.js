import { Joi } from 'celebrate';

const profile = {
  user: Joi.object().keys({
    username: Joi.string().trim(),
    firstName: Joi.string().min(3),
    lastName: Joi.string().min(3),
    email: Joi.string()
      .email()
      .trim(),
    bio: Joi.string().min(20),
    gender: Joi.string().max(6),
    birthDate: Joi.date(),
    image: Joi.string(),
    cover: Joi.string(),
  }),
};
export default profile;
