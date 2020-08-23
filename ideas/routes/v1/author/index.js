const router = require('express').Router();
const events = require('../../../events/index.js');

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
  const uid = req.params.uid;

  functions.alias.retrieve(uid)
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
    // Let's now call our AliasChange event.
    events.emit("socketEvent", { event: "aliasChange", uid: response.uid, aid: response.uid, response: response });

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