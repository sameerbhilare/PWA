// check if browser supports Promise, if not then use promise.js polyfill
if (!window.Promise) {
  window.Promise = Promise; // this 'Promise' is from promise.js polyfill
}

/*
    Check if the browser supports Service worker. 
    navigator is simply your browser.
    (checks if the navigator object has 'serviceWorker' property)
*/
if ('serviceWorker' in navigator) {
  // register the service worker.
  // sw.js file should be registered as a service worker, as a background process.
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => {
      console.log('Service Worker Registered!');
    })
    .catch((err) => {
      console.err('Could not register Service Worker. Error =>', err);
    });
} else {
  console.log('Service worker is not supported!');
}

/*
  Deferring Install Prompt: 
  Starting with Chrome version 68, Chrome will not automatically shows an "App Install Banner". 
  You instead have to listen to a 'beforeinstallprompt' event and then show the banner manually.
  This event is fired by Chrome right before it's about to show that install banner.
*/
// 'beforeinstallprompt' event
var deferredPrompt;
window.addEventListener('beforeinstallprompt', (event) => {
  console.log('beforeinstallprompt fired ...', event);
  // Prevent the mini-infobar from appearing on mobile
  event.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = event;
  // don't do anything.
  return false;
});

// ===========================
// creating promise
var promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    if (true) {
      // make it false to test 'reject' flow
      resolve('equal');
    } else {
      reject('not equal');
    }
  }, 2000);
});

// consuming promise
promise
  .then((result) => {
    console.log('Promise', result);
  })
  .catch((err) => console.log('Promise', err));

// ===========================
// using fetch to GET
fetch('http://httpbin.org/ip')
  .then((response) => {
    console.log(response);
    // It is an asynchronous operation though because it gets a readable stream
    return response.json();
  })
  .then((data) => {
    console.log('fetch', data);
  })
  .catch((err) => {
    console.log('fetch', err);
  });

// ===========================
// using fetch to POST
fetch('http://httpbin.org/post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  mode: 'cors', // response has to include the cors headers
  body: JSON.stringify({
    // since we are setting content type to json, we need to stringigy this JS object
    message: 'This is test message',
  }),
})
  .then((response) => {
    console.log('fetch', response);
    // It is an asynchronous operation though because it gets a readable stream
    return response.json();
  })
  .then((data) => {
    console.log('fetch', data);
  })
  .catch((err) => {
    console.log('fetch', err);
  });

// ===========================
// using AJAX
var xhr = new XMLHttpRequest();
xhr.open('GET', 'http://httpbin.org/ip');
xhr.responseType = 'json';

xhr.onload = function () {
  console.log('ajax', xhr.response);
};

xhr.onerror = function () {
  console.log('ajax error');
};

xhr.send();
