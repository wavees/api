const events  = require('../events/index.js');

const getOrganizations = require('../actions/organizations/getList');
const getPolls         = require('../actions/organizations/Polls/getList');

module.exports = (socket, user) => {
  // @action getOrganizations
  socket.on('get.organizations', () => {
    getOrganizations(user.token)
    .then((response) => {
      socket.emit('organizations', response);
    }).catch(() => {
      socket.emit('organizations', { error: true });
    });
  });

  // @action get polls
  socket.on('get.polls', (oid) => {
    getPolls(user.token, oid)
    .then((response) => {
      socket.emit('polls', response);
    }).catch(() => {
      socket.emit('polls', { error: true });
    });
  });

  // @event polls update
};