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
    const {
      highlightedText,
      body, endPoint,
      startPoint
    } = req.body.comment;
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
    const findText = article.body.slice(startPoint, endPoint);
    if (findText !== highlightedText) {
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
      startPoint,
      endPoint
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

  /**
   * @author Daniel and Manzi
   * @param {*} req
   * @param {*} res
   * @returns {object} comment
   */
  static async updateComment(req, res) {
    const { endPoint, startPoint, highlightedText } = req.body.comment;
    const { commentId } = req.params;
    const { currentUser } = req;

    const comment = await Comment.findOne({
      where: {
        id: commentId,
        userId: currentUser.id
      }
    });

    if (!comment) {
      return res.status(404).send({
        status: 404,
        message: 'Comment not found'
      });
    }
    const article = await Article.findOne({
      where: {
        id: comment.articleId
      }
    });
    if (highlightedText) {
      if (!startPoint || !endPoint) {
        return res.status(400).send({
          status: 400,
          message: 'Please provide both startPoint and endPoint'
        });
      }
      const findText = article.body.slice(startPoint, endPoint);
      if (findText !== highlightedText) {
        return res.status(404).send({
          status: 404,
          message: 'The text you highlighted is not in the article'
        });
      }
    }
    comment.update({ ...req.body.comment, updateAt: new Date() });

    return res.status(200).send({
      status: 200,
      comment: comment.get()
    });
  }
}
export default CommentOnTextController;
