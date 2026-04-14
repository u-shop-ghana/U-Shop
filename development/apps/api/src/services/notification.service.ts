// c:\UShop\development\apps\api\src\services\notification.service.ts
import { firebaseAdmin } from '../lib/firebase-admin';
import { logger } from '../lib/logger';

export class NotificationService {
  /**
   * Sends a push notification to a specific device token.
   * @param token The FCM registration token for the target device.
   * @param title The title of the notification.
   * @param body The body content of the notification.
   * @param data Optional data payload for the notification.
   */
  static async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ) {
    if (!firebaseAdmin) {
      logger.warn('Firebase Admin is not initialized. Notification skipped.');
      return;
    }

    try {
      const response = await firebaseAdmin.messaging().send({
        token,
        notification: {
          title,
          body,
        },
        data: data || {},
      });

      logger.info({ response }, 'Push notification sent successfully:');
      return response;
    } catch (error) {
      logger.error(error, 'Error sending push notification:');
      throw error;
    }
  }

  /**
   * Sends a push notification to multiple tokens (e.g., all devices for a user).
   */
  static async sendMulticastNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
  ) {
    if (!firebaseAdmin || tokens.length === 0) return;

    try {
      const response = await firebaseAdmin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title,
          body,
        },
        data: data || {},
      });

      logger.info(`${response.successCount} push notifications sent successfully.`);
      return response;
    } catch (error) {
      logger.error(error, 'Error sending multicast notification:');
      throw error;
    }
  }
}
