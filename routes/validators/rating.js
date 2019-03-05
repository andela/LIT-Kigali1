import { Joi } from 'celebrate';

const rating = Joi.object().keys({
  rate: Joi.number().min(1).max(5).required()
});
export default rating;
