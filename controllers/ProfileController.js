import { User } from '../database/models';

/**
 * @description ProfileContoller class
 */
class ProfileController {
    /**
     * @author Daniel
     * @param {*} req 
     * @param {*} res
     * @returns{*} user object
     */
  static async createProfile(req, res) {
      const{ user } = req.body;
      const { id } = req.currentUser;
      try {
      const profile = await User.findOne({
          attributes:{ exclude: ['password', 'status', 'following','userType','createdAt']}, 
          where:{id}});
      profile.update({updateAt: new Date(),...user});
      return res.status(200).send({
              user: profile.get()
      })
    } catch(error) {
        return res.status(520).send({
            errors:{
                body:[
                    error.message
                ]
            }
        })
    }
  }
}

export default ProfileController;

