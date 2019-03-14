import { Notification, User } from '../database/models';

/**
 * @description Notification Controller class
 */
class NotificationController {
  /**
   * @author Caleb
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async getNotifications(req, res) {
    const { currentUser } = req;
    const { page = 1 } = req.query;
    const limit = 25;

    const notifications = await Notification.findAndCountAll({
      where: { userId: currentUser.id, status: 'unread' },
      attributes: ['id', 'userId', 'notification', 'link'],
      offset: (page - 1) * limit,
      limit
    });

    if (notifications.count === 0) {
      return res
        .status(404)
        .json({ status: 404, message: "You don't have any unread notification" });
    }
    if (notifications) {
      return res.status(200).json({ status: 200, notification: notifications });
    }
  }

  /**
   * @author Caleb
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async getNotification(req, res) {
    const { currentUser } = req;
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: { userId: currentUser.id, id: notificationId, status: 'unread' },
      attributes: ['id', 'userId', 'notification', 'link']
    });

    if (!notification) {
      return res.status(404).json({ status: 404, message: 'Notification not found' });
    }
    await Notification.update(
      { status: 'read' },
      { where: { userId: currentUser.id, id: notificationId } }
    );
    return res.status(200).json({ status: 200, notification });
  }

  /**
   * @author Caleb
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async markAllAsRead(req, res) {
    const { currentUser } = req;

    const notification = await Notification.findOne({
      where: { userId: currentUser.id, status: 'unread' },
      attributes: ['id', 'userId', 'notification', 'link']
    });

    if (!notification) {
      return res
        .status(404)
        .json({ status: 404, message: "You don't have any unread notification" });
    }
    await Notification.update({ status: 'read' }, { where: { userId: currentUser.id } });
    return res.status(200).json({ status: 200, message: 'All notification marked as read' });
  }

  /**
   * @author Caleb
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async enableNotification(req, res) {
    const { currentUser } = req;

    const updateUser = await User.findOne({where: { id: currentUser.id, notification: 'disabled' }});

    if (!updateUser) {
      return res.status(400).json({ status: 400, message: 'Notifications are already enabled' });
    }
    await updateUser.update({ notification: 'enabled' });
    return res.status(201).json({ status: 201, message: 'Notifications enabled' });
  }

  /**
   * @author Caleb
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async disableNotification(req, res) {
    const { currentUser } = req;

    const updateUser = await User.findOne({where: { id: currentUser.id, notification: 'enabled' }});

    if (!updateUser) {
      return res.status(400).json({ status: 400, message: 'Notifications are already disabled' });
    }
    await updateUser.update({ notification: 'disabled' });
    return res.status(201).json({ status: 201, message: 'Notifications disabled' });
  }
}
export default NotificationController;
