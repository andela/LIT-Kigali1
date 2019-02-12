import { Op } from 'sequelize';
import { User } from '../database/models';

/**
 * @description ProfileContoller class
 */
class ProfileController {
    /**
     * @author Daniel
     * @param {*} req 
     * @param {*} res
     * @returns{*} profile object
     */
  static async createProfile(req, res) {
      const{ user } = req.body;
      const { id } = req.body.currentUser;
      const profile = await User.findOne({
          attributes:{ exclude: ['password', 'status', 'following','userType','createdAt','updateAt']}, 
          where:{id}});
          console.log(profile);
      profile.update(user);
      return res.status(200).send({
              user: profile.get()
      })
  }
}

export default ProfileController;

