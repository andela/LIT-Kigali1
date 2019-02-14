import 'dotenv/config';
import passport from 'passport';
import { User, Article } from '../database/models';

/**
 * @description Article Controller class
 */
class ArticleController {
  /**
   * @author Olivier
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async createArticle(req, res) {
    // const { file } = req;
    const { article } = req.body;
    let newArticle;
    // file.url;
    // file.public_id;
    try {
      const user = await User.findOne({});
      newArticle = await Article.create({ ...article, userId: user.id });
    } catch (error) {
      return res.status(401).json({ status: 401, message: 'Please try again' });
    }

    return res.status(201).json({
      status: 201,
      message: 'Article created successfully',
      article: newArticle.get()
    });
  }
}
export default ArticleController;
