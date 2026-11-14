// Keeps the whole app on the phone so it opens, and reloads, with no network.
// VERSION and FILES are filled in at build time by the offline plugin in vite.config.ts.
const VERSION = '__VERSION__'
const FILES = /* __FILES__ */ ['./']
const CACHE = `kwan-${VERSION}`
const MATCH = { ignoreSearch: true, ignoreVary: true }

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // The page itself is fetched past the browser's own cache. Otherwise an out-of-date page can be
      // saved next to the new files, and it then asks for old files that no longer exist.
      .then((cache) => cache.addAll(FILES.map((url) => (url === './' ? new Request(url, { cache: 'reload' }) : url))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('kwan-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  // Saved copy first: instant on a weak connection, and the only option with none.
  // A new version is picked up in the background and shows on the next load.
  event.respondWith(
    // ignoreVary: hosts add a Vary header that would otherwise make the saved copy look like a different file.
    caches.match(request, MATCH).then((saved) => {
      if (saved) return saved
      return fetch(request).catch(() => {
        if (request.mode === 'navigate') return caches.match('./', MATCH)
        throw new Error('offline')
      })
    }),
  )
})
