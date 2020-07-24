// @section import 
// Here we'll import all needed modules and
// components.

// Express router
const router    = require('express').Router();

const axios     = require('axios');
const config    = require('config');

// Get Recent Primary Medals
router.get('/recent/primary', (req, res) => {
  // So, now let's just get all primary
  // medals.
  let query = {
    $$storage: "medals",
    type: "primary"
  };

  axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
  .then((response) => {
    let data = response.data;

    if (data.length >= 1) {
      // And now let's map all this medals and
      // just return them.
      res.end(JSON.stringify(data.map(medal => medal._id)));
    } else {
      res.end(JSON.stringify([]));
    };
  }).catch((error) => {
    res.end(JSON.stringify([]));
  });
});

module.exports = router;