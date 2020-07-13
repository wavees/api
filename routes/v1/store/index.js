const router  = require('express').Router();

const helpers = {
  getToken: require('../../../helpers/tokens/get'),

  createStore: require('../../../helpers/stores/create'),
  getStore: require('../../../helpers/stores/get'),
}

// 
// GET /store/:token/:query
// 
router.get('/:token/:query', (req, res) => {
  let token = req.params.token;
  let query = req.params.query;

  // Let's parse query string.
  try {
    const decoded = JSON.parse(query);

    // Let's get that store data
    // and than reply.
    helpers.getStore(token, decoded)
    .then((response) => {
      let data = response;
      
      res.end(JSON.stringify(data));
    }).catch((error) => {
      res.status(error == "InvalidToken" ? 400 : 500).end(JSON.stringify({ error: error }));
    });
  } catch(error) {
    console.log(error);
    res.status(400).end(JSON.stringify({ error: "InvalidQuery", message: error }));
  };
});

// 
// POST /store/:token
// 
router.post('/:token', (req, res) => {
  let token = req.params.token;
  let body  = req.body;

  // Let's create store
  helpers.createStore(token, body)
  .then((response) => {
    // Store successfully created, let's
    // send response.
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error == "InvalidToken" ? 400 : 500).end(JSON.stringify({ error: error }));
  });
});

module.exports = router;