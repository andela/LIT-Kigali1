import 'dotenv/config';
import { Op } from 'sequelize';
import {
  User, Article, Favorite, Follow, Tag
} from '../database/models';
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
    const { file = {}, currentUser = {} } = req;
    const { article } = req.body;
    const cover = file.url || undefined;
    const slug = slugString(article.title);
    const newArticle = await Article.create(
      {
        ...article,
        userId: currentUser.id,
        slug,
        cover
      },
      { include: [{ model: User, as: 'author' }], attributes: ['username', 'bio', 'image'] }
    );

    if (newArticle.tagList && newArticle.tagList.length > 0) {
      const tags = newArticle.tagList.map(val => ({ name: val }));
      await Tag.bulkCreate(tags, { ignoreDuplicates: true });
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
    let following = false;
    const { currentUser } = req;
    const { slug } = req.params;
    const article = await Article.findOne({
      where: {
        slug,
        status: { [Op.not]: 'deleted' }
      },
      include: [{ model: User, as: 'author', attributes: ['username', 'bio', 'image'] }]
    });
    if (
      !article
      || (article.status === 'unpublished' && currentUser && article.userId !== currentUser.id)
    ) {
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
    const favorited = favoritesCount !== 0;
    if (currentUser) {
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
    let { slug } = req.params;
    const cover = file ? file.url : undefined;
    const dbArticle = await Article.findOne({
      where: {
        slug,
        userId: currentUser.id,
        status: { [Op.not]: 'deleted' }
      }
    });
    if (!dbArticle) {
      return res.status(404).json({
        status: 404,
        message: 'Article not found'
      });
    }
    if (dbArticle.get().title !== article.title) {
      slug = slugString(article.title);
    }
    const newArticle = await dbArticle.update({
      ...article,
      userId: currentUser.id,
      slug,
      cover
    });

    return res.status(200).json({
      status: 200,
      message: 'Article updated successfully',
      article: newArticle.get()
    });
  }

  /**
   * @author Olivier
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async getArticles(req, res) {
    const {
      author,
      tag,
      favorited,
      limit = 20,
      offset: offsetQuery = 0,
      page: queryPage
    } = req.query;
    const where = { status: { [Op.not]: ['deleted', 'unpublished'] } };
    const include = [{ model: User, as: 'author', attributes: ['username', 'bio', 'image'] }];
    const offset = queryPage ? queryPage - 1 : offsetQuery;
    const page = queryPage || offset + 1;
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
    const articles = await Article.findAndCountAll({
      attributes: { exclude: ['id'] },
      include,
      where,
      offset: offset * limit,
      limit
    });
    return res.status(200).json({
      status: 200,
      articles: articles.rows,
      articlesCount: articles.count,
      pages: Math.ceil(articles.count / limit),
      page
    });
  }

  /**
   * @author Olivier
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async deleteArticle(req, res) {
    const { currentUser = {} } = req;
    const { slug } = req.params;
    const article = await Article.findOne({ where: { slug } });

    if (!article) {
      return res.status(404).json({ status: 404, message: 'Article not found' });
    }

    if (article.userId !== currentUser.id) {
      return res.status(401).json({ status: 401, message: 'Unauthorized access' });
    }

    await article.update({ status: 'deleted' });

    return res.status(200).json({
      status: 200,
      message: 'Article deleted successfully'
    });
  }

  /**
   * @author Chris
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async likeArticle(req, res) {
    const { slug } = req.params;
    const { currentUser } = req;

    const article = await Article.findOne({ where: { slug } });

    if (!article) {
      return res.status(404).json({ status: 404, message: 'Article not found' });
    }
    const liked = await Favorite.findOne({
      where: {
        userId: currentUser.id,
        articleId: article.id
      }
    });
    if (liked && liked.state === 'dislike') {
      await liked.update({ state: 'like' });
      return res.status(200).json({ status: 200, message: 'Liked', article });
    }
    if (liked && liked.state === 'like') {
      await liked.destroy();
      return res.status(200).json({ status: 200, message: 'Like Removed successfully', article });
    }
    await Favorite.create({
      userId: currentUser.id,
      articleId: article.id,
      state: 'like'
    });
    return res.status(201).json({ status: 201, message: 'Liked', article });
  }

  /**
   * @author Chris
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async dislikeArticle(req, res) {
    const { slug } = req.params;
    const { currentUser } = req;

    const article = await Article.findOne({ where: { slug } });

    if (!article) {
      return res.status(404).json({ status: 404, message: 'Article not found' });
    }
    const liked = await Favorite.findOne({
      where: {
        userId: currentUser.id,
        articleId: article.id
      }
    });
    if (liked && liked.state === 'like') {
      await liked.update({ state: 'dislike' });
      return res.status(200).json({ status: 200, message: 'Disliked', article });
    }
    if (liked && liked.state === 'dislike') {
      await liked.destroy();
      return res
        .status(200)
        .json({ status: 200, message: 'Dislike Removed successfully', article });
    }

    await Favorite.create({
      userId: currentUser.id,
      articleId: article.id,
      state: 'dislike'
    });
    return res.status(200).json({ status: 200, message: 'Disliked', article });
  }
}

export default ArticleController;
