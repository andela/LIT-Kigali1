import { FavoriteComment, Comment } from '../database/models';
/**
 * @author Daniel
 * a class controller for adding like and dislike to the comment on article
 * it includes a function to get all likes
 */
class FavoriteCommentController {
  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns {*} object
   */
  static async likeComment(req, res) {
    const { currentUser } = req;
    const { commentId } = req.params;

    const comment = await Comment.findOne({ where: { id: commentId } });
    if (!comment) {
      return res.status(404).send({
        status: 404,
        message: 'The comment you are trying to like does not exist'
      });
    }
    const isFavorited = await FavoriteComment.findOne({
      where: {
        userId: currentUser.id,
        commentId
      }
    });
    if (isFavorited) {
      if (isFavorited.value === 'liked') {
        await isFavorited.destroy();
        return res.status(200).send({
          status: 200,
          message: 'Like removed'
        });
      }
      await isFavorited.destroy();
      const liked = await FavoriteComment.create({
        userId: currentUser.id,
        commentId,
        value: 'liked'
      });
      return res.status(201).send({
        status: 201,
        message: 'Comment liked',
        like: { ...liked.get() }
      });
    }
    const liked = await FavoriteComment.create({
      userId: currentUser.id,
      commentId,
      value: 'liked'
    });
    return res.status(201).send({
      status: 201,
      message: 'Comment liked',
      like: { ...liked.get() }
    });
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns {*} object
   */
  static async dislikeComment(req, res) {
    const { currentUser } = req;
    const { commentId } = req.params;

    const comment = await Comment.findOne({ where: { id: commentId } });
    if (!comment) {
      return res.status(404).send({
        status: 404,
        message: 'The comment you are trying to dislike does not exist'
      });
    }
    const isFavorited = await FavoriteComment.findOne({
      where: {
        userId: currentUser.id,
        commentId
      }
    });
    if (isFavorited) {
      if (isFavorited.value === 'disliked') {
        await isFavorited.destroy();
        return res.status(200).send({
          status: 200,
          message: 'Dislike removed'
        });
      }
      await isFavorited.destroy();
      const dislike = await FavoriteComment.create({
        userId: currentUser.id,
        commentId,
        value: 'disliked'
      });

      return res.status(201).send({
        status: 201,
        message: 'Comment disliked',
        dislike: { ...dislike.get() }
      });
    }
    const dislike = await FavoriteComment.create({
      userId: currentUser.id,
      commentId,
      value: 'disliked'
    });
    return res.status(201).send({
      status: 201,
      message: 'Comment disliked',
      dislike: { ...dislike.get() }
    });
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns {*} object
   */
  static async getAllLikes(req, res) {
    const { commentId } = req.params;
    const { queryPage = 1 } = req.query;

    const comments = await Comment.findOne({ where: { id: commentId } });
    if (!comments) {
      return res.status(404).send({
        status: 404,
        message: 'No likes found'
      });
    }
    const limit = 20;
    const commentLikes = await FavoriteComment.findAndCountAll({
      where: { commentId, value: 'liked' },
      limit,
      offset: (queryPage - 1) * limit
    });
    if (!commentLikes.rows.length) {
      return res.status(404).send({
        status: 404,
        message: 'No likes found'
      });
    }
    return res.status(200).send({
      status: 200,
      counts: commentLikes.count,
      likes: commentLikes.rows,
      page: Number(queryPage),
      pages: Math.ceil(commentLikes.count / limit)
    });
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns {*} object
   */
  static async getAllDislikes(req, res) {
    const { commentId } = req.params;
    const { queryPage = 1 } = req.query;

    const comments = await Comment.findOne({ where: { id: commentId } });
    if (!comments) {
      return res.status(404).send({
        status: 404,
        message: 'No dislikes found'
      });
    }
    const limit = 20;
    const commentDislikes = await FavoriteComment.findAndCountAll({
      where: { commentId, value: 'disliked' },
      limit,
      offset: (queryPage - 1) * limit
    });
    if (!commentDislikes.rows.length) {
      return res.status(404).send({
        status: 404,
        message: 'No dislikes found'
      });
    }
    return res.status(200).send({
      status: 200,
      counts: commentDislikes.count,
      dislikes: commentDislikes.rows,
      page: Number(queryPage),
      pages: Math.ceil(commentDislikes.count / limit)
    });
  }
}

export default FavoriteCommentController;
