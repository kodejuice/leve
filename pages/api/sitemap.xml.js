import { getPosts } from "../../database/functions";
import { sitePages } from "../../components/pages/list";
import { formatRSSDate } from "../../utils/date";

// https://www.google.com/ping?sitemap=FULL_URL_OF_SITEMAP

export default async function handler(req, res) {
  const { host } = req.headers;
  const scheme = process.env.SCHEME;

  const posts = await getPosts([
    "slug",
    "title",
    "topic",
    "pub_date",
    "last_modified",
    "excerpt",
    "html_content",
  ]);

  const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${scheme}://${host}/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>0.4</priority>
    </url>
      ${posts
        .map(
          (post) =>
            `
    <url>
        <loc>${scheme}://${host}/${post.slug}</loc>
        <lastmod>${new Date(post.last_modified).toISOString()}</lastmod>
        <priority>0.8</priority>
    </url>`
        )
        .join("\n")}
      ${Array.from(sitePages)
        .map(
          (page) => `
    <url>
        <loc>${scheme}://${host}/${page}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>0.8</priority>
    </url>`
        )
        .join("\n")}
</urlset>
  `;

  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  res.setHeader("Date", formatRSSDate(new Date()));
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.send(xmlString);
}
