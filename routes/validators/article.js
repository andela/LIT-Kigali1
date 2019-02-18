import { Joi } from 'celebrate';

const createArticle = {
  article: Joi.object()
    .keys({
      title: Joi.string()
        .required()
        .trim(),
      body: Joi.string()
        .required()
        .min(50),
      description: Joi.string()
        .required()
        .trim(),
      tagList: Joi.array()
        .max(5)
        .items(Joi.string().trim()),
      status: Joi.string()
        .trim()
        .valid(['unpublished', 'published'])
    })
    .required(),
  cover: Joi.any()
};

const getArticlesQuery = {
  tag: Joi.string().trim(),
  author: Joi.string().trim(),
  limit: Joi.number()
    .min(1)
    .max(25),
  offset: Joi.number().min(0),
  page: Joi.number().min(1),
  favorited: Joi.string()
};

export default {
  createArticle,
  getArticlesQuery
};
