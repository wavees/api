// @type Chat
// module: "Give me some data and
// I'll transform it in typed data format!"

module.exports = (data) => {
  // Default chat type
  let chat = {
    // Chat Id
    id: data,

    // Chat name
    name: data,

    // Chat Avatar
    avatar: data,

    // OwnerId
    ownerId: data,

    // Members List
    members: data,

    // Invitations list,
    invitations: data,

    // Settings
    settings: data
  };

  return chat;
};