/*
    The scope by default always is the folder the service worker sits in. 
    So if we add it to the /js folder, the service worker will only apply to HTML pages inside that folder. 
    (Here /js is a wrong place as it will not have any html pages, but will have only .js files.)

    We typically add the service worker file in the root folder 
    so that it applied to all HTML pages in the application. E.g. /public.

    Service workers are running in the background and are all about handling events.
    Therefore, we always attach event listeners to the service worker, we simply react to events.

    'self' basically means please give me access to the service worker so to this background process.
    Here we don't have access to DOM events as service workers don't have access to DOM itself.
*/

// ======================================================
// LIFE CYCLE EVENTS
// ======================================================

// 'install' event when browser installs the service worker.
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker ...', event);

  // During 'install' event, we should be precaching the App Shell i.e. the static content.
  /*
    If it already exists, it will open it.
    If you try to open a cache which does not exist yet, it will create it.
    event.waitUntil() waits until caches.open (which returns a promise) is finished.

    Why should we use event.waitUntil()? 
    Remember in a service worker, we work with asynchronous code because it's running in the background 
    and it's event driven. Therefore the install event doesn't wait for cache.open to finish by default 
    (as it returns promise). It would just see install event, trigger this operation and continue.
    And this can lead to huge problems because once the service worker installation finishes, 
    you might have a fetch listener, you do fetch a resource and you try to get it from the cache 
    even though your caching operation hasn't finished yet. 
    So this can lead to problem. Hence use event.waitUntil
  */
  event.waitUntil(
    // 'caches' refers to overall Cache Storage
    caches.open('static').then((cache) => {
      // caches.open() returns a reference to the cache so that we can add content/files to this cache
      console.log('[Service Worker] Precaching App Shell.');

      /*
        Make a request to given file, download it and stores both 'request' and 'response' values in the cache.
        Think of these as 'requests' not paths. 
        Just cachig '/index.html' is not enough, we have to also cache '/' 
        because we enter http://localhost:8080 in the URL which behind the scenes returns index.html page.
        Hence we must cache the 'request' for '/' in addition to the 'request' for '/index.html'
      */
      cache.add('/');
      cache.add('/index.html');
      cache.add('/src/js/app.js');
    })
  );
});

// 'activate' event when the installed service worker is activated.
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker ...', event);

  /*
    Below line basically ensures that the service workers are loaded or are activated correctly. 
    It should work without that line but it can fail from time to time or behave strangely.
    Adding this line simply makes it more robust, might not be needed in the future.
  */
  return self.clients.claim();
});

// ======================================================
// NON-LIFE CYCLE EVENTS
// ======================================================
// 'fetch' event will get triggered whenever our web application fetches something.
/* 
    fetch event will be emitted when the HTML pages for example load assets like the scripts 
    or like our CSS code through links or when they load an image thru <img> tag.
    It will also trigger if we manually send a fetch request in the app.js file.
*/
self.addEventListener('fetch', (event) => {
  //console.log('[Service Worker] Fetching something ...', event);

  /*
    Every outgoing fetch request goes through the service worker and so does every response.
    event.respondWith() allows us to overwrite the data which gets sent back. Basically, we intercept the fetch request from browser.
    We intercept this request and can return different things depending on whether we have online access,
    if we have internet access or not. We'll then use respondWith to simply check the internet connection 
    basically and return stuff from our cache or from the network.
  */

  // event.respondWith(null); // don't do anything.Reload your app to see the behavior.

  // this line as same as not having this line :) bcz this is what browser will anyway do, i.e. fetch the requested asset
  // event.respondWith(fetch(event.request));

  /*
    In the fetch event listener of the service worker, 
    make sure we actually fetch the data from our cache if available. 
  */
  // match() will have a look for given 'request' at all our sub-caches and see if we find a given resource there.
  // Note - the key in the cache is always a 'request' not a string.
  event.respondWith(
    caches.match(event.request).then((response) => {
      // if match() doesn't find a match, it resolves. i.e. the 'response' will be null
      if (response) {
        // returning value from the cache
        return response;
      } else {
        // if not found in cache, then continue. i.e. make a network request
        return fetch(event.request);
      }
    })
  );
});
