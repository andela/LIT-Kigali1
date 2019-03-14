import { User } from '../database/models';

/**
 * @description a class to grant roles to users
 */
class grantRoleController {
  /**
   * @author Daniel
   * @param {*} req
   * @param {*} res
   * @returns {*} object
   */
  static async assignRole(req, res) {
    const { username } = req.params;
    const { currentUser } = req;
    const { role } = req.body;
    if (currentUser.userType !== 'super-admin' && currentUser.userType !== 'admin') {
      return res.status(401).send({
        status: 401,
        message: 'Not authorized'
      });
    }
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).send({
        status: 404,
        message: 'User not found'
      });
    }
    if (user.userType === role) {
      return res.status(409).send({
        status: 409,
        message: `already ${role === 'admin' ? 'an' : 'a'} ${role}`
      });
    }
    user.update({ userType: role });
    const { password, confirmationCode, ...userData } = user.get();
    return res.status(200).send({
      status: 200,
      message: `${role} role granted`,
      user: userData
    });
  }
}

export default grantRoleController;
