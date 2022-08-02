import { format } from "date-fns";
import { sitePages } from "../../components/pages/list";

import connectDB from "../../database/connection";

// https://www.google.com/ping?sitemap=FULL_URL_OF_SITEMAP

export default connectDB((req, res, DB_Models) => {
  const { Article } = DB_Models;

  return new Promise((resolve) => {
    const db_query = Article.where("draft", false).sort({ pub_date: "desc" });

    // execute query
    db_query.exec();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    <url>
        <loc> ${process.env.SCHEME}://${req.headers.host}/ </loc>
        <lastmod> ${format(new Date(), "yyyy-MM-d")} </lastmod>
        <priority>1.00</priority>
    </url>
`;

    db_query
      .then((posts) => {
        posts.forEach((post) => {
          xml += `
<url>
    <loc> ${process.env.SCHEME}://${req.headers.host}/${post.slug} </loc>
    <lastmod> ${format(new Date(post.last_modified), "yyyy-MM-d")} </lastmod>
    <priority> 0.8 </priority>
</url>
`;
        });

        Array.from(sitePages).forEach((page) => {
          xml += `
<url>
    <loc> ${process.env.SCHEME}://${req.headers.host}/${page} </loc>
    <lastmod> ${format(new Date(), "yyyy-MM-d")} </lastmod>
    <priority> 0.8 </priority>
</url>
`;
        });

        xml += `
</urlset>
`;

        res.send(xml);
        resolve();
      })
      .catch(() => {
        res.send(`${xml}</urlset>`);
        resolve();
      });
  });
});
