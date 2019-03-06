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
  celebrate({ body: articleValidator.createArticle }),
  verifyJwt(),
  fileParser.single('cover'),
  asyncHandler(ArticleController.createArticle)
);

router.get(
  '/search',
  celebrate({ query: articleValidator.getArticlesQuery }),
  verifyJwt({ tokenRequired: false }),
  asyncHandler(ArticleController.searchArticles)
);

router.get('/:slug', verifyJwt({ tokenRequired: false }), asyncHandler(ArticleController.getArticle));
router.put(
  '/:slug',
  celebrate({ body: articleValidator.createArticle }),
  verifyJwt(),
  fileParser.single('cover'),
  asyncHandler(ArticleController.updateArticle)
);

router.get(
  '/',
  celebrate({ query: articleValidator.getArticlesQuery }),
  verifyJwt({ tokenRequired: false }),
  asyncHandler(ArticleController.getArticles)
);

router.delete('/:slug', verifyJwt(), ArticleController.deleteArticle);

router.post(
  '/:articleSlug/comments',
  celebrate({ body: commentValidator.createComment }),
  verifyJwt(),
  asyncHandler(CommentController.createArticleComment)
);
router.get(
  '/:articleSlug/comments',
  celebrate({ query: commentValidator.getArticleCommentsQuery }),
  verifyJwt(),
  asyncHandler(CommentController.getArticleComments)
);

router.post('/:slug/like', verifyJwt(), asyncHandler(ArticleController.likeArticle));

router.post('/:slug/dislike', verifyJwt(), asyncHandler(ArticleController.dislikeArticle));

router.route('/:articleSlug/rating')
  .post(
    celebrate({ body: ratingValidator }),
    verifyJwt(), asyncHandler(RatingController.rateArticle)
  )
  .delete(verifyJwt(), asyncHandler(RatingController.deleteRating))
  .get(asyncHandler(RatingController.getAllRating));

export default router;
