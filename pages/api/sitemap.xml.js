// import { format } from "date-fns";
import { sitePages } from "../../components/pages/list";

import connectDB from "../../database/connection";
import { formatDate } from "./rss.xml";

// https://www.google.com/ping?sitemap=FULL_URL_OF_SITEMAP

export default connectDB((req, res, DB_Models) => {
  const { Article } = DB_Models;
  const { host } = req.headers;
  const scheme = process.env.SCHEME;

  return new Promise((resolve) => {
    const db_query = Article.where("draft", false).sort({ pub_date: "desc" });

    // execute query
    db_query.exec();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${scheme}://${host}/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>0.4</priority>
    </url>
`;

    db_query
      .then((posts) => {
        posts.forEach((post) => {
          xml += `
<url>
    <loc>${scheme}://${host}/${post.slug}</loc>
    <lastmod>${new Date(post.last_modified).toISOString()}</lastmod>
    <priority>0.8</priority>
</url>
`;
        });

        Array.from(sitePages).forEach((page) => {
          xml += `
<url>
    <loc>${scheme}://${host}/${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.8</priority>
</url>
`;
        });

        xml += `
</urlset>
`;

        res.setHeader("Content-Type", "text/xml; charset=utf-8");
        res.setHeader("Date", formatDate(new Date()));
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        res.send(xml);
        resolve();
      })
      .catch(() => {
        res.send(`${xml}</urlset>`);
        resolve();
      });
  });
});
