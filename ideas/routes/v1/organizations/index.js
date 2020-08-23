const router = require('express').Router();
const cache  = require('apicache');

cache.options({
  appendKey: (req, res) => req.token
})

const actions = {
  getList: require('../../../actions/organizations/getList'),
  createOrganization: require('../../../actions/organizations/create')
};

// Get Organizations
router.get('/', cache.middleware('1 day'), (req, res) => {
  const token = req.token;
  req.apicacheGroup = `org-${token}`;

  actions.getList(token)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

// Create Organization
router.post('/', (req, res) => {
  const token = req.token;
  const configuration = req.body;

  actions.createOrganization(token, configuration)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

module.exports = router;