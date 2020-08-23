const router = require('express').Router();

const actions = {
  getList: require('../../../actions/organizations/getList')
};

router.get('/', (req, res) => {
  const token = req.token;

  actions.getList(token)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

module.exports = router;