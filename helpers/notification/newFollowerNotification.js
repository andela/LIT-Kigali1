import dotenv from 'dotenv';
import { User } from '../../database/models';
import { newFollowerEmail } from '../../controllers/MailController';
import inAppNotification from './inAppNotification';

dotenv.config();
const { FRONTEND_URL } = process.env;

export default async (followee, follower) => {
  const notificationObject = [];
  const followerObject = await User.findByPk(follower);
  const followeeObject = await User.findOne({ where: { id: followee, notification: 'enabled' } });

  if (followeeObject) {
    notificationObject.push({
      userId: followeeObject.id,
      notification: `${followerObject.username} started following you`,
      link: `${FRONTEND_URL}/users/userId`
    });

    await inAppNotification(notificationObject);
    await newFollowerEmail(followeeObject.email, followerObject.username);
  }
};
