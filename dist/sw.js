const cacheName = "v1"; // you need a name for your cache. It also helps w. invalidation later.
const urlsToCache = ["./offline.html"];
const offlinePageURL = "./offline.html";

self.addEventListener("install", (event) => {
  // self is a global variable refers to worker itself
  event.waitUntil(
    // waitUntil tells the browser to wait for passed promise to settle
    caches
      .open(cacheName) // caches is a global object representing browser CacheStorage
      .then((cache) => {
        // once the cache named cacheName* is open you get it promise then
        return cache.addAll(urlsToCache); // pass the array of urlsToCache to cache**
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log(`SW: Event fired: ${event.type}`);
  event.waitUntil(
    // waitUntil tells the browser to wait for passed promise to finish
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== cacheName) {
            // compare key with our new cache Name in SW
            return caches.delete(key); // delete any cache with old name
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      try {
        return await fetch(event.request);
      } catch (error) {
        console.log("What happened to the request:",error);
        return caches.match(offlinePageURL);
      }
    })()
  );
});
