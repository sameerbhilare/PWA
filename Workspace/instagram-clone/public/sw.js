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
  event.respondWith(fetch(event.request));
});
