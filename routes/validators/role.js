import { Joi } from 'celebrate';

const role = Joi.object().keys({
  role: Joi.string()
    .valid('admin', 'super-admin', 'user')
    .required()
});
export default role;
