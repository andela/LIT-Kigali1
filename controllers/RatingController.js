import { Op } from 'sequelize';
import { Favorite, User, Article } from '../database/models';
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
        errors: {
          body: ['Article not found']
        }
      });
    }
    const articleId = article.get().id;
    const ratedArticle = await Favorite.findOne({
      where: { articleId, userId: currentUser.id }
    });
    if (ratedArticle) {
      ratedArticle.update({ rating: rate, updatedAt: new Date() });
      return res.status(200).send({
        status: 200,
        message: 'Rating updated successfully',
        article: {
          ...article.get(),
          ratedWith: ratedArticle.get().rating,
          ratedBy: ratedArticle.get().userId,
          rating: rate
        }
      });
    }
    const newRate = await Favorite.create(
      {
        userId: currentUser.id,
        rating: rate,
        articleId,
      },
      {
        include: [{ model: User }, { model: Article }]
      }
    );
    return res.status(201).send({
      status: 201,
      message: 'article has been rated successfully',
      article: { ...article.get(),
        ratedWith: newRate.get().rating,
        ratedBy: newRate.get().userId,
        rating: newRate.get().rating
      }
    });
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns {*} object res
   */
  static async deleteArticle(req, res) {
    const { articleSlug } = req.params;
    const { currentUser } = req;
    const article = await Article.findOne({ where: { slug: articleSlug, status: 'published' } });
    if (!article) {
      return res.status(404).send({
        errors: {
          body: ['rating not found']
        }
      });
    }
    const articleId = article.get().id;
    const ratedArticle = await Favorite.findOne({
      where: { articleId, userId: currentUser.id, rating: { [Op.ne]: null } }
    });
    if (!ratedArticle) {
      return res.status(404).send({
        errors: {
          body: ['rating not found']
        }
      });
    }
    ratedArticle.update({ rating: null });
    return res.status(200).send({
      status: 200,
      message: 'Rating removed successfully',
    });
  }
}
export default RatingController;
