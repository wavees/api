const axios = require('axios');

const Hashes = require('jshashes');
const SHA256 = new Hashes.SHA256;

const helpers = {
  createToken: require('../tokens/create')
};

const Joi = require('@hapi/joi');
const config = require('config');

module.exports = (user) => {
  // Joi объект для проверки данных...
  const schema = Joi.object({
    email: Joi.string().email().required(),
    pincode: Joi.string()
                  .min(4)
                  .max(4)
                  .required()
  })
  return new Promise((resolve, reject) => {
    const validation = schema.validate(user);
    if (validation.error != null) reject("WrongPayload");
    
    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/{"$$findOne":true,"$$storage":"users","email":"${user.email}"}`)
    .then((response) => {
      let data = response.data;

      if (data.error == "404") {
        reject("UserNotFound");
      } else {
        // Авторизовываем..
        if (data.pincode == SHA256.hex(user.pincode)) {
          helpers.createToken({ uid: data._id, type: "user", permissions: ["duplicateToken"] })
          .then((data) => {
            resolve(data.token);
          })
          .catch(() => {
            reject("TokenError");
          })
        } else {
          console.log("INVALID");
          reject("InvalidPassword");
        }
      }
    })
    .catch(() => {
      reject("ServerError");
    });
    // db.find({}, (error, documents) => {
    //   let element = documents.find((element) => {
    //     if (element.username == user.username || element.slug == user.slug || element.email == user.email) {
    //       return true
    //     } else {
    //       return false;
    //     }
    //   })
      
    //   // Проверка..
    //   if (!element) {
    //     // Ошибка, пользователя не существует.
    //     // Возвращяем сообщение он ошибке.
    //     resolve({
    //       error: "\\InternalServerError",
    //       message: "User not found"
    //     })
    //     return;
    //   }
      
    //   // "Авторизовываем" пользователя и возвращяем
    //   // ответ серверу. Если пользователь авторизован - 
    //   // пока что просто возвращяем ответ в виде TRUE
    //   if (element.password == SHA256.hex(user.password)) {
    //     resolve({
    //       ok: true,
    //       error: "0",
    //       message: "user logged in"
    //     })
    //     return;
    //   } else {
    //     // Пароль неправильный.
    //     resolve({ 
    //       ok: false,
    //       error: "\\PayloadError",
    //       message: "InvalidPassword"
    //     })
    //     return;
    //   }
    // })
  });
}