const router  = require('express').Router();

const actions = {
  getChats: require('../../../actions/chats/getAll'),
  createChat: require('../../../actions/chats/create')
};

// Get Chats
router.get(`/`, (req, res) => {
  const token = req.token;

  actions.getChats(token)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

// Create new Chat
router.post(`/`, (req, res) => {
  const token = req.token;
  const body  = req.body;

  actions.createChat(token, body)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

module.exports = router;