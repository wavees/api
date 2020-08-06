// @section import 
// Here we'll import all needed modules and
// components.

// Express router
const router    = require('express').Router();

const helpers   = {
  getToken: require('../_functions/accounts/providers/discord/getToken.js')
};

router.get('/', (req, res) => {
  let code = req.query.code;

  // Let's now get user token.
  helpers.getToken(code)
  .then((response) => {
    // And now let's redirect our user
    // to login page (with our token)
    res.redirect(`https://account.wavees.ml/authorize/provider/discord?token=${response.token}`);
  });
});

module.exports = router;