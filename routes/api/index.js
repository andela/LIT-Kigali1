import express from 'express';
import users from './users';
import articles from './articles';

const router = express.Router();

router.use('/users', users);
router.use('/articles', articles);

export default router;
