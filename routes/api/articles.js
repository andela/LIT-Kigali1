import express from 'express';
import { celebrate } from 'celebrate';
import multer from 'multer';
import { articleValidator } from '../validators';
import { ArticleController } from '../../controllers';
import { verifyJwt } from '../../middlewares';
import storage from '../../config/cloudinary';

const router = express.Router();
const fileParser = multer({ storage });

router.post(
  '/',
  celebrate({
    body: articleValidator.createArticle
  }),
  fileParser.array('images'),
  ArticleController.createArticle
);
router.get('/:slug', verifyJwt({ tokenRequired: false }), ArticleController.getArticle);

export default router;
