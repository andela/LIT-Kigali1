import express from 'express';
import users from './users';
import articles from './articles';
import user from './user';
import comments from './comments';

const router = express.Router();

router.use('/users', users);
router.use('/articles', articles);
router.use('/user', user);
router.use('/comments', comments);

export default router;
