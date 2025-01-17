const router  = require('express').Router();
const cache    = require('apicache');

cache.options({
  appendKey: (req, res) => req.token
});

const actions = {
  getAccount: require('../../../actions/account/get'),
  createAccount: require('../../../actions/account/create')
};

// Get account's information
// cache.middleware('1 day')
router.get('/', (req, res) => {
  const token = req.token;

  // req.apicacheGroup = `accountInformation/${token}`;

  // And now let's just call our action function.
  actions.getAccount(token)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

// Create account
router.post('/', (req, res) => {
  const body = req.body;

  // And now let's just call our action function.
  actions.createAccount(body)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

module.exports = router;