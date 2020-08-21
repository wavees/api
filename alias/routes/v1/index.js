const router  = require('express').Router();
const cache   = require('apicache');

const actions = {
  getAlias: require('../../actions/getAlias')
};

router.get('/:appId/alias/:alias', cache.middleware('1 day'), (req, res) => {
  const alias = req.params.alias;
  const appId = req.params.appId;

  req.apicacheGroup = `alias/${appId}/${alias}`;

  // Let's just get this alias...
  actions.getAlias(alias, appId)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

module.exports = router;