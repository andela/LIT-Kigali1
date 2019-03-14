import dotenv from 'dotenv';
import { User, Favorite, Comment } from '../../database/models';
import { newArticledEmail } from '../../controllers/MailController';
import inAppNotification from './inAppNotification';

dotenv.config();
const { FRONTEND_URL = '/' } = process.env;

export default async (articleId, author, title, slug) => {
  const favorited = await Favorite.findAll({
    where: { articleId },
    include: [
      {
        model: User,
        where: { notification: 'enabled' },
        attributes: ['id', 'email']
      }
    ]
  });

  const commented = await Comment.findAll({
    where: { articleId },
    include: [
      {
        model: User,
        as: 'author',
        where: { notification: 'enabled' },
        attributes: ['id', 'email']
      }
    ]
  });
  const emailsFavorites = favorited.map(f => f.get().User.get().email);
  const idFavorites = favorited.map(f => f.get().User.get().id);

  const emailsComments = commented.map(c => c.get().author.get().email);
  const idComments = commented.map(c => c.get().author.get().id);

  const emails = [...new Set([...emailsFavorites, ...emailsComments])];
  const combinedId = [...new Set([...idFavorites, ...idComments])];

  const index = emails.indexOf(author.email);

  if (index > -1) {
    emails.splice(index, 1);
  }

  const index2 = combinedId.indexOf(author.id);

  if (index2 > -1) {
    combinedId.splice(index2, 1);
  }

  const subject = 'New Interactions';
  const combinedNotifications = [];

  if (emails.length > 0) {
    for (let i = 0; i < combinedId.length; i++) {
      combinedNotifications.push({
        userId: combinedId[i],
        action: 'reacted on this article!',
        notification: `${author.firstName} reacted on this article! '${title}'`,
        link: `${FRONTEND_URL}/articles/${slug}`
      });
    }

    await inAppNotification(combinedNotifications);
    await newArticledEmail(
      'reacted on this article!',
      subject,
      emails,
      author.firstName,
      slug,
      title
    );
  }
};
