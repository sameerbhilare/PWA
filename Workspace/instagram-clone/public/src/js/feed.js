var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');
var videoPlayer = document.querySelector('#player');
var canvasEle = document.querySelector('#canvas');
var captureBtn = document.querySelector('#capture-btn');
var imagePicker = document.querySelector('#image-picker');
var imagePickerArea = document.querySelector('#pick-image');

// initialize the camera or the image picker depending on the features the given device supports.
// enable the camera in a progressive way, that it works on as many devices as possible
function initializeMedia() {
  /*
    Media devices is the API which gives us access to the device camera and also to the microphone.
    So all the media input a device can generate and that typically is audio or video, video includes images.
  */
  if (!('mediaDevices' in navigator)) {
    // if not supported, create a kind of polyfill to extend the support
    navigator.mediaDevices = {};
  }

  if (!('getUserMedia' in navigator.mediaDevices)) {
    /* 
     Polyfill/rebuilding the native get user media function
     if not supported, take advantage of older camera access implementations we used in the past.
     'constraints' means whether its audio or video.
     Actually some older or other browsers have their own native implementations 
     which pretty much do the same and we can bind them to this modern syntax 
     so that in the rest of our application, we can only use that modern syntax.
    */
    navigator.mediaDevices.getUserMedia = (constraints) => {
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia; // webkit for safari, moz for mozilla

      if (!getUserMedia) {
        // return rejected promise because the modern browsers which support getUserMedia return a promise
        // so our this custom implemention must return a promise.
        return Promise.reject(new Error('getUserMedia is not implemented.'));
      }

      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  // at this point we have access to the getUserMedia API
  // Try to get access to the video on that device. So browser will ask for permission
  // if access granted, then then() block will be called, else catch() block will be called.
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((stream) => {
      // 'stream' is video stream. Pass it onto our video DOM element
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = 'block';
    })
    .catch((err) => {
      // show fallback impage picker
      imagePickerArea.style.display = 'block';
    });
}

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  // settimeout is just to make css aware that 'display' and 'transform' are 2 different steps
  // setTimeout(() => {
  createPostArea.style.transform = 'translateY(0)';
  // }, 1);
  initializeMedia();
  // deferredPrompt is set in app.js
  if (deferredPrompt) {
    // show the App install banner.
    deferredPrompt.prompt();

    // check user's choice
    deferredPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult);
      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled the install.');
      } else {
        console.log('User added to home screen.');
      }
    });
  }

  // for testing only. This is not appropriate place to unregister a service worker.
  // unregisterServiceWorker();
}

/*
  Unregister Service Worker.
  You can call this function from appropriate place.
*/
function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (var i = 0; i < registrations.length; i++) {
        registrations[i].unregister();
      }
    });
  }
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';
  // createPostArea.style.display = 'none';
  // cleanup
  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvasEle.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// Cache on Demand - Simulation
/*
function onSaveButtonClicked(event) {
  // first of all check if the browser supports 'caches'
  if ('caches' in window) {
    caches.open('user-requested').then((cache) => {
      // fetch from server and then add the request and response in the cache
      cache.add('https://httpbin.org/get'); // this is what is fetched in the card
      cache.add('/src/images/sf-boat.jpg'); // this is requested in the card
    });
  }
}
*/

function clearCard() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("' + data.image + '")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.backgroundPosition = 'center'; // Or 'bottom'
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // Cache on Demand - Simulation
  /*
  var cardSaveButton = document.createElement('button');
  cardSaveButton.textContent = 'Save';
  cardSaveButton.addEventListener('click', onSaveButtonClicked);
  cardSupportingText.appendChild(cardSaveButton);
  */
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCard(); // clear duplicate card if already added from cache below
  for (let i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

/* ==============================
 * Strategy: Cache then Network
   Belo code is for GET Request.
   For POST request, 
    use url => https://httpbin.org/post
    and change the fetch call to 
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: {
          message: JSON.stringify({ message: 'Some message' }),
        },)
 */
// added .json at the end as it is requirement from firebase
var url = 'https://pwa-gram-bcf78-default-rtdb.europe-west1.firebasedatabase.app/posts.json';
// this flag is used to check if response from server is received before we could serve from cache.
// in that case, we should not use the cached response.
var serverResponseReceived = false;
fetch(url)
  .then(function (serverResponse) {
    return serverResponse.json();
  })
  .then(function (data) {
    serverResponseReceived = true;
    console.log('From Server', data);
    // convert JS object to array
    var dataArry = [];
    for (var key in data) {
      dataArry.push(data[key]);
    }
    updateUI(dataArry);
  });

/*
  In the service worker, we don't need check whether we have access to indexedDB 
  because in service workers, we have the access and we have already a check present if the browser supports Service worker itself.
  But here in the feed.js file, we might not have that access because maybe we're in a browser which doesn't support indexedDB.
*/
if ('indexedDB' in window) {
  readAllData('posts').then((dataArr) => {
    if (!serverResponseReceived) {
      console.log('From indexedDB', dataArr);
      updateUI(dataArr);
    }
  });
}

// fallback logic if Background sync is not supported by browser
function sendData() {
  fetch('https://pwa-gram-bcf78-default-rtdb.europe-west1.firebasedatabase.app/posts.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      id: new Date().toISOString(), // unique id
      title: titleInput.value,
      location: locationInput.value,
      image:
        'https://firebasestorage.googleapis.com/v0/b/pwa-gram-bcf78.appspot.com/o/sf-boat.jpg?alt=media&token=5347a729-2874-4746-a2bd-2fd211a3a587', // dummy right now
    }),
  }).then((res) => {
    console.log('Sent data', res);
    // reload page
    updateUI();
  });
}

form.addEventListener('submit', (event) => {
  // avoid page reload
  event.preventDefault();

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid data!');
    return;
  }

  // close modal
  closeCreatePostModal();

  /*
    SyncManager is basically the API through which we use the background synchronization features.
    check first if the browser supports 'SyncManager' and 'serviceWorker'
  */
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    /* 
      Make sure that serviceWorker has been configured, installed and activated
      and that it is ready to take some input.
      The reason why we are doing it here and not in Service Worker is 
      because the event which triggers the background synchronization set up happens in the feed.js file. 
      We can't listen to that event in the service worker because we can't listen to the form submission there.
      So this is the way we get access to service worker from normal javascript file.
    */
    navigator.serviceWorker.ready.then((sw) => {
      // wrap the data you want to sync
      var post = {
        id: new Date().toISOString(), // unique id
        title: titleInput.value,
        location: locationInput.value,
      };

      // save this data in the indexedDB so that we can fetch it in service worker for background sync
      // The reason we have to save it in indexedDB like this is SyncManager does not have inbuilt database.
      writeData('sync-posts', post)
        .then(() => {
          /*
          Register a synchronization task with the service worker for a specific 'tag' - here it is 'sync-new-post'.
          The input is an ID, a tag we can use to clearly identify a given synchronization task.
          We'll later use that in the service worker to react to re-established connectivity 
          and check which outstanding tasks we have and then we can use the tag to find out what we need to do with the task.
          */
          return sw.sync.register('sync-new-posts');
        })
        .then(() => {
          // after succesful background sync registration, show message to user (using material design lib)
          var snackbarContainer = document.querySelector('#confirmation-toast');
          var data = { message: 'Your post is saved for synching!' };
          snackbarContainer.MaterialSnackbar.showSnackbar(data);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  } else {
    // fallback logic if Background sync is not supported by browser
    sendData();
  }
});
