var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

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
window.addEventListener('beforeinstallprompt', (event) => {
  console.log('beforeinstallprompt fired ...', event);
  // Prevent the mini-infobar from appearing on mobile
  event.preventDefault();
  // Stash the event so it can be triggered later.
  // we are using this stashed event 'deferredPrompt' in the feed.js openCreatePostModal() function
  // as we want to show the Install Banner on click of  Add Post (+) button on main page.
  deferredPrompt = event;
  // don't do anything.
  return false;
});

/*
  Show 'Enable Notifications' button if browser supports it.
*/
if ('Notification' in window) {
  for (var i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
  }
}

/*
  Theoretically if we want to display a notification, the browser will automatically prompt the user.
  But it's better if we do it manually which allows us to handle the user response 
  and of course control when we in the end ask for it.

  If the user block permissions, we can't even ask again. 
  If it permission requested is just undecided and user closed the tab or something like that, 
  he'll get asked next time again but nothing more we can do.
  So we should try to pick the best possible point of time for asking the permission.
*/
function askForNotificationPermission() {
  Notification.requestPermission((result) => {
    console.log('User Choice', result);
    if (result !== 'granted') {
      console.log('No Notification Permission granted!');
    } else {
      // we are good to display notifications :)
      // You can hide the 'Enable Notifications' button if you want.
      displayConfirmNotification();
    }
  });
}

// function to display a notification
function displayConfirmNotification() {
  // to show the notification
  // simple notification
  new Notification('You have successfully subscribed! :)');
  // Notification with a body
  var options = {
    body: 'You have successfully subscribed to our Notification Service. Thank you.',
  };
  new Notification('You have successfully subscribed! :)', options);
}

/*
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
*/
