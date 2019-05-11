import 'dotenv/config';
import opn from 'opn';
import sequelize, { Op } from 'sequelize';
import { User, Article, Favorite, Follow, Tag, Report, Bookmark, Reader } from '../database/models';
import { slugString, getReadingTime, calculateRating } from '../helpers';
import newArticleNotification from '../helpers/notification/newArticleNotification';
import newInteractionNotification from '../helpers/notification/newInteractionNotification';

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
    const { currentUser } = req;
    const { article } = req.body;
    const slug = slugString(article.title);
    const readingTime = getReadingTime(article.body);
    const newArticle = await Article.create(
      {
        ...article,
        userId: currentUser.id,
        slug,
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
    await newArticleNotification(await newArticle.getAuthor(), newArticle.slug, newArticle.title);
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
    const favoritesCount = await Favorite.count({
      where: { articleId: article.get().id, state: 'like' }
    });
    const favorited = favoritesCount !== 0;
    if (currentUser) {
      const followingCount = await Follow.count({ where: { follower: req.currentUser.id } });
      following = followingCount !== 0;
      if (currentUser.username !== article.author.username) {
        const reader = await Reader.findOne({
          where: { articleId: article.id, userId: currentUser.id }
        });
        if (!reader) {
          await Reader.create({ articleId: article.id, userId: currentUser.id });
        }
      }
    }
    if (!currentUser) {
      await Reader.create({ articleId: article.id });
    }
    const views = await Reader.count({ where: { articleId: article.id } });
    const rated = await Favorite.findOne({
      where: { articleId: article.id, userId: currentUser ? currentUser.id : null }
    });
    return res.status(200).json({
      status: 200,
      article: {
        ...article.get(),
        rating: await calculateRating(article.get().id),
        rated: rated ? rated.rating : 0,
        author: { ...article.get().author.get(), following },
        favorited,
        favoritesCount,
        views
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
    const { currentUser } = req;
    const { article } = req.body;
    let { slug } = req.params;
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
      if (article.title && (dbArticle.get().title !== article.title)) {
        slug = slugString(article.title);
      }
   
    const newArticle = await dbArticle.update({
      ...article,
      userId: currentUser.id,
      readingTime,
      slug
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
      title,
      author,
      tag,
      favorited,
      limit = 4,
      offset: offsetQuery = 0,
      page: queryPage
    } = req.query;
    const group = ['Article.id'];
    const where = { status: { [Op.not]: ['deleted', 'unpublished'] } };
    const include = [
      { model: User, as: 'author', attributes: ['username', 'firstName', 'lastName', 'image'] },
      { model: Reader, as: 'views', attributes: [] },
      {
        model: Favorite,
        as: 'favorites',
        attributes: [],
        include: [{ model: User, as: 'authorFavorites', attributes: [] }]
      }
    ];
    const offset = queryPage ? queryPage - 1 : offsetQuery;
    const page = queryPage || offset + 1;
    if (title) {
      where.title = { [Op.iLike]: `%${title}%` };
    }
    if (tag) {
      where.tagList = { [Op.contains]: [tag] };
    }
    if (author) {
      include[0].where = { [Op.and]: [{ username: { [Op.iLike]: `%${author}%` } }] };
      group.push('author.id');
    }
    if (favorited) {
      include[2].include[0].where = { [Op.and]: [{ username: favorited }] };
    }
    const articles = await Article.findAndCountAll({
      attributes: [
        'id',
        'cover',
        'title',
        'slug',
        'body',
        'userId',
        'description',
        'readingTime',
        'createdAt',
        'updatedAt',
        'tagList',
        [sequelize.fn('COUNT', 'views.id'), 'viewsCount'],
        [sequelize.fn('COUNT', 'favorites.id'), 'rating']
      ],
      group,
      include,
      where,
      offset: offset * limit,
      limit
    });

    return res.status(200).json({
      status: 200,
      articles: articles.rows,
      articlesCount: articles.count.length,
      pages: Math.ceil(articles.count.length / limit),
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
    const { currentUser } = req;
    const { slug } = req.params;
    const article = await Article.findOne({ where: { slug } });

    if (!article) {
      return res.status(404).json({ status: 404, message: 'Article not found' });
    }

    if (article.userId !== currentUser.id) {
      return res.status(401).json({ status: 401, message: 'Unauthorized access' });
    }
    if (article.userId === currentUser.id || currentUser.userType === 'admin') {
      await article.update({ status: 'deleted' });

      return res.status(200).json({
        status: 200,
        message: 'Article deleted successfully'
      });
    }
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

    await newInteractionNotification(article.id, currentUser, article.title, article.slug);

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
      return res.status(404).json({ status: 404, message: 'The bookmark does not exist' });
    }

    await Bookmark.destroy({ where: { userId: id, articleId: article.id } });

    return res
      .status(200)
      .json({ status: 200, message: `${article.title} was removed from bookmarks` });
  }

  /**
   * @author Chris
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async reportArticle(req, res) {
    const userId = req.currentUser.id;
    const { slug } = req.params;
    const { report } = req.body;

    const article = await Article.findOne({
      where: { slug, status: { [Op.not]: ['deleted', 'unpublished'] } }
    });
    if (!article) {
      return res.status(404).json({ status: 404, message: 'Article not found' });
    }

    await Report.create({
      userId,
      articleId: article.id,
      ...report
    });
    return res.status(201).json({ status: 201, message: 'Article Reported successfully' });
  }

  /**
   * @author Chris
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async getArticleReports(req, res) {
    const { page = 1 } = req.query;
    const { currentUser } = req;
    if (currentUser.userType !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Access not allowed' });
    }

    const limit = 20;
    const offset = limit * (page - 1);
    const reports = await Report.findAndCountAll({
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['firstName', 'lastName', 'image']
        },
        {
          model: Article,
          as: 'article',
          attributes: ['title', 'slug']
        }
      ],
      limit,
      offset
    });
    const pages = Math.ceil(reports.count / limit);

    return res.status(200).json({ status: 201, ...reports, pages });
  }

  /**
   * @author Chris
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async getFeed(req, res) {
    const { currentUser } = req;
    let limit = 10;
    let randomArticles = { rows: [] };

    const following = await Follow.findAll({
      where: { follower: currentUser.id },
      attributes: ['followee']
    });
    const filteredFollowing = await following.map(a => a.followee);

    const reads = await Reader.findAll({
      where: { userId: currentUser.id },
      attributes: ['articleId'],
      include: [
        {
          model: Article,
          as: 'views',
          attributes: ['title', 'tagList']
        }
      ]
    });
    const filteredReads = await reads.filter(r => r.views.tagList || []);
    const tags = [];
    if (filteredReads) {
      for (let i = 0; i < filteredReads.length; i += 1) {
        tags.push(...filteredReads[i].views.tagList);
      }
    }

    const articles = await Article.findAndCountAll({
      where: {
        [Op.or]: [
          {
            tagList: { [Op.contained]: tags },
            status: 'published'
          },
          {
            [Op.or]: [{ userId: filteredFollowing }],
            status: 'published'
          }
        ],
        [Op.not]: [{ userId: currentUser.id }]
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username', 'firstName', 'lastName', 'image']
        }
      ],
      limit
    });
    if (articles.count < limit) {
      limit -= articles.count;
      randomArticles = await Article.findAndCountAll({
        where: {
          [Op.not]: [{ userId: currentUser.id }]
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['username', 'firstName', 'lastName', 'image']
          }
        ],
        limit
      });
    }

    const sortedArticles = [...new Set([...articles.rows, ...randomArticles.rows])];
    const uniqueSortedArticles = [];
    const uniqueKeys = [];

    for (let i = 0; i < sortedArticles.length; i += 1) {
      if (uniqueKeys.indexOf(sortedArticles[i].id) === -1) {
        uniqueSortedArticles.push(sortedArticles[i]);
        uniqueKeys.push(sortedArticles[i].id);
      }
    }

    return res.status(200).json({
      status: 200,
      articles: uniqueSortedArticles,
      articleCount: uniqueSortedArticles.length
    });
  }

  /**
   * @author Chris
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async getLikes(req, res) {
    const { currentUser } = req;
    const { slug } = req.params;
    let liked = false;

    const article = await Article.findOne({ where: { slug } });
    if (!article) {
      return res.status(404).send({
        status: 404,
        message: 'No likes found'
      });
    }

    const likes = await Favorite.findAndCountAll({
      where: { articleId: article.id, state: 'like' },
      attributes: ['state', 'updatedAt'],
      include: {
        model: User,
        as: 'author',
        attributes: ['firstName', 'lastName', 'image']
      },
      order: [['updatedAt', 'DESC']]
    });

    if (currentUser) {
      const likeCount = await Favorite.count({
        where: { articleId: article.get().id, state: 'like', userId: currentUser.id }
      });

      liked = likeCount !== 0;
    }
    res.status(200).json({
      status: 200,
      count: likes.count,
      likes: likes.rows,
      liked
    });
  }

  /**
   * @author Chris
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async getDislikes(req, res) {
    const { currentUser } = req;
    const { slug } = req.params;
    let disliked = false;

    const article = await Article.findOne({ where: { slug } });
    if (!article) {
      return res.status(404).send({
        status: 404,
        message: 'No dislikes found'
      });
    }

    const dislikes = await Favorite.findAndCountAll({
      where: { articleId: article.id, state: 'dislike' },
      attributes: ['state', 'updatedAt'],
      include: {
        model: User,
        as: 'author',
        attributes: ['firstName', 'lastName', 'image']
      },
      order: [['updatedAt', 'DESC']]
    });

    if (currentUser) {
      const dislikeCount = await Favorite.count({
        where: { articleId: article.get().id, state: 'dislike', userId: currentUser.id }
      });

      disliked = dislikeCount !== 0;
    }
    res.status(200).json({
      status: 200,
      count: dislikes.count,
      dislikes: dislikes.rows,
      disliked
    });
  }
}

export default ArticleController;
