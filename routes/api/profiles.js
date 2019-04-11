import express from 'express';
import dotenv from 'dotenv';
import { celebrate } from 'celebrate';
import { FollowController, ProfileController } from '../../controllers';
import { verifyJwt } from '../../middlewares';
import { profilesValidator } from '../validators';
import asyncHandler from '../../helpers/asyncHandler';

dotenv.config();
const router = express.Router();
router.post('/:username/follow', verifyJwt(), asyncHandler(FollowController.follow));

router.delete('/:username/follow', verifyJwt(), asyncHandler(FollowController.unfollow));

router.get(
  '/',
  celebrate({ query: profilesValidator.getProfiles }),
  verifyJwt({ tokenRequired: false }),
  asyncHandler(ProfileController.getProfiles)
);

router.get(
  '/:username',
  verifyJwt({ tokenRequired: false }),
  asyncHandler(ProfileController.getProfile)
);

export default router;
