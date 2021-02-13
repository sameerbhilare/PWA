var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
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
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
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

function createCard() {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'San Francisco Trip';
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'In San Francisco';
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

/* ==============================
 * Strategy: Cache then Network
 */
var url = 'https://httpbin.org/get';
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
    clearCard(); // clear duplicate card if already added from cache below
    createCard();
  });

if ('caches' in window) {
  caches
    .match(url)
    .then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse.json(); // bcz this particular url returns json data. see above fetch() call
      }
    })
    .then(function (data) {
      console.log('From Cache', data);
      if (!serverResponseReceived) {
        clearCard(); // clear duplicate card if already added from server response above
        createCard();
      }
    });
}
