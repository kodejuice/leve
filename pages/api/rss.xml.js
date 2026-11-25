import { getPosts } from "../../database/functions";
import { formatRSSDate } from "../../utils/date";
import { getRSSDocString } from "../../utils/rss_docstring";

export default async function handler(req, res) {
  const { host } = req.headers;
  const scheme = process.env.SCHEME;
  const site_url = `${scheme}://${host}`;

  const posts = await getPosts(
    [
      "slug",
      "title",
      "topic",
      "pub_date",
      "last_modified",
      "excerpt",
      "html_content",
    ],
    false,
    { pub_date: "desc" }
  );

  const xmlString = getRSSDocString(posts, site_url);

  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  res.setHeader("Date", formatRSSDate(new Date()));
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );
  res.send(xmlString);
}
