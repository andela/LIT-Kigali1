import express from 'express';
import { NotificationController } from '../../controllers';
import { verifyJwt } from '../../middlewares';
import { asyncHandler } from '../../helpers';

const router = express.Router();

router.get('/', verifyJwt(), asyncHandler(NotificationController.getNotifications));
router.get('/:notificationId', verifyJwt(), asyncHandler(NotificationController.getNotification));
router.put('/', verifyJwt(), asyncHandler(NotificationController.markAllAsRead));
router.put('/enable', verifyJwt(), asyncHandler(NotificationController.enableNotification));
router.put('/disable', verifyJwt(), asyncHandler(NotificationController.disableNotification));

export default router;
