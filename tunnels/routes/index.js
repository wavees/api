const router = require('express').Router();

router.get('/', (req, res) => {
  res.end("Yeah");
});

module.exports = router;