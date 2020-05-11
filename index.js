const app = require('express')();
const path = require('path');

// HELPERS
const helpers = {
  walk: require('./helpers/files/walk')
};

const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

helpers.walk('./routes', (error, files) => {
  files.forEach((element) => {
    let route = require(element);
    let url = path.relative(__dirname + '/routes', element).split('.').shift();
    
    try {
      app.use(`/${url == "index" ? "" : url}`, route);
    }

    // Lock at this! It's a very complicated logging system!1!!
    catch(error) {
      console.log(error);
    }
  })
});

const { PORT } = process.env;
const listener = app.listen(PORT, function() {
  console.log("wv-core application is listening on " + listener.address().port);
});