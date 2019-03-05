import express from 'express';
import { celebrate } from 'celebrate';
import multer from 'multer';
import { articleValidator, commentValidator, ratingValidator } from '../validators';
import { ArticleController, CommentController, RatingController } from '../../controllers';
import { verifyJwt } from '../../middlewares';
import storage from '../../config/cloudinary';
import { asyncHandler } from '../../helpers';

const router = express.Router();
const fileParser = multer({ storage });

router.post(
  '/',
  celebrate({
    body: articleValidator.createArticle
  }),
  verifyJwt(),
  fileParser.single('cover'),
  ArticleController.createArticle
);

router.get('/:slug', verifyJwt({ tokenRequired: false }), ArticleController.getArticle);
router.put(
  '/:slug',
  celebrate({
    body: articleValidator.createArticle
  }),
  verifyJwt(),
  fileParser.single('cover'),
  ArticleController.updateArticle
);

router.get(
  '/',
  celebrate({
    query: articleValidator.getArticlesQuery
  }),
  verifyJwt({ tokenRequired: false }),
  ArticleController.getArticles
);

router.delete('/:slug', verifyJwt(), ArticleController.deleteArticle);

router.post(
  '/:articleSlug/comments',
  celebrate({
    body: commentValidator.createComment
  }),
  verifyJwt(),
  CommentController.createArticleComment
);
router.get(
  '/:articleSlug/comments',
  celebrate({
    query: commentValidator.getArticleCommentsQuery
  }),
  verifyJwt(),
  CommentController.getArticleComments
);
router.route('/:articleSlug/rating')
  .post(celebrate({
    body: ratingValidator
  }), verifyJwt(), asyncHandler(RatingController.rateArticle))
  .delete(verifyJwt(), asyncHandler(RatingController.deleteArticle));

export default router;
