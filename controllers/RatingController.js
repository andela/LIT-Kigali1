import Favorite from '../database/models';
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
  static rateArticle(req, res) {
    const { slug } = req.params;
    const { currentUser } = req;
    return res.status(200).send({ slug, currentUser });
  }
}
export default RatingController;
