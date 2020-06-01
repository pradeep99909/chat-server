const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const webpush = require("web-push");
app.use(
  bodyParser.json({
    type: ["application/json", "text/plain"],
  })
);
var verifyUser = require("./functions/verifyuser");
require("dotenv").config();
app.use(bodyParser.urlencoded({ extended: true }));

const socket = require("socket.io");

webpush.setVapidDetails(
  "mailto:test@test.com",
  "BHzautfuAhAjFSZz20G7SHZa3K_-T2jsy8F5IDdk0vMVn3UNFxtmqRrh5ABeajp2L5X72Im6SAoeXbmHnSwxJCY",
  "boaWMFFbN0aZr7sPwL_qXINoGDTnO7UfjHIzZAUjhcg"
);

var Auth = require("./auth_function/auth");
var { Chat } = require("./chat function/chat");

app.post("/get_messages", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  var Chat1 = new Chat();

  Chat1.get_new_message(req.body.uid, (response) => {
    res.status(response.status).send(response);
  });
});

app.post("/chat_history", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  var Chat1 = new Chat();
  Chat1.chat_history({ uid: req.body.uid, to: req.body.to }, (response) => {
    res.send(response);
  });
});

app.post("/auth_register", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  var Auth1 = new Auth();
  //console.log(req.body);
  Auth1.createNewUser(
    {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    },
    (response) => {
      res.send(response);
    }
  );
});

app.post("/subscribe", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const subscription = req.body;

  webpush.sendNotification(subscription, "hello");
});

app.post("/auth_login", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  var Auth1 = new Auth();
  Auth1.login(
    {
      email: req.body.email,
      password: req.body.password,
    },
    (response) => {
      res.status(response.status).send(response);
    }
  );
});

app.post("/search", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  var Auth1 = new Auth();
  Auth1.search(req.body.user, (response) => {
    res.status(response.status).send(response);
  });
});

app.post("/send_message", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  var Chat1 = new Chat();
  Chat1.send_message(
    {
      from_uid: req.body.uid_from,
      from: req.body.from,
      to: req.body.to,
      message: req.body.message,
      type: req.body.type,
      time: req.body.time,
    },
    (response) => {
      res.send(response);
    }
  );
});

app.post("/get_message_user", verifyUser, (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  var Chat1 = new Chat();
  Chat1.get_message_user(req.body.uid, (response) => {
    res.send(response);
  });
});
const server = app.listen(8000 || process.env.PORT);

const io = socket(server);

io.on("connection", (socket) => {
  socket.on("send-message", (data) => {
    var Chat1 = new Chat();
    var Auth1 = new Auth();
    Auth1.getUID(data.to, (res) => {
      socket.broadcast.emit(res, data);

      Chat1.send_message(
        {
          from_uid: data.uid_from,
          from: data.from,
          to: data.to,
          message: data.message,
          type: data.type,
          time: data.time,
        },
        () => {
          null;
        }
      );
    });
  });
});
