var version = 'v1::'; //Version of cache

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(function() {
    console.log('service worker registration complete.');
  }, function() {
    console.log('service worker registration failure.');
  });
} else {
  // console.log('service worker is not supported.');
}

self.addEventListener("install", function(event) {
  // console.log('install event in progress.');
  event.waitUntil(
    caches.open(version + 'fundamentals')
    .then(function(cache) {
      return cache.addAll([
        '/css/styles.css',
        '/js/main.js',
        '/index.html',
        '/restaurant.html',
        '/img/1.jpg',
        '/img/2.jpg',
        '/img/3.jpg',
        '/img/4.jpg',
        '/img/5.jpg',
        '/img/6.jpg',
        '/img/7.jpg',
        '/img/8.jpg',
        '/img/9.jpg',
        '/img/10.jpg',
        '/js/dbhelper.js',
        'data/restaurants.json',
        '/js/restaurant_info.js',
      ]);
    })
    .then(function() {
      console.log('WORKER: install completed');
    })
  );
});


self.addEventListener("fetch", function(event) {
  //console.log('fetch event in progress.');

  if (event.request.method !== 'GET') {

    return;
  }

  event.respondWith(
    caches.match(event.request)
    .then(function(cached) {
      var networked = fetch(event.request)
        .then(fetchedFromNetwork, unableToResolve)
        .catch(unableToResolve);

      console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
      return cached || networked;

      function fetchedFromNetwork(response) {
        var cacheCopy = response.clone();

        //   console.log('WORKER: fetch response from network.', event.request.url);

        caches.open(version + 'pages')
          .then(function add(cache) {

            cache.put(event.request, cacheCopy);
          })
          .then(function() {
            console.log('WORKER: fetch response stored in cache.', event.request.url);
          });

        return response;
      }

      function unableToResolve() {
        console.log('WORKER: fetch request failed in both cache and network. ' + err);


        return new Response('<h1>Service Unavailable</h1>', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/html'
          })
        });
      }
    })
  );
});

self.addEventListener("activate", function(event) {

  console.log('WORKER: activate event in progress.');

  event.waitUntil(
    caches.keys()
    .then(function(keys) {
      return Promise.all(
        keys
        .filter(function(key) {
          return !key.startsWith(version);
        })
        .map(function(key) {

          return caches.delete(key);
        })
      );
    })
    .then(function() {
      console.log('WORKER: activate completed.');
    })
  );
});