import { Joi } from 'celebrate';

const reportValidator = {
  report: Joi.object().keys({
    reason: Joi.string()
      .required()
      .min(3)
      .trim(),
    description: Joi.string()
      .trim()
      .min(3)
  })
};

export default reportValidator;
