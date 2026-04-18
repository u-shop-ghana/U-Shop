"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";

interface FirebaseContextType {
  fcmToken: string | null;
  notificationPermission: NotificationPermission;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

// This provider handles FCM token registration and browser notification permissions.
// Following the Option A strategy: Supabase handles identity, Firebase handles messaging.
export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Only run on client side and if messaging is initialized
    if (typeof window === "undefined" || !messaging) return;

    const initializeFcm = async () => {
      try {
        // Request permission from the user
        const status = await Notification.requestPermission();
        setPermission(status);

        if (status === "granted" && messaging) {
          // Comment 7: Send Firebase config to the service worker via postMessage
          // so it can initialize without hardcoding the messagingSenderId.
          const registration = await navigator.serviceWorker.ready;
          registration.active?.postMessage({
            type: 'FIREBASE_CONFIG',
            config: {
              apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
              authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
              storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
              messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
              appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
              measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
            },
          });

          // Retrieve the registration token for this device/browser
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, // Optional but recommended
          });

          if (token) {
            setFcmToken(token);
            // TODO: Call your Express API to save this token against the current Supabase user
          }
        }
      } catch (err) {
        console.error("Failed to initialize FCM:", err);
      }
    };

    initializeFcm();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      // You can trigger a local toast notification here
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ fcmToken, notificationPermission: permission }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
}
