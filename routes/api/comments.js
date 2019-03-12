import express from 'express';
import { celebrate } from 'celebrate';
import { commentValidator } from '../validators';
import { CommentController } from '../../controllers';
import { verifyJwt } from '../../middlewares';
import { asyncHandler } from '../../helpers';

const router = express.Router();

router.put(
  '/:commentId',
  celebrate({ body: commentValidator.updateComment }),
  verifyJwt(),
  asyncHandler(CommentController.updateComment)
);

router.delete(
'/:commentId', verifyJwt(), asyncHandler(CommentController.deleteComment)
);

export default router;
