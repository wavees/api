const router = require('express').Router();
const config = require('config');

router.get('/', (req, res) => {
  let projects = config.get('network.projects');
  res.end(JSON.stringify(projects));
});

module.exports = router;