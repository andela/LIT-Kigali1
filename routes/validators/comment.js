import { Joi } from 'celebrate';

const createComment = {
  comment: Joi.object()
    .keys({
      parentId: Joi.string().trim(),
      body: Joi.string()
        .required()
        .trim()
    })
    .required()
};

const updateComment = {
  comment: Joi.object()
    .keys({
      body: Joi.string()
        .required()
        .trim()
    })
    .required()
};

const getArticleCommentsQuery = { page: Joi.number().min(1) };

const highlightedTextComment = {
  comment: Joi.object()
    .keys({
      parentId: Joi.string().trim(),
      body: Joi.string()
        .required()
        .trim(),
      highlightedText: Joi.string().required(),
      startPoint: Joi.number().required(),
      endPoint: Joi.number().required()
    })
    .required()
};

const updateHighlightedTextComment = {
  comment: Joi.object()
    .keys({
      parentId: Joi.string().trim(),
      body: Joi.string()
        .trim(),
      highlightedText: Joi.string(),
      startPoint: Joi.number().min(0),
      endPoint: Joi.number().min(0)
    })
    .required()
};

export default {
  createComment,
  updateComment,
  getArticleCommentsQuery,
  highlightedTextComment,
  updateHighlightedTextComment
};
