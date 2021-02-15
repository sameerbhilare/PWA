/*
  open an indexedDB database and also create an object store.
  'idb' object is accessible here because we have imported it above using importScripts()
*/
// 'posts-store' database name
var dbPromise = idb.open('posts-store', DB_VERSION, (db) => {
  // this callback function will get executed whenever database is created
  // 'post' is object store like a table.
  if (!db.objectStoreNames.contains('posts')) {
    // create object store if one does not already exist
    db.createObjectStore('posts', {
      keyPath: 'id', // primary key
    });
  }
});

function writeData(storeName, data) {
  return dbPromise.then((db) => {
    // indexeddb works with transactions. We have to use it.
    // which store we want to target for this transaction - storeName
    // wihch kind of transaction is this - e.g. readwrite
    var tx = db.transaction(storeName, 'readwrite');
    // explictly open the store
    var store = tx.objectStore(storeName);
    // store data in database against 'id' key (defined above in 'keyPath' property)
    store.put(data);
    return tx.complete; // close the transaction
  });
}
