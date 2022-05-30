let assets = [
    '.',
    './index.html',
    './style.css',
    './script.js',
    './pwa.js',
    './sw.js',
    './site.webmanifest',
    './favicon.ico',
    './favicon/android-chrome-192x192.png',
    './favicon/android-chrome-512x512.png',
    './favicon/apple-touch-icon.png',
    './favicon/favicon-16x16.png',
    './favicon/favicon-32x32.png'
]
self.addEventListener('install', (e) => {
    e.waitUntil(
        (
            async() => {
                const cache = await caches.open("cps");
                await cache.addAll(assets)
                console.log("contents has been cached");
            }
        )()
    )
})

self.addEventListener('fetch', (e) => {
    e.respondWith(
        (
            async() => {
                const res = await caches.match(e.request)
                if (res) { return res }
                const response = await fetch(e.request);
                const cache = await caches.open("cps");
                await cache.put(e.request, response.clone())
                return response;

            }
        )()
    )
})