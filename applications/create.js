const db = require('./db.js');
const randomizer = require('../helpers/randomizer.js');

module.exports = () => {
  let token = randomizer(8);
  console.log(token);
  
  db.get('list')
    .push({ token: token })
    .write();
  
  return token;
};