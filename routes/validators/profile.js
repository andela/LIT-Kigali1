import { Joi } from 'celebrate';

const getProfiles = {
  page: Joi.number()
    .integer()
    .required()
    .min(1)
};

export default { getProfiles };
