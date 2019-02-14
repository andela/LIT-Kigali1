import { Joi } from 'celebrate';

const createArticle = {
  article: Joi.object().keys({
    title: Joi.string()
      .required()
      .trim(),
    body: Joi.string()
      .required()
      .min(50),
    description: Joi.string()
      .required()
      .trim(),
    tagList: Joi.array().max(5),
    images: Joi.array()
  })
};

export default {
  createArticle
};
