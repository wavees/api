const router = require('express').Router();
const test = require('../applications/create.js');

router.get('/', (req, res) => {
  res.status(404);
  res.end(JSON.stringify({ error: "Nothing found" }));
});

router.get('/test', (req, res) => {
  let token = test();
  
  res.end(token);
});

module.exports = router;