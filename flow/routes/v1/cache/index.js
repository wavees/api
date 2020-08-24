const router = require('express').Router();
const cache  = require('apicache');

// add route to display cache performance (courtesy of @killdash9)
router.get('/performance', (req, res) => {
  res.json(cache.getPerformance())
})

// add route to display cache index
router.get('/index', (req, res) => {
  res.json(cache.getIndex())
})

// add route to manually clear target/group
router.get('/clear/:target?', (req, res) => {
  res.json(cache.clear(req.params.target))
});

module.exports = router;