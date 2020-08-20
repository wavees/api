const router = require('express').Router();

router.get('/', (req, res) => {
  res.end(JSON.stringify({ hello: "There" }));
});

module.exports = router;