import { Joi } from 'celebrate';

const rating = Joi.object().keys({
<<<<<<< HEAD
  rate: Joi.number().min(1).max(5).required()
=======
  rate: Joi.number().required()
>>>>>>> feat(rating) 5 stars rating
});
export default rating;
