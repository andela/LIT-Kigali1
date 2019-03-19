import dotenv from 'dotenv';
import { User, Follow } from '../../database/models';
import { newArticledEmail } from '../../controllers/MailController';
import inAppNotification from './inAppNotification';

dotenv.config();
const { FRONTEND_URL } = process.env;

export default async (author, title, slug) => {
  const emails = [];
  const followersId = [];
  const action = 'published a new article!';
  const subject = 'New Article';
  const followers = await Follow.findAll({
    where: { followee: author.id },
    include: [
      {
        model: User,
        as: 'userFollower',
        where: { notification: 'enabled' },
        attributes: ['id', 'email']
      }
    ]
  });

  if (followers.length === 0) return;

  for (const key in followers) {
    const follower = followers[key].userFollower.get();
    emails.push(follower.email);
    followersId.push({
      userId: follower.id,
      notification: `${author.firstName} ${action} ${subject}`,
      link: `${FRONTEND_URL}/articles/${slug}`
    });
  }

  await inAppNotification(followersId);
  await newArticledEmail(action, subject, emails, author.firstName, title, slug);
};
