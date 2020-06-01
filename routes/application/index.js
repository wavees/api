const router  = require('express').Router();

const axios   = require('axios');
const config  = require('config');
// const helpers = {
//   getEntity: require('../../helpers/entities/get') 
// };

router.get('/:appId', (req, res) => {
  let appId = req.params.appId;

  // Let's get an application with this id...
  let query = {
    $$storage: "applications",
    $$findOne: true,
    _id: appId
  };

  // console.log(query);
  axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
  .then((response) => {
    let data = response.data;

    if (data.error != "404") {
      res.end(JSON.stringify(data));
    } else {
      res.status(404).end(JSON.stringify({ error: "NotFound" }));
    }
  }).catch((error) => {
    res.status(500).end(JSON.stringify({ error: "ServerError" }));
  });

  // helpers.getEntity(query)
  // .then((response) => {
  //   console.log(response.data);
  //   res.end(JSON.stringify(response.data))
  // }).catch((error) => {
  //   res.status(error == "NotFound" ? 404 : 500).end(JSON.stringify({ error }));
  // })
});

module.exports = router;