import { Favorite, Article } from '../database/models';
/**
   *
   * @param {*} id of article
   * @returns {*} average rating
   */
  const calculateRating = async (id, slug) => {
    let articleId = id;
    if(slug) {
      const article = await Article.findOne({
        where: { slug }
      });
      articleId = article.get().id;
    }
    const sum = await Favorite.sum('rating', { where: { articleId } });
    const number = await Favorite.count({ where: { articleId } });
    if(!number) {
      return 0;
    }
    return sum / number;
  };
  export default calculateRating;