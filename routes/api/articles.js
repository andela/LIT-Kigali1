import express from 'express';
import { celebrate } from 'celebrate';
import multer from 'multer';
import { articleValidator } from '../validators';
import { ArticleController } from '../../controllers';
import storage from '../../config/cloudinary';
import { verifyJwt } from '../../middlewares';

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

export default router;
