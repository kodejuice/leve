/* eslint-disable arrow-body-style */
import { format } from "date-fns-tz";

import connectDB from "../../database/connection";
import { site_details as details } from "../../site_config";

const formatDate = (s) => {
  // Tue, 02 Aug 2022 12:51:00 GMT+1
  return format(new Date(s), "E, d LLL yyyy HH:mm:ss z");
};

const safeTags = (str) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const last_modified = "2022-08-02T13:17:40.260Z";
const last_modified_date = formatDate(last_modified);

export default connectDB((req, res, DB_Models) => {
  const { Article } = DB_Models;

  const { host } = req.headers;
  const scheme = process.env.SCHEME;
  const site_url = `${scheme}://${host}`;
  // const feed_url = `${site_url}/api/rss.xml`;

  return new Promise((resolve) => {
    const db_query = Article.where("draft", false).sort({ views: "desc" });

    // execute query
    db_query.exec();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title>${details.name}</title>
    <link>${site_url}</link>
    <language>en-us</language>
    <description>${details.description}</description>
    <pubDate>${last_modified_date}</pubDate>
    <lastBuildDate>${last_modified_date}</lastBuildDate>
    <generator>Leve CMS</generator>
`;

    db_query
      .then((posts) => {
        posts.forEach((post) => {
          xml += `
    <item>
      <title>${post.title}</title>
      <link>${site_url}/${post.slug}/</link>
      <description> ${safeTags(post.html_content)} </description>
      <pubDate>${formatDate(post.pub_date)}</pubDate>
      <lastBuildDate>${formatDate(post.last_modified)} </lastBuildDate>
      <guid>${site_url}/${post.slug}/</guid>
      <comments> ${site_url}/${post.slug}#comments </comments>
      <category> ${post.topic.join(", ")} </category>
      <language> en-us </language>
    </item>
`;
        });
        xml += `
  </channel>
</rss>
`;

        res.setHeader("Content-Type", "text/xml; charset=utf-8");
        res.setHeader("Date", formatDate(new Date()));
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        res.send(xml);
        resolve();
      })
      .catch(() => {
        res.send(`${xml}</channel></rss>`);
        resolve();
      });
  });
});
