import { Joi } from 'celebrate';

const getProfiles = {
  page: Joi.number()
    .integer()
    .min(1)
};

export default { getProfiles };
