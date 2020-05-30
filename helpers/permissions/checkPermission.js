module.exports = (permissions, permission) => {
  // And now let's find that permission in permissions
  // object

  if (permissions.includes(permission)) {
    return true;
  } else {
    return false;
  };
};