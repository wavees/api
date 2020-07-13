const express    = require('express');
const app        = express();
const path       = require('path');
const fileUpload = require('express-fileupload');
require('dotenv').config();

const { PORT, DEV } = process.env;

// HELPERS
const helpers = {
  walk: require('./helpers/files/walk')
};

const bodyParser = require('body-parser');
const cors = require('cors');

app.use(express.static('static'));
app.use(fileUpload());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

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

const listener = app.listen(3003, function() {
  console.log("wv-core application is listening on " + listener.address().port);
});