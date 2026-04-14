// c:\UShop\development\apps\api\src\lib\firebase-admin.ts
import * as admin from 'firebase-admin';
import { logger } from './logger';

// Initializes the Firebase Admin SDK for backend operations like sending FCM messages.
// Requires a SERVICE_ACCOUNT_KEY env variable (JSON string or path to JSON file).
export const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccount) {
    logger.warn('FIREBASE_SERVICE_ACCOUNT_KEY not found. Push notifications will be disabled.');
    return null;
  }

  try {
    const parsedAccount = JSON.parse(serviceAccount);
    
    return admin.initializeApp({
      credential: admin.credential.cert(parsedAccount),
    });
  } catch (error) {
    logger.error(error, 'Failed to initialize Firebase Admin SDK:');
    return null;
  }
};

export const firebaseAdmin = initializeFirebaseAdmin();
