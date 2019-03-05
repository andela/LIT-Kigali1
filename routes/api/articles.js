import express from 'express';
import { celebrate } from 'celebrate';
import multer from 'multer';
<<<<<<< HEAD
import { articleValidator, commentValidator } from '../validators';
import { ArticleController, CommentController } from '../../controllers';
=======
import { articleValidator, commentValidator, ratingValidator } from '../validators';
import { ArticleController, CommentController, RatingController } from '../../controllers';
>>>>>>> feat(rating) 5 stars rating
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
  ArticleController.createArticle
);

router.get(
  '/search',
  celebrate({ query: articleValidator.getArticlesQuery }),
  verifyJwt({ tokenRequired: false }),
  ArticleController.searchArticles
);

router.get('/:slug', verifyJwt({ tokenRequired: false }), ArticleController.getArticle);
router.put(
  '/:slug',
  celebrate({ body: articleValidator.createArticle }),
  verifyJwt(),
  fileParser.single('cover'),
  ArticleController.updateArticle
);

router.get(
  '/',
  celebrate({ query: articleValidator.getArticlesQuery }),
  verifyJwt({ tokenRequired: false }),
  ArticleController.getArticles
);

router.delete('/:slug', verifyJwt(), ArticleController.deleteArticle);

router.post(
  '/:articleSlug/comments',
  celebrate({ body: commentValidator.createComment }),
  verifyJwt(),
  CommentController.createArticleComment
);
router.get(
  '/:articleSlug/comments',
  celebrate({ query: commentValidator.getArticleCommentsQuery }),
  verifyJwt(),
  CommentController.getArticleComments
);
<<<<<<< HEAD
router.post('/:slug/like', verifyJwt(), ArticleController.likeArticle);

router.post('/:slug/dislike', verifyJwt(), ArticleController.dislikeArticle);

router.post('/:slug/rating', verifyJwt(), RatingController.rateArticle);
=======
router.route('/:articleSlug/rating')
  .post(celebrate({
    body: ratingValidator
  }), verifyJwt(), asyncHandler(RatingController.rateArticle))
  .delete(verifyJwt(), asyncHandler(RatingController.deleteArticle));
>>>>>>> feat(rating) 5 stars rating

export default router;
