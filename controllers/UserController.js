import 'dotenv/config';
import { User, Reader } from '../database/models';
import { sendEmailVerified } from './MailController';

/**
 * @description User Controller class
 */
class UserController {
  /**
   * @author Olivier
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async confirmEmail(req, res) {
    const { userId, confirmationCode } = req.params;
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ status: 404, message: 'Invalid confirmation code' });
    }
    if (user.confirmed === 'confirmed') {
      return res
        .status(401)
        .json({ status: 401, message: `${user.email} has already been confirmed` });
    }
    if (user.confirmationCode !== confirmationCode) {
      return res.status(401).json({ status: 401, message: 'Invalid confirmation code' });
    }

    await user.update({ confirmed: 'confirmed', confirmationCode: null });

    await sendEmailVerified(user.get());
    return res.json({ message: `${user.email} has been confirmed` });
  }

  /**
   * @author Chris
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async readingStats(req, res) {
    const { currentUser } = req;
    const readingStats = await Reader.count({ where: { userId: currentUser.id } });
    return res.status(200).json({ status: 200, readingStats });
  }
}

export default UserController;
