const axios          = require('axios');
const config         = require('config');

const getInvitations = require('../invitations/get');

module.exports = (cid) => {
  return new Promise((resolve, reject) => {
    // Let's now prepare our request.
    let request = {
      $$storage: "flow-chats",
      $$findOne: true,

      _id: cid
    };

    // And now let's just make our request
    // and return chat information.
    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
    .then((response) => {
      const data = response.data;

      if (data.error == "404") {
        reject({ status: 404, error: "NotFound" });
      } else {
        // Let's now prepare our returnData
        // structure and return it.
        const chat = {
          id: cid,

          name: data.name || "Unknown Chat",

          creationDate: data.creationDate,
          avatar: data.avatar,

          ownerId: data.ownerId,
          members: [],

          invitations: [],

          settings: {}
        };

        // And now we need to find this
        // chat's members...
        let request = {
          $$storage: "flow-chatMembership",

          // Chat Id
          cid
        };

        axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
        .then((response) => {
          // Let's now add all user ids in members array
          if (response.data.length > 0) {
            response.data.forEach((member) => {
              if (!chat.members.includes(member.uid)) chat.members.push(member.uid);
            });
          };

          // Let's check if our members array contains ownerId;
          if (!chat.members.includes(chat.ownerId)) chat.members.push(chat.ownerId);

          // And now we need to get this chat's invitations...
          getInvitations(cid)
          .then((response) => {
            chat.invitations = response;

            resolve(chat);
          }).catch(() => {
            reject({ status: 500, error: "ServerError" });
          });  
        }).catch(() => {
          reject({ status: 500, error: "ServerError" });
        });
      };
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
}