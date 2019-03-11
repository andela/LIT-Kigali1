import express from 'express';
import dotenv from 'dotenv';
import { FollowController, ProfileController } from '../../controllers';
import { verifyJwt } from '../../middlewares';

dotenv.config();
const router = express.Router();
router.post('/:username/follow', verifyJwt(), FollowController.follow);

router.delete('/:username/follow', verifyJwt(), FollowController.unfollow);

<<<<<<< HEAD
router.get('/', verifyJwt({ tokenRequired: false }), ProfileController.getProfiles);
=======
router.get('/', ProfileController.getProfiles);
>>>>>>> 98fd816df5cc5a47756815bef219726f39bb574f

router.get('/:username', ProfileController.getProfile);

export default router;
