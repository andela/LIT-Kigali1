import 'dotenv/config';
import { Op } from 'sequelize';
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
          slug,
          status: { [Op.not]: 'deleted' }
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
      return res.status(409).json({ message: 'Failed!! Try again' });
    }
  }

  /**
   * @author Olivier
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async getArticles(req, res) {
    const { author, tag, favorited, limit = 20, offset = 0 } = req.query;
    const where = { status: { [Op.not]: 'deleted' } };
    const include = [{ model: User, as: 'author', attributes: ['username', 'bio', 'image'] }];

    if (tag) {
      where.tagList = { [Op.contains]: [tag] };
    }
    if (author) {
      include[0].where = { [Op.and]: [{ username: author }] };
    }
    if (favorited) {
      include[0].where = include[0].where
        ? include[0].where[Op.and].push({ username: favorited })
        : { [Op.and]: [{ username: favorited }] };
    }
    try {
      const articles = await Article.findAndCountAll({
        attributes: { exclude: ['id'] },
        include,
        where,
        offset,
        limit
      });
      if (!articles) {
        return res.status(404).json({
          status: 404,
          message: 'Articles not found'
        });
      }
      return res.status(200).json({
        status: 200,
        articles: articles.rows,
        articlesCount: articles.count,
        pages: articles.count / limit
      });
    } catch (error) {
      return res.status(409).json({ message: 'Failed!! Try again' });
    }
  }

  /**
   * @author Olivier
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async deleteArticle(req, res) {
    const { currentUser } = req;
    const { slug } = req.params;
    try {
      if (!currentUser) {
        return res.status(401).json({ status: 401, message: 'Unauthorized access' });
      }
      const article = await Article.findOne({ where: { slug } });

      if (!article) {
        return res.status(404).json({ status: 404, message: 'Article not found' });
      }

      if (article.userId !== currentUser.id) {
        return res.status(401).json({ status: 401, message: 'Unauthorized access' });
      }

      await article.update({ status: 'deleted' });
    } catch (error) {
      return res.status(409).json({ status: 409, message: 'Please try again' });
    }

    return res.status(200).json({
      status: 200,
      message: 'Article deleted successfully'
    });
  }
}
export default ArticleController;
