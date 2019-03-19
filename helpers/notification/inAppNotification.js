import { Notification } from '../../database/models';

export default notifications => Notification.bulkCreate(notifications);
