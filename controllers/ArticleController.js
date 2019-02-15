import 'dotenv/config';
import { User, Article, Favorite, Follow, Tag } from '../database/models';
import { slugString } from '../helpers';

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
    const { file, currentUser } = req;
    const { article } = req.body;
    let newArticle;
    const cover = file ? file.url : undefined;
    try {
      if (!currentUser) {
        return res.status(401).json({ status: 401, message: 'Unauthorized access' });
      }
      const slug = slugString(article.title);
      newArticle = await Article.create({ ...article, userId: currentUser.id, slug, cover });

      if (newArticle.tagList.length > 0) {
        const tags = newArticle.tagList.map(val => ({ name: val }));
        await Tag.bulkCreate(tags, { ignoreDuplicates: true });
      }
    } catch (error) {
      return res.status(409).json({ status: 409, message: 'Please try again' });
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
          status: 404,
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
      return res.status(409).json({ status: 409, message: 'Failed!! Try again' });
    }
  }

  /**
   * @author Chris
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async updateArticle(req, res) {
    const { file, currentUser } = req;
    const { article } = req.body;
    let newArticle;
    let { slug } = req.params;
    const cover = file ? file.url : undefined;
    try {
      if (!currentUser) {
        return res.status(401).json({ status: 401, message: 'Unauthorized access' });
      }
      const dbArticle = await Article.findOne({
        where: {
          slug,
          userId: currentUser.id
        }
      });
      if (dbArticle.get().title !== article.title) {
        slug = slugString(article.title);
      }
      newArticle = await dbArticle.update({
        ...article,
        userId: currentUser.id,
        slug,
        cover
      });
    } catch (error) {
      return res.status(409).json({ status: 409, message: 'Please try again' });
    }

    return res.status(201).json({
      status: 200,
      message: 'Article updated successfully',
      article: newArticle.get()
    });
  }
}
export default ArticleController;
