import connectDB from "../../../database/connection";

const handlers = {};
const handle = (method, fn) => (handlers[method.toUpperCase()] = fn);

/** Returns list of posts from db **/

// get post listing
handle(
  "get",
  async (req, res, { Article }) =>
    new Promise((resolve) => {
      const fields = req.query.fields || "title excerpt slug pub_date";
      const need_draft = req.query.draft;

      const db_query = Article.find().select(fields).sort({ views: "desc" });

      if (need_draft === "true" && req.isAuthenticated) {
        db_query.where("draft", true);
      } else {
        db_query.where("draft", false);
      }

      // execute query
      db_query.exec();

      db_query
        .then((posts) => {
          if (need_draft === "true" && !req.isAuthenticated) {
            // respond with empty rather returning non-drafts
            res.json([]);
          } else {
            res.json(posts);
          }

          resolve();
        })
        .catch((err) => {
          res.send({ err });
          resolve();
        });
    })
);

export default connectDB((req, res, DB_Models) => {
  const { method } = req;

  if (!(method in handlers)) return res.send("You can't do that");

  return handlers[method](req, res, DB_Models);
});
