import { FavoriteComment, Comment } from '../database/models';
/**
 * @author Daniel
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
        message: 'The comment you are trying to like does not exist',
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
          message: 'Like removed successfully'
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
        message: 'Comment liked successfully',
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
      message: 'Comment liked successfully',
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
        message: 'The comment you are trying to dislike does not exist',
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
          message: 'Dislike removed successfully'
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
        message: 'Comment disliked successfully',
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
      message: 'Comment disliked successfully',
      dislike: { ...dislike.get() }
    });
  }
}

export default FavoriteCommentController;
