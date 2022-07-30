/* eslint-disable no-async-promise-executor */
import _ from "lodash";
import { parseCookies, setCookie } from "nookies";

import connectDB from "../../../database/connection";
import {
  createPost,
  deletePost,
  updatePost,
} from "../../../database/functions";

const handlers = {};
const handle = (method, fn) => (handlers[method.toUpperCase()] = fn);

/* Controllers */
/* Handle API calls to manage posts, create/update/delete */

// get post content
handle("get", (req, res, slug /*post_id*/, { Article }) => {
  const cookies = parseCookies({ req });

  const __fields =
    "author post_image author_email title content post_quote pub_date last_modified next_post slug draft excerpt ";

  const db_query = Article.findOne({ slug }).exec();
  return new Promise((resolve) => {
    db_query
      .then(async (post) => {
        if (!post) {
          res.json({ error: true, msg: "Not found" });
          return resolve();
        }

        // update 'views' count
        if (!(post.slug in cookies)) {
          post.views += 1;
          setCookie({ res }, post.slug, "1", {
            path: "/",
            maxAge: 86400 * 31, // 31 days
          });
          post.save();
        }

        const fields = (__fields + (req.query.include || "")).split(" ");
        post = _.pick(post, fields);

        if (post.draft === true && !req.isAuthenticated) {
          res.json({ error: true, msg: "Not found" });
          return resolve();
        }
        res.json(post);
        return resolve();
      })
      .catch((err) => {
        res.json({ error: true, msg: err });
        resolve();
      });
  });
});

// create new post
handle(
  "put",
  (req, res, post_id) =>
    new Promise(async (resolve) => {
      let is_err = false;
      let err_msg = "";

      const { title } = req.body;
      if (!req.isAuthenticated) {
        is_err = true;
        err_msg = "Authentication required";
      } else if (!title || !title.length) {
        is_err = true;
        err_msg = "empty title!";
      } else if (!post_id || !post_id.length) {
        is_err = true;
        err_msg = "invalid slug!";
      }

      if (is_err) {
        res.json({ error: true, msg: err_msg });
        return resolve();
      }

      const new_post = await createPost(post_id, req.body);
      res.json(new_post);
      return resolve();
    })
);

// update post content
handle(
  "post",
  (req, res, post_id) =>
    // let { title, excerpt, content, draft, topic, post_quote, next_post } = req.body;
    new Promise(async (resolve) => {
      if (!req.isAuthenticated) {
        res.json({ error: true, msg: "Authentication required" });
        return resolve();
      }

      const { title } = req.body;
      if (!title?.length) {
        res.json({ error: true, msg: "empty title!" });
        return resolve();
      }

      res.json(await updatePost(post_id, req.body));
      return resolve();
    })
);

// delete post
handle(
  "delete",
  (req, res, post_id) =>
    new Promise(async (resolve) => {
      if (!req.isAuthenticated) {
        res.json({ error: true, msg: "Authentication required" });
        return resolve();
      }

      res.json(await deletePost(post_id));
      return resolve();
    })
);

export default connectDB((req, res, DB_Models) => {
  const {
    query: { post_id },
  } = req;

  const { method } = req;
  if (!(method in handlers)) return res.json({ msg: "You can't do that" });

  return handlers[method](req, res, post_id, DB_Models);
});
