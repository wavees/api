const app        = require('express')();
const bodyParser = require('body-parser');
const path       = require('path');
const cors       = require('cors');
const bearerToken = require('express-bearer-token');

const http       = require('http').createServer(app);
const io         = require('socket.io')(http);

const socket     = require('./socket');

const createAccount  = require('./actions/account/create');
const getAccount     = require('./actions/account/get');

// Socket io route.
io.on('connection', (e) => {
  let authorized = false;

  e.on('authorize', (data) => {
    if (authorized) return;

    // Let's try to authorize our socket...
    getAccount(data.token)
    .then((response) => {
      const user = response;

      if (user.uid != null) {
        authorized = true;

        // And now let's reply with user
        // information...
        e.emit('account', user);
        e.emit('authorized', true);
        socket(e, user);
      };
    }).catch((error) => {
      console.log("ERROR 01");
      console.log(error);
    });
  });

  e.on('register', (data) => {
    if (authorized) return;

    // Let's try to register our user...
    createAccount(data)
    .then((response) => {
      const user = response.user;

      if (user.uid != null) {
        authorized = true;

        // And now let's reply with
        // our new user information.
        e.emit('authorized', true);
        e.emit('accountCreation', response);
        socket(e, user);
      };
    }).catch((error) => {
      console.log("ERROR 02");
      console.log(error);
    });
  });
});

const helpers    = {
  walk: require('./helpers/walk')
};

app.use(bearerToken());
app.use(bodyParser.json());
app.use(cors());

// And now let's load all our routes...
helpers.walk('./routes', (error, files) => {
  files.forEach((element) => {
    let route = require(element);
    let filePath = path.relative(__dirname + '/routes', element);
    let url = filePath.split('.').shift();

    if (!url.includes("_")) {
      try {
        if (url.includes("index")) {
          url = path.dirname(filePath);
        };

        app.use(`/${url == "." ? "" : url}`, route)
      }

      // Lock at this! It's a very complicated logging system!1!!
      catch(error) {
        console.log(error);
      }
    }
  })
});

const listener = http.listen(process.env.PORT || 8080, () => {
  console.log("[app] Started Blog API Application on port " + listener.address().port);
});