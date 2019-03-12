import express from 'express';
import dotenv from 'dotenv';
import { celebrate } from 'celebrate';
import { FollowController, ProfileController } from '../../controllers';
import { verifyJwt } from '../../middlewares';
import { profilesValidator } from '../validators';

dotenv.config();
const router = express.Router();
router.post('/:username/follow', verifyJwt(), FollowController.follow);

router.delete('/:username/follow', verifyJwt(), FollowController.unfollow);

router.get('/', verifyJwt({ tokenRequired: false }), ProfileController.getProfiles);

router.get('/:username', ProfileController.getProfile);

export default router;
