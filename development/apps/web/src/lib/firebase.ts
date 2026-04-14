// c:\UShop\development\apps\web\src\lib\firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

// Firebase configuration using environment variables for security.
// These are exposed to the client via the NEXT_PUBLIC_ prefix.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
// We check getApps().length to ensure we don't initialize the app more than once during HMR.
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Messaging and Analytics lazily since they require a browser environment.
let messaging: Messaging | undefined;
let analytics: Analytics | undefined;

if (typeof window !== "undefined") {
  // FCM is supported in most modern browsers.
  messaging = getMessaging(app);
  
  // Analytics requires specific support checks.
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, messaging, analytics };
