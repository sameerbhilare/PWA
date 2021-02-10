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
