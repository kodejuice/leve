import { site_details as details } from "../site_config";
import { formatRSSDate } from "./date";

/**
 *
 * @param {Object} post
 * @param {string} site_url
 */
export function getRSSDocString(posts, site_url) {
  const last_modified = posts[0]?.pub_date || new Date();
  const last_modified_date = formatRSSDate(last_modified);

  return `<?xml version="1.0" encoding="UTF-8"?>
  <rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
    <channel>
      <title>${details.name}</title>
      <link>${site_url}</link>
      <language>en-us</language>
      <description>${details.description}</description>
      <pubDate>${last_modified_date}</pubDate>
      <lastBuildDate>${last_modified_date}</lastBuildDate>
      <generator>Leve CMS</generator>
      ${posts
        .map(
          (post) => `
        <item>
          <title>${post.title}</title>
          <link>${site_url}/${post.slug}/</link>
          <description> ${post.excerpt || ""}.</description>
          <pubDate>${formatRSSDate(post.pub_date)}</pubDate>
          <lastBuildDate>${formatRSSDate(post.last_modified)} </lastBuildDate>
          <guid>${site_url}/${post.slug}/</guid>
          <comments> ${site_url}/${post.slug}#comments </comments>
          <category> ${post.topic.join(", ")} </category>
          <language> en-us </language>
        </item>
    `
        )
        .join("\n")}
    </channel>
  </rss>        
`;
}
