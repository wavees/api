const db = require('./db.js');

module.exports = (token) => {
  let application = db.get('list')
    .find({ token: token })
    .value();
  
  if (application) {
    return application;
  } else {
    return { error: "NotFound" };
  }
};