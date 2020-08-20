const router = require('express').Router();

const actions = {
  retrieveToken: require('../../../actions/tokens/retrieveToken')
};

router.get('/:token', (req, res) => {
  const token = req.params.token;

  actions.retrieveToken(token)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

module.exports = router;