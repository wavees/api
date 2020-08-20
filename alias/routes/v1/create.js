const router       = require('express').Router();
const createAction = require('../../actions/createAlias');

router.post('/', (req, res) => {
  // Let's try to get our
  // application token.
  const token = req.token;

  // And now let's just call our
  // action...
  createAction(token, req.body)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

module.exports = router;