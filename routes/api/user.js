import express from 'express';
import { celebrate } from 'celebrate';
import { ProfileController } from '../../controllers';
import { profileValidator } from '../validators';
import { verifyJwt } from '../../middlewares';


const router = express.Router();

router.put('/', verifyJwt, 
  celebrate({ body: profileValidator }),
  ProfileController.createProfile);


export default router;
