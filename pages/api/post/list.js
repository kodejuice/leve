import connectDB from "../../../database/connection";
import { getPosts } from "../../../database/functions";

const handlers = {};
const handle = (method, fn) => {
  handlers[method.toUpperCase()] = fn;
};

/** Returns list of posts from db * */

// get post listing
handle("get", async (req, res) => {
  const fields = (req.query.fields || "title excerpt slug pub_date").split(" ");
  const need_draft = req.query.draft === "true";

  if (need_draft && !req.isAuthenticated) {
    return res.json([]);
  }

  const posts = await getPosts(fields, need_draft, { views: "desc" });
  return res.json(posts);
});

export default connectDB((req, res, DB_Models) => {
  const { method } = req;

  if (!(method in handlers)) return res.send("You can't do that");

  return handlers[method](req, res, DB_Models);
});
