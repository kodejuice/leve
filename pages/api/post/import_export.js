/* eslint-disable no-async-promise-executor */
import { readFileSync } from "fs";
import _ from "lodash";

import { IncomingForm } from "formidable";

import connectDB from "../../../database/connection";
import { bytesToSize } from "../../../utils";
import { createPost } from "../../../database/functions";

const handlers = {};
const handle = (method, fn) => (handlers[method.toUpperCase()] = fn);

export const config = {
  api: {
    bodyParser: false,
  },
};

/** Import data into site via JSON / Export site data as json **/

// export
function Export(req, res, Article) {
  return new Promise((resolve) => {
    const size_only = req.query.size_only === "true";
    const db_query = Article.find().exec();

    db_query
      .then((posts) => {
        const str = JSON.stringify(posts);

        if (size_only) {
          // report size data file size
          res.json({ size: bytesToSize(str.length) });
        } else {
          // send site data as attachment
          res.setHeader(
            "Content-disposition",
            "attachment; filename=site_data.json"
          );
          res.setHeader("Content-type", "text/plain");
          res.send(str);
        }
        resolve();
      })
      .catch(() => {
        res.json({ size: null, err: "Failed to fetch data" });
        resolve();
      });
  });
}

// import
function Import(req, res) {
  return new Promise(async (resolve) => {
    const data = await new Promise((_resolve, _reject) => {
      const form = new IncomingForm();

      form.parse(req, (err, fields, files) => {
        if (err) return _reject(err);
        _resolve({ fields, files });
      });
    });

    const { path } = data.files.data;
    let content;

    // json file uploaded
    // read file from the folder its uploaded to
    try {
      content = readFileSync(path);
    } catch (e) {
      res.send(`Error: ${e}`);
      return resolve();
    }

    // Parse JSON
    let json;
    try {
      json = JSON.parse(content);
      if (!_.isArray(json)) throw new Error("JSON object not iterable");
    } catch (e) {
      res.json(`Invalid JSON: (${e.message})`);
      return resolve();
    }

    const responses = [];
    let response;
    let added_count = 0;

    // insert posts into DB
    const required_fields = [
      "author",
      "author_email",
      "title",
      "content",
      // "pub_date", allow drafts
      "slug",
    ];

    for (let i = 0; i < json.length; i += 1) {
      const post = json[i];
      // make sure its a post
      if (required_fields.every((k) => k in post)) {
        // this post has all the required fields
        // add it to DB
        // eslint-disable-next-line no-await-in-loop, no-use-before-define
        response = await createPost(post.slug, post);

        if (response.success === true) added_count += 1;

        responses.push(`${post.slug} -> ${JSON.stringify(response)}`);
      }
    }

    if (responses.length === 0) {
      res.send("JSON object doesn't match the required Schema!");
      return resolve();
    }

    // bubble successful inserts to the top
    responses.sort((a) => (a.success === true ? -1 : 1));

    const res_string = `Added ${added_count} posts\n${"_".repeat(56)}\n\n`;
    res.json(res_string + responses.join("\n\n"));
    resolve();
  });
}

/////////////////
// GET exports //
/////////////////
handle("get", async (req, res, { Article }) => Export(req, res, Article));

//////////////////
// POST imports //
//////////////////
handle("post", async (req, res, { Article }) => Import(req, res, Article));

export default connectDB((req, res, DB_Models) => {
  const { method } = req;

  if (!(req.isAuthenticated && method in handlers))
    return res.json({ msg: "You can't do that" });

  return handlers[method](req, res, DB_Models);
});
