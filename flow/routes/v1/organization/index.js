const router  = require('express').Router();
const cache   = require('apicache');

const actions = {
  getPolls: require('../../../actions/organizations/Polls/getList'),
  createPoll: require('../../../actions/organizations/Polls/createPoll')
};

cache.options({
  appendKey: (req, res) => req.token
});

// Get all Polls
router.get('/:organization/polls', cache.middleware('1 day'), (req, res) => {
  const token        = req.token;
  const organization = req.params.organization;

  req.apicacheGroup  = `polls-${organization}`;

  // Let's just get all polls for this
  // organization.
  actions.getPolls(token, organization)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

// Add new Poll
router.post('/:organization/polls', (req, res) => {
  const token        = req.token;
  const organization = req.params.organization;
  const body         = req.body;

  // And now let's just create new poll
  actions.createPoll(token, organization, body)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

module.exports = router;