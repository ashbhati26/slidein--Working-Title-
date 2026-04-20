/*
  Svation Service Worker
  Handles: offline cache, push notifications for new leads
  Strategy: Network-first for API/dynamic, Cache-first for static assets
*/

const CACHE_NAME = "Svation-v1";
const STATIC_CACHE_NAME = "Svation-static-v1";

/* Assets to pre-cache on install */
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

/* Routes that should never be cached */
const NEVER_CACHE = ["/api/", "convex.cloud", "clerk.com", "googleapis.com"];

/* ─── Install ─────────────────────────────────────────── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

/* ─── Activate — clean old caches ────────────────────── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE_NAME)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/* ─── Fetch — network-first strategy ─────────────────── */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* Skip non-GET requests */
  if (request.method !== "GET") return;

  /* Skip uncacheable origins/paths */
  if (NEVER_CACHE.some((pattern) => request.url.includes(pattern))) return;

  /* Skip chrome-extension and non-http */
  if (!request.url.startsWith("http")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        /* Only cache successful same-origin responses */
        if (
          response.ok &&
          response.type === "basic" &&
          !url.pathname.startsWith("/api/")
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        /* Offline fallback — serve from cache */
        return caches.match(request).then((cached) => {
          if (cached) return cached;

          /* For navigation requests, return the dashboard shell */
          if (request.mode === "navigate") {
            return caches.match("/dashboard");
          }

          return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
      }),
  );
});

/* ─── Push Notifications — new lead alerts ───────────── */
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: "New lead — Svation",
      body: event.data.text(),
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
    };
  }

  const options = {
    body: data.body || "You have a new lead",
    icon: data.icon || "/icons/icon-192x192.png",
    badge: data.badge || "/icons/badge-72x72.png",
    tag: data.tag || "Svation-lead",
    renotify: true,
    requireInteraction: false,
    silent: false,
    data: {
      url: data.url || "/leads",
      leadId: data.leadId,
    },
    actions: [
      {
        action: "view",
        title: "View lead",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "New lead — Svation",
      options,
    ),
  );
});

/* ─── Notification click ──────────────────────────────── */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/leads";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        /* Focus existing tab if open */
        const existing = clients.find((c) => c.url.includes(targetUrl));
        if (existing) return existing.focus();

        /* Otherwise open new tab */
        return self.clients.openWindow(targetUrl);
      }),
  );
});

/* ─── Background sync — retry failed drip sends ──────── */
self.addEventListener("sync", (event) => {
  if (event.tag === "retry-failed-messages") {
    event.waitUntil(
      /* This will be handled by the app when it comes back online */
      Promise.resolve(),
    );
  }
});
