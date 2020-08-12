module.exports = (perms) => {
  // Now let's do something...
  let permissions = perms;
  
  return {
    has: (permission) => {
      return require('./checkPermission.js')(permissions, permission);
    },

    list: () => {
      return permissions;
    }
  };
};