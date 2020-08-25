const axios  = require('axios');
const config = require('config');

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
          members: data.members || []
        };

        if (!chat.members.includes(chat.ownerId)) chat.members.push(chat.ownerId);

        resolve(chat);
      };
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
}