import express from 'express';
import '../middlewares/passportStrategies';

const router = express.Router();

router.use('/api/v1', require('./api'));

export default router;