import express from 'express';
import { celebrate } from 'celebrate';
import multer from 'multer';
import { articleValidator, commentValidator } from '../validators';
import { ArticleController, CommentController } from '../../controllers';
import { verifyJwt } from '../../middlewares';
import storage from '../../config/cloudinary';

const router = express.Router();
const fileParser = multer({ storage });

router.post(
  '/',
  celebrate({ body: articleValidator.createArticle }),
  verifyJwt(),
  fileParser.single('cover'),
  ArticleController.createArticle
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
  celebrate({body: commentValidator.createComment}),
  verifyJwt(),
  CommentController.createArticleComment
);
router.get(
  '/:articleSlug/comments',
  celebrate({query: commentValidator.getArticleCommentsQuery}),
  verifyJwt(),
  CommentController.getArticleComments
);
router.post('/:slug/like', verifyJwt(), ArticleController.likeArticle);

router.post('/:slug/dislike', verifyJwt(), ArticleController.dislikeArticle);

export default router;
