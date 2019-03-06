import express from 'express';
import dotenv from 'dotenv';
<<<<<<< HEAD
import { celebrate } from 'celebrate';
=======
>>>>>>> feat(profiles): get user profiles & profiles [Finishes #163519152]
import { FollowController, ProfileController } from '../../controllers';
import { verifyJwt } from '../../middlewares';
import { profilesValidator } from '../validators';

dotenv.config();
const router = express.Router();
router.post('/:username/follow', verifyJwt(), FollowController.follow);

router.delete('/:username/follow', verifyJwt(), FollowController.unfollow);

<<<<<<< HEAD
router.get(
  '/',
  celebrate({ query: profilesValidator.getProfiles }),
  verifyJwt({ tokenRequired: false }),
  ProfileController.getProfiles
);
=======
router.get('/', ProfileController.getProfiles);
>>>>>>> feat(profiles): get user profiles & profiles [Finishes #163519152]

router.get('/:username', ProfileController.getProfile);

export default router;
