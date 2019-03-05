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
    const articleId = article.get().id;
    const ratedArticle = await Favorite.findOne({ where: { articleId, userId: currentUser.id } });
    if (ratedArticle) {
      ratedArticle.update({ rating: rate, updatedAt: new Date() });
      return res.status(200).send({
        status: 200,
        message: 'Rating updated successfully',
        article: {
          ...article.get(),
          ratedWith: ratedArticle.get().rating,
          ratedBy: ratedArticle.get().userId,
          averageRate: await calculateRating(articleId)
        }
      });
    }
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
      article: {
        ...article.get(),
        ratedWith: newRate.get().rating,
        ratedBy: newRate.get().userId,
        averageRate: await calculateRating(articleId)
      }
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
    const articleId = article.get().id;
    const ratedArticle = await Favorite.findOne({ where: { articleId, userId: currentUser.id, rating: { [Op.ne]: null } } });
    if (!ratedArticle) {
      return res.status(404).send({ errors: { body: ['rating not found'] } });
    }
    ratedArticle.update({ rating: null });
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

    const article = await Article.findOne({ where: { slug: articleSlug, status: 'published' } });
    if (!article) {
      return res.status(404).send({
        status: 404,
        message: 'Rating not found'
      });
    }

    const allRating = await Favorite.findAll({ where: { articleId: article.get().id, rating: { [Op.ne]: null } } });
    if (!allRating.length) {
      return res.status(404).send({
        status: 404,
        message: 'No rating for such article'
      });
    }
    return res.status(200).send({
      status: 200,
      averageRate: await calculateRating(null, article.get().slug),
      ratings: allRating,

    });
  }
}
export default RatingController;
