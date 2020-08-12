const router = require('express').Router();

const functions = {
  alias: {
    retrieve: require('../../_functions/author/alias/retrieve.js'),
    change: require('../../_functions/author/alias/change.js'),

    getAuthor: require('../../_functions/author/alias/getAuthor.js')
  },

  getFollowers: require('../../_functions/author/getFollowers.js')
};

// Get Followers Count
router.get('/:aid/followers', (req, res) => {
  // Get AID
  const aid = req.params.aid;

  functions.getFollowers(aid)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

// Get Author Alias
router.get('/:uid/alias', (req, res) => {
  const aid = req.params.aid;

  functions.alias.retrieve(aid)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

// Change Author Alias.
router.put('/:token/alias', (req, res) => {
  const token = req.params.token;
  const alias = req.body.alias;

  functions.alias.change(token, alias)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

// Get Author by Alias.
router.get('/:alias', (req, res) => {
  const alias = req.params.alias;

  functions.alias.getAuthor(alias)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

module.exports = router;