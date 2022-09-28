import { getPostsByTopic } from "../../../database/functions";
import { formatRSSDate } from "../../../utils/date";
import { getRSSDocString } from "../../../utils/rss_docstring";

export default async function handler(req, res) {
  const { host } = req.headers;
  const scheme = process.env.SCHEME;
  const site_url = `${scheme}://${host}`;

  const { category } = req.query;

  const posts = await getPostsByTopic(
    category,
    [
      "slug",
      "title",
      "topic",
      "pub_date",
      "last_modified",
      "excerpt",
      "html_content",
    ],
    { pub_date: "desc" }
  );

  const xmlString = getRSSDocString(posts, site_url);

  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  res.setHeader("Date", formatRSSDate(new Date()));
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.send(xmlString);
}
