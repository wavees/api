const router  = require('express').Router();
const cache   = require('apicache');

const actions = {
  getAlias: require('../../actions/getAlias')
};

router.get('/:alias', cache.middleware('1 day'), (req, res) => {
  const alias = req.params.alias;
  const token = req.token;

  req.apicacheGroup = `alias/${alias}`;

  // Let's just get this alias...
  actions.getAlias(alias, token)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

module.exports = router;