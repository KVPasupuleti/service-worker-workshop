This project demonstrates how to implement advanced Progressive Web App (PWA) features in a Create React App, including:
- Static and Dynamic Asset Caching
- Offline Experience
- App Update Notifications
- Push Notifications
- Service Worker Lifecycle Management

## Features Implementation Guide

### 1. Service Worker Registration

The service worker is registered in `src/index.js`:

```javascript
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
            .register("/service-worker.js")
            .then((registration) => {
                console.log("Service Worker registered:", registration);
                // ... push notification subscription code
            });
        });
    }
```

### 2. Asset Caching Strategy

The project implements a cache-first strategy with dynamic caching in `public/service-worker.js`:

```javascript
    const CACHE_NAME = "react-app-cache-v15";
    // Install event: Caches static assets
    self.addEventListener("install", (event) => {
        event.waitUntil(
        fetch("asset-manifest.json")
        .then((response) => response.json())
        .then((manifest) => {
            const filesToCache = Object.values(manifest.files).filter(
                (url) => /\.(js|css)$/i.test(url)
            );
            filesToCache.push("/", "/index.html");
            return caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(filesToCache);
            });
        })
        );
    });
```

The caching strategy:
1. During installation, caches all JS and CSS files from the asset manifest
2. Adds critical files like index.html to cache
3. Uses a cache-first strategy for subsequent requests
4. Dynamically caches new network requests

### 3. App Update Detection

The app implements an update detection system:

1. Service Worker sends update notification:

```javascript
    // In service-worker.js
    self.addEventListener("activate", (event) => {
        event.waitUntil(
        self.clients.claim().then(() => {
            return self.clients.matchAll({ type: "window" }).then((clients) => {
            if (self.registration.active) {
                    clients.forEach((client) =>
                    client.postMessage({ type: "SW_UPDATED" })
                    );
                }
            });
        })
        );
    });
```

2. React app listens for updates in `App.js`:

```javascript
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.addEventListener("message", (event) => {
                if (event.data.type === "SW_UPDATED") {
                    setUpdateAvailable(true);
                }
            });
        }
    }, []);
```


3. Update notification UI is shown using `AppUpdateCard.js`

### 4. Push Notifications

The project includes a complete push notification system:

You can generate your Vapid keys using the following command in terminal

```bash
    web-push generate-vapid-keys
```

1. Backend Setup (`backend/server.js`):

```javascript
    const webPush = require("web-push");
    webPush.setVapidDetails(
    "mailto:example@yourdomain.com",
    vapidKeys.publicVapidKey,
    vapidKeys.privateVapidKey
    );
```

2. Subscription Process:
- Frontend subscribes to push service (`src/index.js`)
- Backend stores subscriptions (`backend/server.js`)
- Push notifications can be sent via the `/send-notification` endpoint


3. Service Worker handles push events:

```javascript
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(title || "No Title", {
      body: body || "No Body",
      icon: "/logo192.png"
    })
  );
});
```

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Start the React development server:

```bash
npm start
```

3. Start the backend server:

```bash
npm run start:backend
```

## Testing Push Notifications

1. Ensure the backend server is running
2. Visit the app in a browser that supports push notifications
3. Accept the push notification permission prompt
4. Send a test notification using the backend API:

```bash
curl -X POST http://localhost:5000/send-notification \
  -H "Content-Type: application/json" \
  -d '{"payload":{"title":"Test Notification","body":"Hello World!"}}'
```

## Important Notes

1. The service worker only works in production builds. Run `npm run build` and serve the build folder to test service worker functionality.

2. VAPID keys in `backend/data/vapidKeys.json` should be replaced with your own generated keys for production use.

3. The cache version in `service-worker.js` (`CACHE_NAME`) should be updated when deploying new versions to ensure users get the latest content.

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm run build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm run start:backend`: Starts the backend server

## Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Web Push Libraries](https://github.com/web-push-libs/web-push)