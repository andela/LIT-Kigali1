import { Op } from 'sequelize';
import { Favorite, User, Article } from '../database/models';
import { calculateRating } from '../helpers';
/**
 * @author Daniel
 * @description a class for rating the article
 */
class RatingController {
  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns {*} object
   */
  static async rateArticle(req, res) {
    const { articleSlug } = req.params;
    const { rate } = req.body;
    const { currentUser } = req;
    const article = await Article.findOne({ where: { slug: articleSlug, status: 'published' } });
    if (!article) {
      return res.status(404).send({
        status: 404,
        errors: { body: ['Article not found'] }
      });
    }
    const articleId = article.id;
    const rating = await Favorite.findOne({ where: { articleId, userId: currentUser.id } });
    if (rating) {
      rating.update({ rating: rate, updatedAt: new Date() });
      const averageRate = await calculateRating(articleId);
      return res.status(200).send({
        status: 200,
        message: 'Rating updated successfully',
        rate: { ...rating.get() },
        averageRate,
      });
    }
    const averageRate = await calculateRating(articleId);
    const newRate = await Favorite.create(
      {
        userId: currentUser.id,
        rating: rate,
        articleId,
      },
      { include: [{ model: User }, { model: Article }] }
    );
    return res.status(201).send({
      status: 201,
      message: 'article has been rated successfully',
      rate: { ...newRate.get() },
      averageRate,
    });
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns {*} object res
   */
  static async deleteRating(req, res) {
    const { articleSlug } = req.params;
    const { currentUser } = req;
    const article = await Article.findOne({ where: { slug: articleSlug, status: 'published' } });
    if (!article) {
      return res.status(404).send({ errors: { body: ['rating not found'] } });
    }
    const articleId = article.id;
    const rating = await Favorite.findOne({
      where: {
        articleId,
        userId: currentUser.id,
        rating: { [Op.ne]: null }
      }
    });
    if (!rating) {
      return res.status(404).send({ errors: { body: ['rating not found'] } });
    }
    rating.update({ rating: null, updatedAt: new Date() });
    return res.status(200).send({
      status: 200,
      message: 'Rating removed successfully',
    });
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns {*} object
   */
  static async getAllRating(req, res) {
    const { articleSlug } = req.params;
    const { queryPage = 1 } = req.query;
    const article = await Article.findOne({ where: { slug: articleSlug, status: 'published' } });
    if (!article) {
      return res.status(404).send({
        status: 404,
        message: 'Rating not found'
      });
    }
    const limit = 20;
    const allRating = await Favorite.findAndCountAll({
      where: {
        articleId: article.id,
        rating: { [Op.ne]: null }
      },
      limit,
      offset: (queryPage - 1) * limit
    });
    if (!allRating.rows.length) {
      return res.status(404).send({
        status: 404,
        message: 'No rating for such article'
      });
    }
    return res.status(200).send({
      status: 200,
      averageRate: await calculateRating(null, article.slug),
      ratings: allRating.rows,
      page: Number(queryPage),
      pages: Math.ceil(allRating.count / limit)
    });
  }
}
export default RatingController;
