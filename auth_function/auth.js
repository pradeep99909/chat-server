const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
var bcrypt = require("bcryptjs");
var uid = require("uuid/v4");
var jwt = require("jsonwebtoken");
class Auth {
  async login(data, callback) {
    var db = await MongoClient.connect(
      "mongodb+srv://admin:admin78@cluster0-h9gpw.mongodb.net/test?retryWrites=true&w=majority",
      { useUnifiedTopology: true }
    );

    var dbo = await db.db("chat");
    var collection = dbo.collection("users");
    collection.findOne({ email: data.email }).then((res) => {
      if (res !== null) {
        if (bcrypt.compareSync(data.email + data.password, res.password)) {
          jwt.sign(
            { username: res.username, uid: res.uid },
            process.env.token_key,
            function (err, token) {
              if (!err) {
                callback({
                  status: 200,
                  token: token,
                  username: res.username,
                  uid: res.uid,
                  success: true,
                });
              }
            }
          );
        } else {
          callback({
            message: "Wrong Password",
            status: 400,
            success: false,
          });
        }
      } else {
        callback({
          message: "User does not exists",
          status: 400,
          success: false,
        });
      }
    });
  }
  async createNewUser(data, callback) {
    var db = await MongoClient.connect(
      "mongodb+srv://admin:admin78@cluster0-h9gpw.mongodb.net/test?retryWrites=true&w=majority",
      { useUnifiedTopology: true }
    );

    var dbo = await db.db("chat");
    var collection = dbo.collection("users");
    var email = collection
      .findOne({ $or: [{ email: data.email }, { username: data.username }] })
      .then((res) => {
        if (res) {
          callback({
            status: 400,
            message: "Email already Exists",
            success: false,
          });
        } else {
          var salt = bcrypt.genSaltSync(10);
          var hash = bcrypt.hashSync(data.email + data.password, salt);
          collection
            .insertOne({
              username: data.username,
              email: data.email,
              password: hash,
              uid: uid(),
            })
            .then(() => {
              callback({
                status: 200,
                message: "User Successfully Logined",
                success: true,
              });
            })
            .catch((err) => {
              callback({
                message: "Database Connectivity Error",
                success: false,
                status: 400,
              });
            });
        }
      });
  }
  async getUID(username, callback) {
    var db = await MongoClient.connect(
      "mongodb+srv://admin:admin78@cluster0-h9gpw.mongodb.net/test?retryWrites=true&w=majority",
      { useUnifiedTopology: true, useNewUrlParser: true }
    );

    var dbo = await db.db("chat");
    dbo
      .collection("users")
      .findOne({ username })
      .then((res) => {
        callback(res.uid);
      });
  }

  async getUser(uid, callback) {
    var db = await MongoClient.connect(
      "mongodb+srv://admin:admin78@cluster0-h9gpw.mongodb.net/test?retryWrites=true&w=majority",
      { useUnifiedTopology: true, useNewUrlParser: true }
    );
    var dbo = await db.db("chat");
    dbo
      .collection("users")
      .findOne({ uid })
      .then((res) => {
        if (res !== null) {
          return callback(res.username);
        }
      });
  }

  async search(user, callback) {
    var db = await MongoClient.connect(
      "mongodb+srv://admin:admin78@cluster0-h9gpw.mongodb.net/test?retryWrites=true&w=majority",
      { useUnifiedTopology: true, useNewUrlParser: true }
    );
    var dbo = await db.db("chat");
    dbo
      .collection("users")
      .aggregate([
        {
          $match: {
            username: { $regex: String(user) },
          },
        },
        {
          $project: {
            //Name: "$_id",
            _id: 1,
            username: 1,
            password: 1,
            uid: 1,
            email: 1,
          },
        },
        {
          $group: {
            _id: "search_result",
            users: {
              $push: {
                username: "$username",
              },
            },
          },
        },
      ])
      .toArray()
      .then((res) => {
        if (res != null) {
          return callback({
            status: 200,
            people: res,
          });
        }
      });
  }
}

module.exports = Auth;
