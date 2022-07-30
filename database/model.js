const { Schema, model } = require("mongoose");

// Article Schema
const ArticleSchema = new Schema({
  author: String,
  author_email: String,

  title: String,
  slug: String,
  excerpt: String,
  post_quote: { author: String, quote: String },

  pub_date: Date,
  creation_date: Date,
  last_modified: Date,

  topic: [String],
  content: { type: String, default: "" },
  post_image: { type: String, default: "https://i.ibb.co/gyYtF0f/sb.png" },

  next_post: {
    slug: String,
    title: String,
  },

  views: { type: Number, default: 0 },
  draft: { type: Boolean, default: true },
  draft_revisions: { type: Number, default: 0 },

  allow_comments: { type: Boolean, default: true },
});

module.exports = {
  Article() {
    return model("article", ArticleSchema);
  },
};
