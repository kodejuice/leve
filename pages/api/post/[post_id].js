/* eslint-disable no-async-promise-executor */
import _ from "lodash";
import { parseCookies, setCookie } from "nookies";

import connectDB, { getPrisma } from "../../../database/connection";
import {
  createPost,
  deletePost,
  updatePost,
  getPost,
} from "../../../database/functions";

const handlers = {};
const handle = (method, fn) => (handlers[method.toUpperCase()] = fn);

/* Controllers */
/* Handle API calls to manage posts, create/update/delete */

// get post content
handle("get", async (req, res, slug) => {
  const cookies = parseCookies({ req });
  const prisma = getPrisma();

  const __fields =
    "author post_image author_email title content html_content post_quote pub_date last_modified next_post slug draft excerpt ";

  try {
    const post = await getPost(slug);
    if (!post || post.error) {
      return res.json({ error: true, msg: "Not found" });
    }

    // update 'views' count
    if (!(post.slug in cookies)) {
      post.views = (post.views || 0) + 1;
      setCookie({ res }, post.slug, "1", {
        path: "/",
        maxAge: 86400 * 31, // 31 days
      });
      await prisma.article.update({
        where: { slug: post.slug },
        data: { views: { increment: 1 } },
      });
    }

    const fields = (__fields + (req.query.include || "")).trim().split(/\s+/);
    const filtered = _.pick(post, fields);

    if (filtered.draft === true && !req.isAuthenticated) {
      return res.json({ error: true, msg: "Not found" });
    }
    return res.json(filtered);
  } catch (err) {
    return res.json({ error: true, msg: err.message });
  }
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
