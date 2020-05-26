function makeSite() {
  // console.log('custom.js start');

  var url = window.location.href;
  var param = 'id';
  var regex = new RegExp('[?&]' + param + '(=([^&#]*)|&|#|$)');
  var results = regex.exec(url);
  var siteId = (results && results.length > 2) ? decodeURIComponent(results[2].replace(/\+/g, ' ')) : null;

  var getData = new Promise(function (resolve) {
    var defTags = '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
    var data = {
      head: defTags + '<title>Error. Site not found.</title>',
      body: '<h1>Error. Site not found.</h1>',
    };

    if (siteId !== null) {
      var openRequest = indexedDB.open("chdb", 1);
      openRequest.onsuccess = function () {
        // console.log('openRequest.onsuccess');
        var db = this.result;
        var transaction = db.transaction('sites', 'readonly');
        var sites = transaction.objectStore('sites');
        var request = sites.get(+siteId);
        request.onsuccess = function () {
          var site = this.result;
          // console.log('request.onsuccess:', site);
          if (site) data = {
            head: defTags + '<title>' + site.title + '</title>',
            body: site.body,
          };
          resolve(data);
        }
        request.onerror = function () {
          console.error("request.onerror", this.error);
          resolve(data);
        };
      }
      openRequest.onerror = function () {
        console.error("openRequest.onerror", this.error);
        resolve(data);
      };
    } else {
      console.error('regex results:', results);
      console.error('id=', siteId);
      resolve(data);
    }
  });

  getData.then(function (data) {
    document.head.innerHTML = data.head;
    document.body.innerHTML = data.body;
  });
}
