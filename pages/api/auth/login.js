import hash from "hash.js";
import jwt from "jsonwebtoken";

import connectDB from "../../../database/connection";

const handlers = {};
const handle = (method, fn) => (handlers[method.toUpperCase()] = fn);

handle("post", async (req, res) => {
  const { password } = req.body || {};

  if (!password) {
    return res.json({ success: false });
  }

  const h = hash.sha256().update(password).digest("hex");

  if (h === process.env.PASSWORD_HASH) {
    const token = jwt.sign(
      { password },
      process.env.JWT_SECRET,
      { expiresIn: 86400 * 31 } // 31 days token
    );

    return res.json({ success: true, token });
  }

  // wrong password
  return res.json({ success: false });
});

export default connectDB((req, res, DB_Models) => {
  const { method } = req;

  if (!(method in handlers)) return res.json({ msg: "You can't do that" });

  return handlers[method](req, res, DB_Models);
});
