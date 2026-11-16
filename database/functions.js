/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
import lodash from "lodash";
import { getPrisma } from "./connection.js";
import mdParser from "../utils/mdParser.js";

const { sample, pick } = lodash;

async function withRetry(fn, maxRetries = 4, initialDelay = 500) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isConnError =
        err?.code === "P1001" ||
        err?.code === "P1017" ||
        err?.message?.includes("closed the connection") ||
        err?.message?.includes("Can't reach database") ||
        err?.message?.includes("ECONNRESET") ||
        err?.message?.includes("ETIMEDOUT") ||
        err?.message?.includes("timeout expired");

      if (isConnError && attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(1.8, attempt);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function formatArticle(a) {
  if (!a) return null;
  return {
    _id: String(a.id),
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt || "",
    content: a.content || "",
    html_content: a.html_content || "",
    author: a.author || "Sochima Biereagu",
    author_email: a.author_email || "sochima.eb@gmail.com",
    post_image: a.post_image || "https://i.ibb.co/gyYtF0f/sb.png",
    post_quote: a.post_quote || null,
    topic: Array.isArray(a.topic) ? a.topic : [],
    pub_date: a.pub_date ? new Date(a.pub_date).toISOString() : null,
    creation_date: a.creation_date
      ? new Date(a.creation_date).toISOString()
      : null,
    last_modified: a.last_modified
      ? new Date(a.last_modified).toISOString()
      : null,
    next_post: a.next_post || null,
    views: Number(a.views || 0),
    draft: Boolean(a.draft),
    draft_revisions: Number(a.draft_revisions || 0),
    allow_comments:
      a.allow_comments !== undefined ? Boolean(a.allow_comments) : true,
  };
}

/**
 * Create new post in DB
 *
 * @param {string} post_id      The slug of the new post
 * @param {Object} post_fields  Data fields
 */
export async function createPost(post_id, post_fields) {
  const prisma = getPrisma();
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

  try {
    const existing = await prisma.article.findUnique({
      where: { slug: post_id },
      select: { id: true },
    });
    if (existing) {
      return { error: true, msg: "slug not available!" };
    }

    const topicArr = Array.isArray(newItem.topic)
      ? newItem.topic.map((t) => t.trim()).filter(Boolean)
      : [];

    const created = await prisma.article.create({
      data: {
        slug: newItem.slug,
        title: newItem.title || "",
        excerpt: newItem.excerpt || "",
        content: newItem.content || "",
        html_content: newItem.html_content || "",
        author: newItem.author || "Sochima Biereagu",
        author_email: newItem.author_email || "sochima.eb@gmail.com",
        post_image: newItem.post_image || "https://i.ibb.co/gyYtF0f/sb.png",
        post_quote: newItem.post_quote || null,
        topic: topicArr,
        pub_date: newItem.pub_date ? new Date(newItem.pub_date) : null,
        creation_date: newItem.creation_date
          ? new Date(newItem.creation_date)
          : now,
        last_modified: newItem.last_modified
          ? new Date(newItem.last_modified)
          : now,
        draft: newItem.draft !== undefined ? Boolean(newItem.draft) : true,
        draft_revisions: 0,
        allow_comments:
          newItem.allow_comments !== undefined
            ? Boolean(newItem.allow_comments)
            : true,
      },
    });

    return { success: true, _doc: formatArticle(created) };
  } catch (err) {
    return { error: true, msg: err.message };
  }
}

/**
 * Update Post in DB
 *
 * @param {string} post_id
 * @param {Object} post_fields
 */
export async function updatePost(post_id, post_fields) {
  const prisma = getPrisma();
  try {
    const doc = await prisma.article.findUnique({
      where: { slug: post_id },
    });
    if (!doc) {
      return { error: true, msg: "that post doesn't exist!" };
    }

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

    let draft_revisions = doc.draft_revisions || 0;
    let { last_modified } = doc;
    let { html_content } = doc;

    if ("content" in updates && updates.content !== doc.content) {
      draft_revisions += 1;
      last_modified = new Date();
      html_content = mdParser.render(updates.content || "");
    }

    let { pub_date } = doc;
    if (updates.draft === false && !doc.pub_date) {
      pub_date = new Date();
    }

    const topicArr = Array.isArray(updates.topic)
      ? updates.topic.map((t) => t.trim()).filter(Boolean)
      : doc.topic;

    await prisma.article.update({
      where: { slug: post_id },
      data: {
        title: updates.title !== undefined ? updates.title : doc.title,
        excerpt: updates.excerpt !== undefined ? updates.excerpt : doc.excerpt,
        content: updates.content !== undefined ? updates.content : doc.content,
        html_content,
        draft: updates.draft !== undefined ? Boolean(updates.draft) : doc.draft,
        topic: topicArr,
        post_quote: updates.post_quote ? updates.post_quote : doc.post_quote,
        allow_comments:
          updates.allow_comments !== undefined
            ? Boolean(updates.allow_comments)
            : doc.allow_comments,
        author_email:
          updates.author_email !== undefined
            ? updates.author_email
            : doc.author_email,
        post_image:
          updates.post_image !== undefined
            ? updates.post_image
            : doc.post_image,
        draft_revisions,
        last_modified,
        pub_date,
      },
    });

    return { success: true };
  } catch (err) {
    return { error: true, msg: err.message };
  }
}

/**
 * Delete a post from DB
 *
 * @param {string} post_id
 */
export async function deletePost(post_id) {
  const prisma = getPrisma();
  try {
    await prisma.article.delete({
      where: { slug: post_id },
    });
    return { success: true };
  } catch (err) {
    return { error: true, msg: err.message };
  }
}

/**
 * Fetch a single post from DB.
 *
 * @param      {string}   slug              The slug of the post (post identifier) `http://{host}/{slug}`
 * @param      {boolean}  [next_post=true]  Should we get the next post suggestion?
 * @return     {Promise}  The post.
 */
export async function getPost(slug, next_post = true) {
  const prisma = getPrisma();
  try {
    const raw = await withRetry(() =>
      prisma.article.findUnique({
        where: { slug },
      })
    );
    if (!raw) {
      return { error: true, msg: "Not found" };
    }

    const post = formatArticle(raw);

    if (next_post && !post.draft && raw.pub_date) {
      try {
        const nextDoc = await withRetry(() =>
          prisma.article.findFirst({
            where: {
              draft: false,
              pub_date: { gt: raw.pub_date },
            },
            orderBy: { pub_date: "asc" },
            select: { slug: true, title: true },
          })
        );

        if (nextDoc) {
          post.next_post = {
            slug: nextDoc.slug,
            title: nextDoc.title,
          };
        } else {
          // random past post
          const pastPosts = await withRetry(() =>
            prisma.article.findMany({
              where: {
                draft: false,
                pub_date: { lt: raw.pub_date },
              },
              select: { slug: true, title: true },
            })
          );
          if (pastPosts.length > 0) {
            const picked = sample(pastPosts);
            post.next_post = {
              slug: picked.slug,
              title: picked.title,
            };
          }
        }
      } catch (e) {
        // ignore next post error
      }
    }

    return post;
  } catch (err) {
    console.error(`getPost error for slug "${slug}":`, err);
    return { error: true };
  }
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
  const prisma = getPrisma();
  let orderBy = { views: "desc" };
  if (sortCriteria) {
    if (typeof sortCriteria === "string") {
      const [k, d] = sortCriteria.split(" ");
      orderBy = { [k]: d?.toLowerCase() === "asc" ? "asc" : "desc" };
    } else if (sortCriteria.pub_date) {
      orderBy = {
        pub_date:
          sortCriteria.pub_date === "asc" || sortCriteria.pub_date === 1
            ? "asc"
            : "desc",
      };
    } else if (sortCriteria.views) {
      orderBy = {
        views:
          sortCriteria.views === "asc" || sortCriteria.views === 1
            ? "asc"
            : "desc",
      };
    }
  }

  try {
    const rows = await withRetry(() =>
      prisma.article.findMany({
        where: { draft: Boolean(draft) },
        orderBy,
      })
    );

    const posts = rows.map(formatArticle);

    if (Array.isArray(fields) && fields.length > 0) {
      return posts.map((p) => pick(p, ...fields, "_id", "slug", "title"));
    }
    return posts;
  } catch (err) {
    console.error("getPosts error:", err);
    return [];
  }
}

/**
 * Get unique post topics
 */
export async function getTopics() {
  const posts = await getPosts(["topic"]);
  const topics = [];
  const seen = new Set();

  posts.forEach((post) => {
    if (Array.isArray(post.topic)) {
      post.topic.forEach((t) => {
        const topic = t.trim();
        if (topic?.length && !seen.has(topic)) {
          topics.push(topic);
          seen.add(topic);
        }
      });
    }
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
    if (!Array.isArray(post.topic)) return false;
    const topics = post.topic.join(",").toLowerCase();
    return topics.includes(topic.toLowerCase());
  });
}
