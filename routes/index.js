const router = require('express').Router();
const test = require('../helpers/stores/create.js');

router.get('/', (req, res) => {
  res.status(404);
  res.end(JSON.stringify({ error: "Nothing found" }));
});

module.exports = router;