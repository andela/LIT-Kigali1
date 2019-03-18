import 'dotenv/config';
import opn from 'opn';
import { Op } from 'sequelize';
import { User, Article, Favorite, Follow, Tag, Bookmark } from '../database/models';
import { slugString, getReadingTime, calculateRating } from '../helpers';

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
    const readingTime = getReadingTime(article.body);
    const newArticle = await Article.create(
      {
        ...article,
        userId: currentUser.id,
        slug,
        cover,
        readingTime
      },
      {
        include: [{ model: User, as: 'author' }],
        attributes: ['username', 'firstName', 'lastName', 'image']
      }
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
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username', 'firstName', 'lastName', 'image']
        }
      ]
    });
    if (
      !article ||
      (article.status === 'unpublished' && currentUser && article.userId !== currentUser.id)
    ) {
      return res.status(404).json({
        status: 404,
        message: 'Article not found'
      });
    }
    const favoritesCount = await Favorite.count({ where: { articleId: article.get().id } });
    const favorited = favoritesCount !== 0;
    if (currentUser) {
      const followingCount = await Follow.count({ where: { follower: req.currentUser.id } });
      following = followingCount !== 0;
    }
    return res.status(200).json({
      article: {
        ...article.get(),
        rating: await calculateRating(article.get().id),
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
    const readingTime = getReadingTime(article.body);
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
      cover,
      readingTime
    });

    return res.status(200).json({
      status: 200,
      message: 'Article updated successfully',
      article: {
        ...newArticle.get(),
        rating: await calculateRating(newArticle.id)
      }
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
    const include = [
      { model: User, as: 'author', attributes: ['username', 'firstName', 'lastName', 'image'] }
    ];
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
    const ratedArticles = async articleArray =>
      Promise.all(
        articleArray.map(async art => ({
          userId: art.userId,
          slug: art.slug,
          title: art.title,
          description: art.description,
          body: art.body,
          tagList: art.tagList,
          status: art.status,
          cover: art.cover,
          createdAt: art.createdAt,
          updatedAt: art.updatedAt,
          author: art.author,
          rating: await calculateRating(null, art.slug)
        }))
      );
    return res.status(200).json({
      status: 200,
      articles: await ratedArticles(articles.rows),
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

    const article = await Article.findOne({ where: { slug, status: 'published' } });
    if (!article) {
      return res.status(404).json({ status: 404, message: 'Article not found' });
    }
    const liked = await Favorite.findOne({
      where: {
        userId: currentUser.id,
        articleId: article.id
      }
    });
    if (liked && (liked.state === 'dislike' || liked.state === null)) {
      await liked.update({ state: 'like' });
      return res.status(200).json({ status: 200, message: 'Liked', article });
    }
    if (liked && liked.state === 'like') {
      await liked.update({ state: null });
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

    const article = await Article.findOne({ where: { slug, status: 'published' } });

    if (!article) {
      return res.status(404).json({ status: 404, message: 'Article not found' });
    }
    const liked = await Favorite.findOne({
      where: {
        userId: currentUser.id,
        articleId: article.id
      }
    });
    if (liked && (liked.state === 'like' || liked.state === null)) {
      await liked.update({ state: 'dislike' });
      return res.status(200).json({ status: 200, message: 'Disliked', article });
    }
    if (liked && liked.state === 'dislike') {
      await liked.update({ state: null });
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

  /**
   * @author Chris
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async searchArticles(req, res) {
    const { title, author, tag, page = 1 } = req.query;
    const limit = 20;
    const offset = limit * (page - 1);
    let pages = 0;
    const where = { status: { [Op.not]: ['deleted', 'unpublished'] } };
    const include = [
      {
        model: User,
        as: 'author',
        attributes: ['username', 'firstName', 'lastName', 'image']
      }
    ];
    if (title) {
      where.title = { [Op.iLike]: `%${title}%` };
    }
    if (author) {
      include[0].where = {
        [Op.and]: {
          [Op.or]: [
            { username: { [Op.iLike]: `%${author}%` } },
            { firstName: { [Op.iLike]: `%${author}%` } },
            { lastName: { [Op.iLike]: `%${author}%` } }
          ]
        }
      };
    }
    if (tag) {
      where.tagList = { [Op.contains]: [tag] };
    }
    const articles = await Article.findAndCountAll({
      where,
      include,
      limit,
      offset
    });
    pages = Math.ceil(articles.count / limit);
    if (articles.count <= 0) {
      return res.status(404).json({ status: 404, message: 'Not found' });
    }
    return res.status(200).json({ status: 200, articles: { ...articles, pages } });
  }

  /**
   * @author Caleb
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async shareArticleTwitter(req, res) {
    const { slug } = req.params;
    const article = await Article.findOne({
      where: {
        slug,
        status: { [Op.not]: 'deleted' }
      }
    });
    if (!article || article.status === 'unpublished') {
      return res.status(404).json({
        status: 404,
        message: 'Article not found'
      });
    }
    opn(`https://twitter.com/intent/tweet?text=${process.env.FRONTEND_URL}/articles/${slug}`);
    return res.status(200).json({ status: 200, message: 'Sharing article via Twitter' });
  }

  /**
   * @author Caleb
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async shareArticleFacebook(req, res) {
    const { slug } = req.params;
    const article = await Article.findOne({
      where: {
        slug,
        status: { [Op.not]: 'deleted' }
      }
    });
    if (!article || article.status === 'unpublished') {
      return res.status(404).json({
        status: 404,
        message: 'Article not found'
      });
    }
    opn(
      `https://www.facebook.com/sharer/sharer.php?&u=https://lit-kigali1-staging.herokuapp.com/api/v1/article/${slug}`
    );
    return res.status(200).json({ status: 200, message: 'Sharing article via Facebook' });
  }

  /**
   * @author Caleb
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async shareArticleLinkedin(req, res) {
    const { slug } = req.params;
    const article = await Article.findOne({
      where: {
        slug,
        status: { [Op.not]: 'deleted' }
      }
    });
    if (!article || article.status === 'unpublished') {
      return res.status(404).json({
        status: 404,
        message: 'Article not found'
      });
    }
    opn(
      `https://www.linkedin.com/sharing/share-offsite/?url=${
        process.env.FRONTEND_URL
      }/articles/${slug}`
    );
    return res.status(200).json({ status: 200, message: 'Sharing article via Linkedin' });
  }

  /**
   * @author Caleb
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async shareArticleEmail(req, res) {
    const { slug } = req.params;
    const article = await Article.findOne({
      where: {
        slug,
        status: { [Op.not]: 'deleted' }
      }
    });
    if (!article || article.status === 'unpublished') {
      return res.status(404).json({
        status: 404,
        message: 'Article not found'
      });
    }
    opn(`mailto:?subject=${article.title}&body=${process.env.FRONTEND_URL}/article/${slug}`);
    return res.status(200).json({ status: 200, message: 'Sharing article via Email' });
  }

  /**
   *
   * @author Manzi
   * @param {*} req
   * @param {*} res
   * @returns {Object} Returns a response
   */
  static async bookmarkArticle(req, res) {
    const { articleSlug } = req.params;
    const { id } = req.currentUser;
    const article = await Article.findOne({
      where: { slug: articleSlug, status: { [Op.not]: 'deleted', [Op.not]: 'unpublished' } }
    });
    if (!article) {
      return res
        .status(404)
        .json({ status: 404, message: `The article with slug ${articleSlug} does not exist` });
    }
    await Bookmark.findOrCreate({ where: { userId: id, articleId: article.id } });

    return res.status(201).json({ status: 201, message: `${article.title} is bookmarked` });
  }

  /**
   * @author Manzi
   * @param {*} req
   * @param {*} res
   * @returns {Object} Returns a response
   */
  static async removeFromBookmarks(req, res) {
    const { articleSlug } = req.params;
    const { id } = req.currentUser;
    const article = await Article.findOne({
      where: { slug: articleSlug, status: { [Op.not]: 'deleted', [Op.not]: 'unpublished' } }
    });
    if (!article) {
      return res
        .status(404)
        .json({ status: 404, message: `The article with slug ${articleSlug} does not exist` });
    }
    const bookmark = await Bookmark.findOne({ where: { userId: id, articleId: article.id } });

    if (!bookmark) {
      res.status(404).json({ status: 404, message: 'The bookmark does not exist' });
    }

    await Bookmark.destroy({ where: { userId: id, articleId: article.id } });

    return res
      .status(200)
      .json({ status: 200, message: `${article.title} was removed from bookmarks` });
  }
}

export default ArticleController;
