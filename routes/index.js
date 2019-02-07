import express from 'express';
import '../middlewares/passportStrategies';
import api from './api/index';

const router = express.Router();

router.use('/api/v1', api);

export default router;
