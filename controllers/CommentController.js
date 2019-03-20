import 'dotenv/config';
import moment from 'moment';
import { Comment, User, Article, OldComment } from '../database/models';
import newInteractionNotification from '../helpers/notification/newInteractionNotification';

/**
 * @description Comment Controller class
 */
class CommentController {
  /**
   * @author Olivier
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async createArticleComment(req, res) {
    const { currentUser } = req;
    const { articleSlug } = req.params;
    const { comment } = req.body;
    let parentId;
    const foundArticle = await Article.findOne({ where: { slug: articleSlug } });
    if (!foundArticle) {
      return res.status(404).json({
        status: 404,
        message: 'Article not found'
      });
    }
    if (comment.parentId) {
      const parentComment = await Comment.findOne({ where: { id: comment.parentId } });
      if (!parentComment) {
        return res.status(404).json({
          status: 404,
          message: 'Parent comment not found'
        });
      }
      parentId = parentComment.id;
    }
    const newComment = await Comment.create(
      {
        ...comment,
        userId: currentUser.id,
        articleId: foundArticle.id,
        parentId
      },
      {
        include: [{ model: User, as: 'author' }],
        attributes: ['username', 'firstName', 'lastName', 'image']
      }
    );

    await newInteractionNotification(
      foundArticle.id,
      await newComment.getAuthor(),
      foundArticle.title,
      foundArticle.slug
    );

    return res.status(201).json({
      status: 201,
      message: 'Comment created successfully',
      comment: newComment.get()
    });
  }

  /**
   * @author Olivier
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async updateComment(req, res) {
    const { currentUser } = req;
    const { comment } = req.body;
    const { commentId } = req.params;
    const foundComment = await Comment.findOne({
      where: { id: commentId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username', 'firstName', 'lastName', 'image']
        }
      ]
    });
    if (!foundComment) {
      return res.status(404).json({
        status: 404,
        message: 'Comment not found'
      });
    }

    if (foundComment.userId !== currentUser.id) {
      return res.status(401).json({ status: 401, message: 'Unauthorized access' });
    }

    const oldcomment = await OldComment.findOne({ where: { commentId } });

    if (oldcomment) {
      await oldcomment.destroy();
    }

    await OldComment.create({
      commentId: foundComment.id,
      body: foundComment.body,
      userId: currentUser.id
    });
    await foundComment.update({
      body: comment.body,
      version: 'edited',
      updateAt: moment().format()
    });

    return res.status(200).json({
      status: 200,
      message: 'Comment updated successfully',
      comment: foundComment.get()
    });
  }

  /**
   * @author Olivier
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async getArticleComments(req, res) {
    const { page = 1 } = req.query;
    const { articleSlug } = req.params;
    const limit = 25;
    const foundArticle = await Article.findOne({ where: { slug: articleSlug } });
    if (!foundArticle) {
      return res.status(404).json({
        status: 404,
        message: 'Article not found'
      });
    }
    const comments = await Comment.findAndCountAll({
      include: [
        { model: User, as: 'author', attributes: ['username', 'firstName', 'lastName', 'image'] },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['username', 'firstName', 'lastName', 'image']
            }
          ]
        }
      ],
      where: { articleId: foundArticle.id, parentId: null },
      offset: (page - 1) * limit,
      limit
    });
    return res.status(200).json({
      status: 200,
      comments: comments.rows,
      commentsCount: comments.count,
      pages: Math.ceil(comments.count / limit),
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
  static async deleteComment(req, res) {
    const { currentUser } = req;
    const { commentId } = req.params;
    const foundComment = await Comment.findOne({ where: { id: commentId } });

    if (!foundComment) {
      return res.status(404).json({ status: 404, message: 'Comment not found' });
    }

    if (foundComment.userId !== currentUser.id) {
      return res.status(401).json({ status: 401, message: 'Unauthorized access' });
    }

    await foundComment.destroy();

    return res.status(200).json({
      status: 200,
      message: 'Comment deleted successfully'
    });
  }

  /**
   * @author Caleb
   * @param {Object} req
   * @param {Object} res
   * @param {*} next
   * @returns {Object} Returns the response
   */
  static async ViewCommentEdit(req, res) {
    const { currentUser } = req;
    const { commentId } = req.params;
    const foundComment = await Comment.findOne({
      where: { id: commentId }
    });

    if (!foundComment) {
      return res.status(404).json({
        status: 404,
        message: 'Comment not found'
      });
    }

    if (
      foundComment.userId === currentUser.id ||
      currentUser.userType === 'admin' ||
      currentUser.userType === 'super-admin'
    ) {
      if (foundComment.version !== 'edited') {
        return res.status(404).json({ status: 404, message: 'This comment was not edited' });
      }
      const commentHistory = await OldComment.findOne({
        where: { commentId },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['username', 'firstName', 'lastName', 'image']
          }
        ]
      });

      return res.status(200).json({ status: 200, editedComment: commentHistory });
    }
    return res.status(401).json({ status: 401, message: 'Unauthorized access' });
  }
}

export default CommentController;
