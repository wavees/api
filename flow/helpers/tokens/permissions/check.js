module.exports = (tokenData, permission) => {
  let permissions = tokenData.data.permissions;

  console.log(permissions);
  return true;
};