/// MixMaster Service Worker
const VERSION = 'v4';
const STATIC_CACHE = `mixmaster-static-${VERSION}`;
const RUNTIME_CACHE = `mixmaster-runtime-${VERSION}`;

/**
 * 站台根路徑。
 *
 * GitHub Pages 的專案站台位於 /<repo>/ 之下，寫死斜線開頭的路徑會全部 404，
 * 離線快取與推播圖示都會失效。registration.scope 即為 Service Worker 的
 * 註冊範圍，兩種部署都能由此得出正確的根路徑。
 */
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, '');
const path = (p) => `${BASE}${p}`;

const OFFLINE_URL = path('/offline.html');

// 執行期快取上限，避免長期瀏覽後無限成長
const RUNTIME_MAX_ENTRIES = 120;

/**
 * 使用者主動下載的離線內容存在獨立的快取。
 *
 * 與執行期快取分開，才不會被 RUNTIME_MAX_ENTRIES 的淘汰機制清掉——
 * 使用者特意下載的東西，不該因為多逛了幾頁就消失。
 */
const OFFLINE_CACHE = `mixmaster-offline-${VERSION}`;

const PRECACHE_ASSETS = [
  path('/'),
  path('/recipes'),
  OFFLINE_URL,
  path('/manifest.json'),
  path('/icons/icon.svg'),
  // 靜態版的資料檔：有了這幾份，搜尋與配方清單離線時仍可運作
  path('/search-index.json'),
  path('/recipes-summary.json'),
  path('/recipe-data.json'),
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      // 個別加入：任一資源失敗不應導致整個安裝失敗
      Promise.all(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch(() => undefined)
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const keep = new Set([STATIC_CACHE, RUNTIME_CACHE, OFFLINE_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  // 只快取 GET；POST/PUT/DELETE 必須直接送達伺服器
  if (request.method !== 'GET') return;

  if (url.pathname.startsWith(path('/_next/static/'))) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (url.pathname.startsWith(path('/api/v1/'))) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request));
    return;
  }

  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  // 依插入順序淘汰最舊的項目
  await Promise.all(
    keys.slice(0, keys.length - maxEntries).map((k) => cache.delete(k))
  );
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 408, statusText: 'Offline' });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      trimCache(cacheName, RUNTIME_MAX_ENTRIES);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return (
      cached ||
      new Response('{"error":"offline"}', {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }
}

/**
 * 導覽請求：網路優先，成功時寫入快取。
 *
 * 先前不會快取導覽回應，因此離線時已造訪過的配方頁仍只能顯示離線頁；
 * 看似可用是瀏覽器自身的 HTTP 快取所致，並不可靠。
 */
async function navigationHandler(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
      trimCache(RUNTIME_CACHE, RUNTIME_MAX_ENTRIES);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    const offlinePage = await caches.match(OFFLINE_URL);
    return (
      offlinePage ||
      new Response('Offline', {
        status: 503,
        headers: { 'Content-Type': 'text/html' },
      })
    );
  }
}


/* ── 推播 ─────────────────────────────────────────────────
   推播內容由伺服器以 JSON 傳入；若解析失敗仍顯示通用訊息，
   否則使用者只會看到瀏覽器預設的「本網站於背景更新」。 */
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'MixMaster';
  const options = {
    body: payload.body || '',
    icon: path('/icons/icon-192.png'),
    badge: path('/icons/icon-192.png'),
    data: { url: payload.url || path('/') },
    tag: payload.tag || 'mixmaster-notification',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || path('/');

  // 已開啟的分頁優先聚焦，避免每次通知都開一個新視窗
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(target) && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow ? self.clients.openWindow(target) : undefined;
    })
  );
});


/* ── 完整離線 ─────────────────────────────────────────────
   使用者可主動下載全部配方，之後即使沒有網路也讀得到未曾造訪的頁面。
   先前只有「造訪過的頁面」會進快取，出門在外想查一杯沒看過的酒就沒轍。 */

/** 逐一抓取並存入離線快取；回報進度讓介面能顯示。 */
async function downloadForOffline(urls, reply) {
  const cache = await caches.open(OFFLINE_CACHE);
  let done = 0;
  let failed = 0;

  for (const url of urls) {
    try {
      // 明確跳過 HTTP 快取，確保存進去的是最新內容
      const response = await fetch(url, { cache: 'reload' });
      if (response.ok) {
        await cache.put(url, response.clone());
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
    done++;
    if (done % 5 === 0 || done === urls.length) {
      reply({ type: 'OFFLINE_PROGRESS', done, total: urls.length, failed });
    }
  }
  reply({ type: 'OFFLINE_DONE', done, total: urls.length, failed });
}

async function offlineStatus(reply) {
  const cache = await caches.open(OFFLINE_CACHE);
  const keys = await cache.keys();
  reply({ type: 'OFFLINE_STATUS', count: keys.length });
}

async function clearOffline(reply) {
  await caches.delete(OFFLINE_CACHE);
  reply({ type: 'OFFLINE_STATUS', count: 0 });
}

self.addEventListener('message', (event) => {
  const data = event.data || {};
  // 回覆給發訊的分頁；沒有 port 時廣播給所有分頁
  const reply = (message) => {
    if (event.ports && event.ports[0]) event.ports[0].postMessage(message);
    else self.clients.matchAll().then((cs) => cs.forEach((c) => c.postMessage(message)));
  };

  if (data.type === 'DOWNLOAD_OFFLINE' && Array.isArray(data.urls)) {
    event.waitUntil(downloadForOffline(data.urls, reply));
  } else if (data.type === 'OFFLINE_STATUS') {
    event.waitUntil(offlineStatus(reply));
  } else if (data.type === 'CLEAR_OFFLINE') {
    event.waitUntil(clearOffline(reply));
  }
});
