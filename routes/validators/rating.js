import { Joi } from 'celebrate';

const rating = Joi.object().keys({
  rate: Joi.number().required()
});
export default rating;
