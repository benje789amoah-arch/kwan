// Keeps the whole app on the phone so it opens, and reloads, with no network.
// VERSION and FILES are filled in at build time by the offline plugin in vite.config.ts.
const VERSION = '4e44dfe9a0'
const FILES = ["./","./assets/index-BIqwNriO.js","./assets/index-e9C-akVM.css","./assets/plus-jakarta-sans-latin-ext-wght-normal-DmpS2jIq.woff2","./assets/plus-jakarta-sans-latin-wght-normal-eXO_dkmS.woff2"]
const CACHE = `kwan-${VERSION}`
const MATCH = { ignoreSearch: true, ignoreVary: true }

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES))
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
