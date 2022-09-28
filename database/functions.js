/* eslint-disable no-use-before-define */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-console */
import { sample, pick, extend } from "lodash";
import { db_model } from "./connection";
import mdParser from "../utils/mdParser";
// import { sitePages } from "../components/pages/list";

const toObject = (payload) => JSON.parse(JSON.stringify(payload));

/**
 * Create new post in DB
 *
 * @param {string} post_id      The slug of the new post
 * @param {Object} post_fields  Data fields
 */
export async function createPost(post_id, post_fields) {
  const { Article } = await db_model();

  const _fields = [
    "author",
    "author_email",
    "title",
    "excerpt",
    "content",
    "draft",
    "topic",
    "post_quote",
    "post_image",

    // being imported?
    "creation_date",
    "last_modified",
    "pub_date",
  ];
  const newItem = pick(post_fields, ..._fields);

  const now = new Date();

  newItem.slug = post_id;
  if (!newItem.creation_date) newItem.creation_date = now;
  if (!newItem.last_modified) newItem.last_modified = now;

  if (!newItem.draft && !newItem.pub_date) {
    newItem.pub_date = now;
  }

  newItem.html_content = mdParser.render(newItem.content || "");

  return new Promise((resolve) => {
    // create post if slug isn't in use already
    Article.findOne({ slug: post_id }, (err, doc) => {
      if (err || doc) {
        if (err) resolve({ error: true, msg: err.message });
        else if (doc /*|| sitePages.has(post_id)*/)
          resolve({ error: true, msg: "slug not available!" });
        return resolve();
      }

      Article.create(newItem, (_err, _doc) => {
        if (_err) resolve({ error: true, msg: _err.message });
        else resolve({ success: true, _doc });
      });
    });
  });
}

/**
 * Update Post in DB
 *
 * @param {string} post_id
 * @param {Object} post_fields
 */
export async function updatePost(post_id, post_fields) {
  const { Article } = await db_model();

  const writable = [
    "title",
    "excerpt",
    "content",
    "draft",
    "topic",
    "post_quote",
    "allow_comments",
    "author_email",
    "post_image",
  ];
  const updates = pick(post_fields, ...writable);

  return new Promise((resolve) => {
    // find post to update
    Article.findOne({ slug: post_id }, (err, doc) => {
      if (err) {
        return resolve({ error: true, msg: err });
      }
      if (!doc) {
        return resolve({ error: true, msg: "that post doesn't exist!" });
      }

      // increment revisions and update `Last modified` date
      // if content was modified
      if ("content" in updates && updates.content !== doc.content) {
        doc.draft_revisions += 1;
        doc.last_modified = new Date();
        doc.html_content = mdParser.render(updates.content);
      }

      // is it being published ?, update publication date
      if (!updates.draft && !doc.pub_date) {
        // if (no_longer_a_draft AND not_published)
        doc.pub_date = new Date();
      }

      extend(doc, updates).save();

      return resolve({ success: true });
    });
  });
}

/**
 * Delete a post from DB
 *
 * @param {string} post_id
 */
export async function deletePost(post_id) {
  const { Article } = await db_model();

  return new Promise((resolve) => {
    Article.findOneAndDelete({ slug: post_id }, (err) => {
      if (err) resolve({ error: true, msg: err });
      else resolve({ success: true });
    });
  });
}

/**
 * Fetch a single post from DB.
 *
 * @param      {string}   slug              The slug of the post (post identifier) `http://{host}/{slug}`
 * @param      {boolean}  [next_post=true]  Should we get the next post suggestion?
 * @param      {boolean}  [draft=true]      Should we also show drafts?
 * @return     {Promise}  The post.
 */
export async function getPost(slug, next_post = true, draft = false) {
  const { Article } = await db_model();

  return new Promise((resolve) => {
    const query = Article.findOne({ slug }).exec();

    query
      .then((post) => {
        if (!post || (post.draft && !draft)) {
          return resolve({ error: true, msg: "Not found" });
        }

        if (next_post) {
          getNextPosts(post, Article)
            .then((nxt) => {
              post.next_post = nxt;
              resolve(toObject(post));
            })
            .catch(() => {
              resolve(toObject(post));
            });
        } else {
          return resolve(toObject(post));
        }
      })
      .catch(() => {
        resolve({ error: true });
      });
  });
}

/**
 * Fetch all posts from DB.
 *
 * @param      {string[]}  fields       Fields to select in the database model
 * @param      {boolean}   draft        Return draft posts
 * @param      {Object}    sortCriteria Sort criteria
 * @return     {Promise}   The posts.
 */
export async function getPosts(
  fields,
  draft = false,
  sortCriteria = { views: "desc" }
) {
  const { Article } = await db_model();

  return new Promise((resolve) => {
    const query = Article.find()
      .select(fields.join(" "))
      .sort(sortCriteria)
      .where("draft", draft)
      .exec();

    query
      .then((posts) => {
        resolve(toObject(posts));
      })
      .catch(() => {
        resolve([]);
      });
  });
}

/**
 * Get unique post topics
 */
export async function getTopics() {
  const posts = await getPosts(["topic"]);
  const topics = [];
  const seen = new Set();

  posts.forEach((post) => {
    post.topic.forEach((t) => {
      const topic = t.trim();
      if (topic?.length && !seen.has(topic)) {
        topics.push(topic);
        seen.add(topic);
      }
    });
  });

  return topics;
}

/**
 * Get posts with given topic/category
 * @param {string} topic post topic to fetch
 * @param {string[]|undefined} fields Post fields to return
 * @param {Object} sortCriteria Sort criteria
 */
export async function getPostsByTopic(
  topic,
  fields = undefined,
  sortCriteria = { views: "desc" }
) {
  if (!topic) return [];
  const posts = await getPosts(
    fields || ["topic", "slug", "title", "excerpt", "pub_date"],
    false,
    sortCriteria
  );
  return posts.filter((post) => {
    const topics = post.topic.join(",").toLowerCase();
    return topics.includes(topic.toLowerCase());
  });
}

// get "next post >>" suggestion
async function getNextPosts(post, model) {
  return new Promise(async (resolve, reject) => {
    try {
      const nxt_doc = await model.findOne({
        pub_date: { $gt: post.pub_date },
        draft: false,
      });

      if (nxt_doc) {
        return resolve(nxt_doc);
      }

      // no next post, get a random post from the past
      const all_posts = await model
        .find({ pub_date: { $lt: post.pub_date }, draft: false })
        .sort({ pub_date: "asc" });

      return resolve(sample(all_posts));
    } catch (e) {
      reject(e);
    }
  });
}
