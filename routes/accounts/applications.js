const router  = require('express').Router();
const config  = require('config');

const axios   = require('axios');
const helpers = {
  getToken: require('../../helpers/tokens/get.js'),

  getStore: require('../../helpers/stores/get')
};

router.get('/:token/:origin', (req, res) => {
  let token  = req.params.token;
  let origin = req.params.origin;

  helpers.getToken(token)
  .then((data) => {
    if (data.data.type == "user") {
      // Let's get that registrat...
      let query = {
        $$findOne: true,

        type: "disclaimer",
        registrat: {
          url: origin
        }
      };
      helpers.getStore(token, query)
      .then((response) => {
        let data = response;

        if (data.error == "404") {
          res.end(JSON.stringify({}));
        } else {
          let response = {
            agreed: true,

            registrat: data.registrat
          };

          res.end(JSON.stringify(response));
        }
      }).catch((error) => {
        res.status(error == "InvalidToken" ? 400 : 500).end(JSON.stringify({ error: error }));
      });
    } else {
      res.status(400).end(JSON.stringify({ error: "InvalidToken" }));
    }
  }).catch((error) => {
    console.log(error);
    res.status(500).end(JSON.stringify({ error: "ServerError", message: error }));
  })
});


module.exports = router;