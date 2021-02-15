var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  // settimeout is just to make css aware that 'display' and 'transform' are 2 different steps
  // setTimeout(() => {
  createPostArea.style.transform = 'translateY(0)';
  // }, 1);
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
