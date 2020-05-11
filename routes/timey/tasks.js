const router = require('express').Router();

const axios  = require('axios');
const config = require('config')
const moment = require('moment');

const Joi    = require("@hapi/joi");

router.post('/:token', (req, res) => {
  // user check
  const token = req.params.token;
  
  axios.get(`${config.get('api.url')}/user/${token}`)
  .then((response) => {
    let body = response.data;
    
    if (body.error == "ServerError" || body.error == "UserNotFound" || body.error == "InvalidToken") {
      res.status(400);
      res.end(JSON.stringify({ error: "InvalidToken" }));
    } else {
      // Let's add this task.
      const schema = Joi.object({
        title: Joi.string()
                  .required(),
        description: Joi.string()
                  .required(),
        size: Joi.number(),
        color: Joi.string(),
        time: Joi.string()
      });
      
      const validation = schema.validate(req.body);
      if (validation.error != null) {
        res.status(400);
        res.end(JSON.stringify({ error: "InvalidPayload", message: validation.error }))
      } else {
        // Add this task...
        // TODO: Global event system;
        axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, {
          $$storage: "timey-tasks",
          
          uid: body._id,
          
          title: req.body.title,
          description: req.body.description,
          
          size: req.body.size == null ? 1 : req.body.size,
          color: req.body.color, 
          
          time: req.body.time == null ? moment().add('15', 'minutes').utc() : req.body.time
        })
        .then((response) => {
          axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/{"$$storage":"timey-tasks","uid":"${body._id}"}`)
          .then((response) => {
            let body = response.data;
            let tasks = body;

            res.end(JSON.stringify(tasks));
          })
          .catch((error) => {
            res.status(500);
            res.end(JSON.stringify({ error: "ServerError" }));
          });
        })
        .catch((error) => {
          res.status(500);
          res.end(JSON.stringify({ error: "ServerError" }))
        })
      }
    }
  })
  .catch((error) => {
    res.status(500);
    res.end(JSON.stringify({ error: "ServerError" }));
  });
});

router.get('/:token', (req, res) => {
  // User check
  const token = req.params.token;

  axios.get(`${config.get('api.url')}/user/${token}`)
  .then((response) => {
    let body = response.data;
    
    if (body.error == "ServerError" || body.error == "UserNotFound" || body.error == "InvalidToken") {
      res.status(400);
      res.end(JSON.stringify({ error: "InvalidToken" }));
    } else {
      // Let's get all user tasks
      axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/{"$$storage":"timey-tasks","uid":"${body._id}"}`)
      .then((response) => {
        let body = response.data;
        let tasks = body;
        
        res.end(JSON.stringify(tasks));
      })
      .catch((error) => {
        res.status(500);
        res.end(JSON.stringify({ error: "ServerError" }));
      });
    }
  })
  .catch((error) => {
    res.status(500);
    res.end(JSON.stringify({ erorr: "ServerError" }));
  });
});

module.exports = router;