// Firebase Messaging Service Worker
// Comment 7: Instead of hardcoding the messagingSenderId, this worker
// receives the Firebase config dynamically from the main app via postMessage
// at registration time. This avoids committing secrets into public JS files.
//
// The Firebase compat SDK v12 is loaded from the CDN to match the version
// used in package.json. The main app sends config via:
//   navigator.serviceWorker.controller.postMessage({ type: 'FIREBASE_CONFIG', config: {...} })

importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js");

// Hold off on initializing until we receive config from the main thread
let messaging = null;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    // Initialize Firebase with the config sent from the main app
    firebase.initializeApp(event.data.config);
    messaging = firebase.messaging();

    // Handle background messages once initialized
    messaging.onBackgroundMessage((payload) => {
      console.log("[firebase-messaging-sw.js] Received background message", payload);
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: "/apple-touch-icon.png",
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
});
