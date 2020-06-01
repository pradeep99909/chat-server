var verifyuser = require("./verifyuser");

var fun = verifyuser();

test("should verify", () => {
  expect(verifyuser()).toBe({
    username: "user123",
    uid: "cb2e486c-25ed-4b4e-98f6-a428812a6fae",
    iat: 1590570499,
  });
});
