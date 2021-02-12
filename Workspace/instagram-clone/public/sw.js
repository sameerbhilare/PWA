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
    // 'caches' refers to overall Cache Storage. You can give any name for your static cache.
    caches.open('static').then((cache) => {
      // caches.open() returns a reference to the cache so that we can add content/files to this cache
      console.log('[Service Worker] Precaching App Shell.');

      /*
        PRE-CACHING / STATIC CACHING -
        Make a request to given file, download it and stores both 'request' and 'response' values in the cache.
        Think of these as 'requests' not paths. 
        Just cachig '/index.html' is not enough, we have to also cache '/' 
        because we enter http://localhost:8080 in the URL which behind the scenes returns index.html page.
        Hence we must cache the 'request' for '/' in addition to the 'request' for '/index.html'

        We need the polyfills promise.js and fetch.js for legacy browsers 
        but those browsers won't support service workers anyways, so there's no value in storing these files.
        However since these files are also referenced in the index.html, 
        we can precache those as they will anyway be loaded since they are part of index.html

        We are not pre-caching /html/index.html and /src/css/help.css because we want to cache only bare minimum.
        We want to store the bare minimum app shell so as to make our first page run.

        For the icons, you don't really need to pre-cache those. 
        Yes, you won't be able to add it to the homescreen if you don't pre-cache the icons 
        but that shouldn't be an issue because offline support shouldn't be the permanent state of our application.

        We also need to precache the things we get from CDNs, like the styling package or the fonts 
        and image icon sets which are referenced in the /index.html.
        One important restriction though - if you don't want to get an error while fetching from CDNs, 
        the CDN servers you are pre-caching from should set the CORS headers to allow cross-origin-access to these files.
        If they don't, this will throw an error.
        */
      cache.addAll([
        '/',
        '/index.html',
        '/src/js/app.js',
        '/src/js/feed.js',
        '/src/js/material.min.js',
        '/src/js/promise.js', // not required for browsers supporting SW. See above comment for details.
        '/src/js/fetch.js', // not required for browsers supporting SW. See above comment for details.
        '/src/css/app.css',
        '/src/css/feed.css',
        '/src/images/main-image.jpg', // only this image because this is the only static image used in /index.html page
        'https://fonts.googleapis.com/css?family=Roboto:400,700', // CDN Font
        'https://fonts.googleapis.com/icon?family=Material+Icons', // CDN icons
        'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css', // CDN css
      ]);
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
    caches.match(event.request).then((cachedResponse) => {
      // if match() doesn't find a match, it resolves. i.e. the 'response' will be null
      if (cachedResponse) {
        // returning value from the cache
        return cachedResponse;
      } else {
        // if not found in cache, then continue. i.e. make a network request
        // DYNAMIC CACHING - fetch resource from server and store it in the cache, dynamically.
        return fetch(event.request).then((fetchedResponse) => {
          // you can give any name for your dynamic cache.
          // calling return as we are returning fetchedResponse below
          return caches.open('dynamic').then((cache) => {
            /* For the response, if we store it in cache, it is basically consumed which means it's empty.
               This is how responses work. You can only consume/use them once 
               and storing them in the cache uses the response. 
               So we should store the cloned version of response
            */
            cache.put(event.request.url, fetchedResponse.clone());
            // return response
            // otherwise first request(actual network all) will fail, though the response will be cached
            //           and on next request content will be served from cache.
            return fetchedResponse;
          });
        });
      }
    })
  );
});
