const router  = require('express').Router();
const cache    = require('apicache');

cache.options({
  appendKey: (req, res) => req.token
});

const actions = {
  getChats: require('../../../actions/chats/getAll'),
  getChat: require('../../../actions/chats/get'),

  createChat: require('../../../actions/chats/create'),

  getInviteLinks: require('../../../actions/chats/invitations/getAll'),
  useInvite: require('../../../actions/chats/invitations/use'),
  
  checkPermission: require('../../../actions/chats/permissions/check'),
  changeName: require('../../../actions/chats/changeName'),

  getMessages: require('../../../actions/chats/messages/get'),
  sendMessage: require('../../../actions/chats/messages/send')
};

// Get Chat

// cache.middleware('1 day'),
router.get(`/:cid`, (req, res) => {
  const token = req.token;
  const cid   = req.params.cid;

  // req.apicacheGroup = `chatInformation/${cid}`;

  actions.getChat(token, cid)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

// Get Chats

// cache.middleware('1 day'),
router.get(`/`, (req, res) => {
  const token = req.token;

  // req.apicacheGroup = `chatList/${token}`;

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

// Get Invite Links

// cache.middleware('1 day'),
router.get(`/:cid/invites`, (req, res) => {
  const token = req.token;
  const cid   = req.params.cid;

  // req.apicacheGroup = `chatInvitations/${cid}`;

  actions.getInviteLinks(token, cid)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

// Use Invite words.
router.post(`/invite`, (req, res) => {
  const token = req.token;
  const body  = req.body;

  actions.useInvite(token, body.words)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
})

// Check permission

// cache.middleware('1 day'),
router.get('/:cid/permission/:pid', (req, res) => {
  const token = req.token;
  const cid   = req.params.cid;
  const pid   = req.params.pid;

  // req.apicacheGroup = `chatPermission/${token}-${cid}-${pid}`;

  actions.checkPermission(token, cid, pid)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

// Change Chat's name
router.put('/:cid/name', (req, res) => {
  const token = req.token;
  const cid   = req.params.cid;
  const name  = req.body.name;

  actions.changeName(token, cid, name)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});




// List all chat's messages.

// cache.middleware('1 day'),
router.get('/:cid/messages', (req, res) => {
  const token = req.token;
  const cid   = req.params.cid;
  const limit = req.params.limit;

  // req.apicacheGroup = `chatMessages/${cid}`;

  actions.getMessages(token, cid)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

// Send Message.
router.post('/:cid/messages', (req, res) => {
  const token   = req.token;
  const cid     = req.params.cid;
  const message = req.body;

  actions.sendMessage(token, cid, message)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

module.exports = router;