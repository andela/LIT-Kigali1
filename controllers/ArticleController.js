import 'dotenv/config';
// import passport from 'passport';
import { User, Article, Favorite, Follow } from '../database/models';

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

  /**
   * @author Chris
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async getArticle(req, res) {
    let favorited;
    let following = false;
    const { slug } = req.params;
    try {
      const article = await Article.findOne({
        where: {
          slug
        },
        include: [{ model: User, as: 'author', attributes: ['username', 'bio', 'image'] }]
      });
      if (!article) {
        return res.status(404).json({
          message: 'Article not found'
        });
      }
      const favoritesCount = await Favorite.count({
        where: {
          articleId: article.get().id
        }
      });
      favorited = favoritesCount !== 0;
      if (req.currentUser) {
        const followingCount = await Follow.count({ where: { follower: req.currentUser.id } });
        following = followingCount !== 0;
      }
      return res.status(200).json({
        article: {
          ...article.get(),
          author: { ...article.get().author.get(), following },
          favorited,
          favoritesCount
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(409).json({ message: 'Failed!! Try again' });
    }
  }
}
export default ArticleController;
