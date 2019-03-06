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
    const { username } = req.params;
    const { currentUser } = req;
    if (username === currentUser.username) {
      return res.status(401).json({ status: 401, message: "You can't follow youself" });
    }
    const followee = await User.findOne({ where: { username } });
    if (!followee) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    await Follow.findOrCreate({ where: { followee: followee.id, follower: currentUser.id } });

    return res.status(201).json({ status: 201, message: `You followed ${followee.firstName}` });
  }

  /**
   * @author Manzi
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Returns the response
   */
  static async unfollow(req, res) {
    const { username } = req.params;
    const { currentUser } = req;
    if (username === currentUser.username) {
      return res.status(401).json({ status: 401, message: "You can't unfollow youself" });
    }
    const followee = await User.findOne({ where: { username } });
    if (!followee) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }
    const follow = await Follow.findOne({
      where: { followee: followee.id, follower: currentUser.id },
      include: { model: User, as: 'userFollowee' }
    });

    if (!follow) {
      return res
        .status(404)
        .json({ status: 404, message: 'The user you are trying to unfollow is not found' });
    }

    await Follow.destroy({ where: { followee: followee.id, follower: currentUser.id } });

    return res
      .status(200)
      .json({ status: 200, message: `You unfollowed ${follow.userFollowee.firstName}` });
  }
}

export default FollowController;
