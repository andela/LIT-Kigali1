import { Joi } from 'celebrate';

const createComment = {
  comment: Joi.object()
    .keys({
      parentId: Joi.string().trim(),
      body: Joi.string()
        .required()
        .trim()
        .min(3)
        .max(255)
    })
    .required()
};

const updateComment = {
  comment: Joi.object()
    .keys({
      body: Joi.string()
        .required()
        .trim()
        .min(3)
        .max(255)
    })
    .required()
};

const getArticleCommentsQuery = { page: Joi.number().min(1) };

export default {
  createComment,
  updateComment,
  getArticleCommentsQuery
};
