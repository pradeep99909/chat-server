var jwt = require("jsonwebtoken");
require("dotenv").config();
module.exports = function verifyUser(req, res, next) {
  console.log(req.body);
  jwt.verify(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIxMjMiLCJ1aWQiOiJjYjJlNDg2Yy0yNWVkLTRiNGUtOThmNi1hNDI4ODEyYTZmYWUiLCJpYXQiOjE1OTA1NzA0OTl9.a8QFkjHVJDVKQmhv9WNtBDlVfSc2y00-h5TSDljoR8g",
    process.env.token_key,
    (err, payload) => {
      if (!err) {
        return payload;
      } else {
        return err;
      }
    }
  );
  next();
};
