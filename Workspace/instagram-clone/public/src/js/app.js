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
