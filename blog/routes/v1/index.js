const router = require('express').Router();

const functions = {
  checkFollow: require('../_functions/user/checkFollow.js'),
  follow: require('../_functions/user/follow.js'),

  getFollowers: require('../_functions/user/getFollowers.js')
};

// Check Follower
router.get('/:uid/follows/:aid', (req, res) => {
  // User Id;
  const uid = req.params.uid;
  const aid = req.params.aid;

  functions.checkFollow(uid, aid)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : 404).end(JSON.stringify(error));
  });
}); 

// Follow User
router.post('/:uid/follow/:aid', (req, res) => {
  // Get UID and AID
  const uid = req.params.uid;
  const aid = req.params.aid;

  functions.follow(uid, aid)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

// Get Followers Count
router.get('/:aid/followers', (req, res) => {
  // Get AID
  const aid = req.params.aid;

  functions.getFollowers(aid)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

module.exports = router;