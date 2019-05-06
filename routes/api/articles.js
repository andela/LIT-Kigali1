import express from 'express';
import { celebrate } from 'celebrate';
import multer from 'multer';
import {
  articleValidator,
  commentValidator,
  ratingValidator,
  reportValidator
} from '../validators';
import {
  ArticleController,
  CommentController,
  RatingController,
  FavoriteCommentController,
  CommentOnTextController
} from '../../controllers';
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
router.get(
  '/report',
  verifyJwt({ tokenRequired: true }),
  asyncHandler(ArticleController.getArticleReports)
);

router.get('/feed', verifyJwt({ tokenRequired: true }), asyncHandler(ArticleController.getFeed));

router.get(
  '/:slug',
  verifyJwt({ tokenRequired: false }),
  asyncHandler(ArticleController.getArticle)
);

router.put(
  '/:slug',
  celebrate({ body: articleValidator.updateArticle }),
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
  verifyJwt({ tokenRequired: false }),
  asyncHandler(CommentController.getArticleComments)
);
router
  .route('/:articleSlug/rating')
  .post(
    celebrate({ body: ratingValidator }),
    verifyJwt(),
    asyncHandler(RatingController.rateArticle)
  )
  .delete(verifyJwt(), asyncHandler(RatingController.deleteRating))
  .get(asyncHandler(RatingController.getAllRating));

router.post('/:slug/like', verifyJwt(), asyncHandler(ArticleController.likeArticle));

router.post('/:slug/dislike', verifyJwt(), asyncHandler(ArticleController.dislikeArticle));

router.get(
  '/:slug/share/twitter',
  verifyJwt({ tokenRequired: false }),
  asyncHandler(ArticleController.shareArticleTwitter)
);

router.get(
  '/:slug/share/facebook',
  verifyJwt({ tokenRequired: false }),
  asyncHandler(ArticleController.shareArticleFacebook)
);

router.get(
  '/:slug/share/linkedin',
  verifyJwt({ tokenRequired: false }),
  asyncHandler(ArticleController.shareArticleLinkedin)
);

router.get(
  '/:slug/share/email',
  verifyJwt({ tokenRequired: false }),
  asyncHandler(ArticleController.shareArticleEmail)
);
router
  .route('/:articleSlug/rating')
  .post(
    celebrate({ body: ratingValidator }),
    verifyJwt(),
    asyncHandler(RatingController.rateArticle)
  )
  .delete(verifyJwt(), asyncHandler(RatingController.deleteRating))
  .get(asyncHandler(RatingController.getAllRating));

router
  .route('/:articleSlug/bookmark')
  .post(verifyJwt(), asyncHandler(ArticleController.bookmarkArticle))
  .delete(verifyJwt(), asyncHandler(ArticleController.removeFromBookmarks));

router
  .route('/:articleSlug/comments/:commentId/like')
  .post(verifyJwt(), asyncHandler(FavoriteCommentController.likeComment))
  .get(verifyJwt({ tokenRequired: false }), asyncHandler(FavoriteCommentController.getAllLikes));
router
  .route('/:articleSlug/comments/:commentId/dislike')
  .post(verifyJwt(), asyncHandler(FavoriteCommentController.dislikeComment))
  .get(verifyJwt({ tokenRequired: false }), asyncHandler(FavoriteCommentController.getAllDislikes));

router.post(
  '/:slug/report',
  verifyJwt({ tokenRequired: true }),
  celebrate({ body: reportValidator }),
  asyncHandler(ArticleController.reportArticle)
);

router.put(
  '/:articleSlug/comments/:commentId',
  celebrate({ body: commentValidator.updateComment }),
  verifyJwt(),
  asyncHandler(CommentController.updateComment)
);

router.delete(
  '/:articleSlug/comments/:commentId',
  verifyJwt(),
  asyncHandler(CommentController.deleteComment)
);
router.get(
  '/:articleSlug/comments/:commentId/edited',
  verifyJwt(),
  asyncHandler(CommentController.ViewCommentEdit)
);

router.get('/feed', verifyJwt({ tokenRequired: true }), asyncHandler(ArticleController.getFeed));

router.post(
  '/:articleSlug/comment-on-text',
  celebrate({ body: commentValidator.highlightedTextComment }),
  verifyJwt(),
  asyncHandler(CommentOnTextController.addComment)
);

router.put(
  '/:articleSlug/comment-on-text/:commentId',
  celebrate({ body: commentValidator.updateHighlightedTextComment }),
  verifyJwt(),
  asyncHandler(CommentOnTextController.updateComment)
);

router.get(
  '/:slug/likes',
  verifyJwt({ tokenRequired: false }),
  asyncHandler(ArticleController.getLikes)
);

router.get(
  '/:slug/dislikes',
  verifyJwt({ tokenRequired: false }),
  asyncHandler(ArticleController.getDislikes)
);

export default router;
