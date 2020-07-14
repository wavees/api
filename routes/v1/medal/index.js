// @section import 
// Here we'll import all needed modules and
// components.

// Express router
const router    = require('express').Router();

const axios     = require('axios');
const config    = require('config');

const helpers   = {
  getMedal: require('../../../helpers/medals/getMedal')
};

// Get Medal Info
router.get('/:id', (req, res) => {
  let id = req.params.id;

  // Let's now just get this medal...
  helpers.getMedal(id)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.code == null ? 500 : error.code).end(JSON.stringify(error));
  })
});

module.exports = router;