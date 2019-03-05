import { Follow, User } from '../database/models';

/**
 * @description Followers controller class
 */
class FollowController {
  /**
   * @author Manzi
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Returns the response
   */
  static async follow(req, res) {
    const { id } = req.params;
    const { currentUser } = req;
    if (id === currentUser.id) {
      return res.status(401).json({ message: "You can't follow youself" });
    }
    const followee = await User.findOne({ where: { id } });
    if (!followee) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    await Follow.findOrCreate({
      where: { followee: id, follower: currentUser.id }
    });

    return res.status(201).json({ status: '201', message: `You followed ${followee.firstName}` });
  }

  /**
   * @author Manzi
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Returns the response
   */
  static async unfollow(req, res) {
    const { id } = req.params;
    const { currentUser } = req;
    if (id === currentUser.id) {
      return res.status(401).json({ message: "You can't unfollow youself" });
    }
    const follow = await Follow.findOne({
      where: { followee: id, follower: currentUser.id },
      include: { model: User, as: 'userFollowee' }
    });
    if (!follow) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    await Follow.destroy({
      where: { followee: id, follower: currentUser.id }
    });

    return res
      .status(200)
      .json({ status: '200', message: `You unfollowed ${follow.userFollowee.firstName}` });
  }
}

export default FollowController;
