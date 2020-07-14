const randomizer = require('../../helpers/randomizer')

const cheerio = require('cheerio');
const config = require('config');

const Joi = require('@hapi/joi');
const axios = require('axios');

const Hashes = require('jshashes');
const SHA256 = new Hashes.SHA256;

const mail = require('@sendgrid/mail');
mail.setApiKey(config.get('email.key'));

const path = require('path');
const fs = require('fs');

// Возврат главной функии
// Ну и сама главная функция
module.exports = (user) => {
  // Подготовка данных...
  
  // Joi объект, который будет проверять
  // данные из переменной user
  const schema = Joi.object({
    username: Joi.string()
                  .min(3)
                  .max(30)
                  .required(),
    email: Joi.string()
               .email()
               .required()
  });
  
  return new Promise((resolve, reject) => {
    const validation = schema.validate(user);
    if (validation.error != null) reject("WrongPayload");
    
    // {"$$findOne":true,"$$storage":"users","email":"${user.email}"}
    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/{"$$findOne":true,"$$storage":"users","email":"${user.email.toLowerCase()}"}`)
    .then((response) => {
      let data = response.data;

      if (data.error == "404") {
        // REGISTER USER:
        // user.pincode = randomizer(4);

        // CHECK EMAIL
        axios.get(`https://emailverification.whoisxmlapi.com/api/v1?apiKey=${config.get('email.verifyKey')}&emailAddress=${user.email}`)
        .then((response) => {
          const pincode = randomizer(4);

          user.pincode = SHA256.hex(pincode);
          if (response.data.smtpCheck == "true") {
            // REGISTER
            axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, {
              $$storage: "users",

              username: user.username,
              email: user.email.toLowerCase(),

              pincode: user.pincode
            })
            .then((response) => {
              data = response.data;
              
              // 
              // SEND EMAIL
              // 
              fs.readFile(path.join(__dirname + '../../../email/pincode.html'), (error, contents) => {
                const html = cheerio.load(contents);
                pincode.split('').forEach((element) => {
                  html('#pincode').append(`<p>${element}</p>`);
                });
                mail.send({
                  to: user.email,
                  from: 'Wavees Bot <bot@wavees.ml>',
                  subject: 'ваш пинкод готов.',
                  text: 'вы можете взять его тут и использовать для того, что бы авторизоваться в сервисах wavees',
                  html: html.html(),
                });
              })


              // RESOLVE
              resolve(data);
            })
            .catch((response) => {
              let data = response.response.data;
              if (data.error == "DatabaseLoadError") {
                reject("DatabaseLoadError");
              } else if (data.error == "DatabaseError") {
                reject("DatabaseError");
              } else {
                reject("ServerError");
              }
            });
          } else {
            reject("WrongEmail");
          }
        })
        .catch((response) => {
          reject("ServerError");
        });

      } else {
        reject("Registered");
      }
    })
    .catch((response) => {
      let data = response.data;

      if (data.error == "InvalidKey") {
        reject("InvalidKey");
      } else {
        reject("ServerError");
      }
    });

    // db.find({}, (error, documents) => {
    //   let element = documents.find((element) => element.username == user.username || element.email == user.email)
      
    //   // Проверка...
    //   if (element) {
    //     // Пользователь сущесвует...
    //     // Возвращяем сообщение об ошибке.
    //     resolve({ 
    //       error: "\\UserAlreadyRegistered",
    //       user: {
    //         username: element.username == user.username ? user.username : element.username,
    //         email: element.email == user.email ? user.email : element.email
    //       }})
    //     return;
    //   }
    //   console.log(user);
      
    //   const password = randomizer(4);
    //   user.password = SHA256.hex(password)
    //   user.slug = randomizer(6)
      
    //   // Пользователя не сущесвует, регистрируем...
        
    //   // Проверяем, существует ли данная почта...
    //   emailVerify.verify(user.email, function (err, response) { 
    //     if (response.body.result != "invalid") {
    //       db.insert(user, (error, document) => {
    //         if (!document) {
    //           resolve({ error: "\\InternalServerError", message: "Could not connect to users database" });
    //           return;
    //         }
            
    //         // Подготавливаем почту и отправляем её...
    //         fs.readFile(path.join(__dirname + '../../../email/templates/pincode.html'), (error, contents) => {
    //           const html = cheerio.load(contents);
    //           password.split('').forEach((element) => {
    //             html('#pincode').append(`<p>${element}</p>`);
    //           });
    //           mail.send({
    //             to: user.email,
    //             from: 'Wavees Bot <bot@wavees.ml>',
    //             subject: 'ваш пинкод готов.',
    //             text: 'вы можете взять его тут и использовать для того, что бы авторизоваться в сервисах wavees',
    //             html: html.html(),
    //           });
    //         })
            
    //         // Отвечаем на запрос...
    //         resolve({ error: '0', message: "\\Registered" });
    //       })
    //     } else {
    //       resolve({
    //         error: "\\InvalidEmail",
    //         email: user.email
    //       });
    //     }
    //   });
    // })
  })
}