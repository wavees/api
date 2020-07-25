const app        = require('express')();
const bodyParser = require('body-parser');
const path       = require('path');

const helpers    = {
  walk: require('./helpers/walk')
};

app.use(bodyParser.json());

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

app.listen(process.env.PORT || 8080, () => {
  console.log("[app] Started Tunnels API Application on port " + listener.address().port);
});