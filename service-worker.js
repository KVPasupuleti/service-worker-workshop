const CACHE_NAME = "react-app-cache-v7";

// Install event: Cache assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    fetch("asset-manifest.json") // Fetch the manifest generated during build
      .then((response) => response.json())
      .then((manifest) => {
        const filesToCache = Object.values(manifest.files).filter(
          (url) => /\.(js|css)$/i.test(url) // Match `.js` and `.css` files
        );
        filesToCache.push("/", "/index.html"); // Include mandatory files like index.html to enable updates
        return caches.open(CACHE_NAME).then((cache) => {
          return cache.addAll(filesToCache);
        });
      })
      .catch((error) => {
        console.error("[Service Worker] Failed to cache assets:", error);
      })
  );
  // Skip the waiting phase and activate the service worker immediately after installation
  self.skipWaiting();
});

// Fetch event: Serve cached assets when offline
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("service-worker.js")) {
    // Skip caching the service worker itself
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch((error) => {
            console.error(
              "[Service Worker] Fetch failed:",
              event.request.url,
              error
            );
          })
      );
    })
  );
});

// Activate event: Clear old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all clients and Notify the client that a new service worker is active
  event.waitUntil(
    self.clients.claim().then(() => {
      return self.clients.matchAll({ type: "window" }).then((clients) => {
        // Notify only if there's a previous service worker
        if (self.registration.active) {
          clients.forEach((client) =>
            client.postMessage({ type: "SW_UPDATED" })
          );
        }
      });
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting(); // Forces the service worker to activate immediately
  }
});

self.addEventListener("push", (event) => {
  console.log(event.data);
  const data = event.data ? event.data.json() : {};
  const { title, body } = data;

  event.waitUntil(
    self.registration.showNotification(title || "No Title", {
      body: body || "No Body",
      icon: "/logo192.png" // Change this to your app's icon
    })
  );
});

self.addEventListener("push", (event) => {
  console.log(event.data);
  const data = event.data ? event.data.json() : {};
  const { title, body } = data;

  event.waitUntil(
    self.registration.showNotification(title || "No Title", {
      body: body || "No Body",
      icon: "/logo192.png" // Change this to your app's icon
    })
  );
});
