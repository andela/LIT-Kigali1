import 'dotenv/config';
import { Comment, User, Article } from '../database/models';
import newInteractionNotification from '../helpers/notification/newInteractionNotification';

/**
 * @description Comment on highlighted text from article Controller class
 */
class CommentOnTextController {
  /**
   * @author Daniel and Manzi
   * @param {*} req
   * @param {*} res
   * @returns {Object} object
   */
  static async addComment(req, res) {
    const { articleSlug } = req.params;
    const { highlightedText } = req.body.comment;
    const { body } = req.body.comment;
    const { currentUser } = req;

    const article = await Article.findOne({
      where: {
        slug: articleSlug
      }
    });
    if (!article) {
      return res.status(404).send({
        status: 404,
        message: 'Article not found'
      });
    }
    const findText = article.body.indexOf(highlightedText);
    if (findText === -1) {
      return res.status(404).send({
        status: 404,
        message: 'The text you highlighted is not in the article'
      });
    }
    const newComment = await Comment.create({
      body,
      articleId: article.id,
      userId: currentUser.id,
      highlightedText,
    },
    {
      include: [{ model: User, as: 'author' }],
      attributes: ['username', 'firstName', 'lastName', 'image']
    });
    await newInteractionNotification(
      article.id,
      await newComment.getAuthor(),
      article.title,
      article.slug
    );

    return res.status(201).send({
      status: 201,
      comment: newComment.get()
    });
  }
}
export default CommentOnTextController;
