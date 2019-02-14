import 'dotenv/config';
import { Article, Tag } from '../database/models';
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
}
export default ArticleController;
