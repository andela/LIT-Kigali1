import express from 'express';
import dotenv from 'dotenv';
import { FollowController } from '../../controllers';
import { verifyJwt } from '../../middlewares';

dotenv.config();
const router = express.Router();
router.post('/:username/follow', verifyJwt(), FollowController.follow);

router.delete('/:username/follow', verifyJwt(), FollowController.unfollow);

export default router;
