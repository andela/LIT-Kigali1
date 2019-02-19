import express from 'express';
import users from './users';
import user from './user';

const router = express.Router();

router.use('/users', users);
router.use('/user', user);
export default router;
