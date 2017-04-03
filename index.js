var express = require('express');
var app = express();
var validURL = require('valid-url');
var mongowrap = require('./scripts/mongowrap.js');
var urlCounter = 0;

// Use connect method to connect to the Server
// Initial query to mongodb to check the # of existing urls.
mongowrap.getSize(function(size) {
  urlCounter = size;
  console.log("URL COUNTER IS " + urlCounter);
});

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/new/*', function(request, response) {
  // Process the url into mongodb.
  if (validURL.isUri(request.params['0'])) {
    mongowrap.addEntry(urlCounter, request.params['0'], function(shortID) {
      urlCounter++;
      var temp = {'original_url':request.params['0'], 'short_url': 'https://url-shortener-decky.herokuapp.com/' + shortID};
      response.send(temp);
    });
  } else {
    // Not valid URL, send Error
    response.send({"ERROR": "Invalid URL"});
  }
});

app.get('/:INTEGER', function(request, response) {
  // Retrieve the original url from the db and send the page to the user.
  mongowrap.retrieveEntry(parseInt(request.params.INTEGER), function(fullURL) {
    response.redirect(fullURL);
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
