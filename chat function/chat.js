const mongo = require("mongodb");
require("dotenv").config();
const Auth = require("../auth_function/auth");

var Auth1 = new Auth();

class Chat {
  constructor() {}
  get_new_message(uid, callback) {
    Auth1.getUser(uid, async (user) => {
      var db = await mongo.MongoClient.connect(
        "mongodb+srv://admin:admin78@cluster0-h9gpw.mongodb.net/test?retryWrites=true&w=majority",
        { useUnifiedTopology: true, useNewUrlParser: true }
      );

      var dbo = await db.db("chat");
      await dbo
        .collection("messages")
        .aggregate([
          {
            $match: {
              $or: [{ to_uid: { $eq: uid } }, { from_uid: { $eq: uid } }],
            },
          },
          {
            $project: {
              uid_from: 1,
              from: 1,
              to: 1,
              message: 1,
              type: 1,
              time: 1,
              users: 1,
            },
          },
          { $unwind: "$users" },
          {
            $match: {
              users: {
                $ne: user,
              },
            },
          },
          {
            $group: {
              _id: "$users",
              messages: {
                $push: {
                  uid_from: "$from_uid",
                  from: "$from",
                  to: "$to",
                  message: "$message",
                  type: "$type",
                  time: "$time",
                },
              },
            },
          },
        ])
        .toArray()
        .then((res) => {
          return callback({
            status: 200,
            message: res,
            success: true,
          });
        })
        .catch(() => {
          return callback({
            status: 400,
            message: "Network Error",
            success: false,
          });
        });
    });
  }

  // delete_message(data,callback){
  //   var client=await mongo.MongoClient.connect("mongodb+srv://admin:admin78@cluster0-h9gpw.mongodb.net/test?retryWrites=true&w=majority",
  //   { useUnifiedTopology: true, useNewUrlParser: true });
  //   var db=await client.db('chat');
  //   // await db.collection('messages').updateOne(

  //   // )

  // }

  async chat_history(data, callback) {
    var db = await mongo.MongoClient.connect(
      "mongodb+srv://admin:admin78@cluster0-h9gpw.mongodb.net/test?retryWrites=true&w=majority",
      { useUnifiedTopology: true, useNewUrlParser: true }
    );
    var dbo = await db.db("chat");
    await dbo
      .collection("messages")
      .find({
        $or: [
          { from_uid: data.uid, to: data.to },
          {
            to_uid: data.uid,
            from: data.to,
          },
        ],
      })
      .toArray()
      .then((res) => {
        callback({
          status: 200,
          message: res,
          success: true,
        });
      })
      .catch(() => {
        callback({
          status: 400,
          message: "Database Error",
          success: false,
        });
      });
  }

  async send_message(data, callback) {
    var db = await mongo.MongoClient.connect(
      "mongodb+srv://admin:admin78@cluster0-h9gpw.mongodb.net/test?retryWrites=true&w=majority",
      { useUnifiedTopology: true }
    );

    var dbo = await db.db("chat");
    dbo
      .collection("users")
      .findOne({ username: data.to })
      .then((user) => {
        if (user !== null) {
          dbo
            .collection("messages")
            .collection()
            .insertOne(
              {
                from_uid: data.from_uid,
                to_uid: user.uid,
                from: data.from,
                to: data.to,
                message: data.message,
                users: [data.from, data.to],
                type: data.type,
                time: data.time,
                from_delete: false,
                to_delete: false,
              },
              { writeConcern: { w: "majority" } }
            )
            .then(() => {
              callback({
                status: 200,
                message: "Message Sent",
                success: true,
              });
            })
            .catch(() => {
              callback({
                status: 400,
                message: "Database Error",
                success: false,
              });
            });
        }
      })
      .catch((err) => {
        callback({
          status: 400,
          message: "Database Error",
          success: false,
        });
      });
  }

  async get_message_user(uid, callback) {
    var db = await mongo.MongoClient.connect(
      "mongodb+srv://admin:admin78@cluster0-h9gpw.mongodb.net/test?retryWrites=true&w=majority",
      { useUnifiedTopology: true, useNewUrlParser: true }
    );
    // (err, db) => {
    //   if (err) {
    //     console.log(err);
    //     return callback({
    //       message: "Network Error",
    //       status: 400,
    //       success: false,
    //     });
    //   }
    var dbo = db.db("chat");
    dbo
      .collection("messages")
      .aggregate([
        {
          $match: { to_uid: uid },
        },
        { $unwind: "$from" },
        {
          $group: {
            _id: "$from",
          },
        },
      ])
      .toArray()
      .then((res) => {
        callback(res);
      });
    //db.close();
    //}
    //);
  }
}

module.exports = { Chat };
