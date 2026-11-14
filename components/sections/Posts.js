import Link from "next/link";
import { site_details as details } from "../../site_config";
import { getPostDate } from "../../utils/date";

function Post({ info }) {
  const { title, excerpt, slug, pub_date } = info;
  const postDate = getPostDate(pub_date);

  return (
    <article className="post-entry">
      <div className="post-entry-header">
        <Link href="/[...id]" as={`/${slug}`}>
          <a className="post-entry-title">{title}</a>
        </Link>
        {pub_date && (
          <time dateTime={pub_date} className="post-entry-date">
            {postDate}
          </time>
        )}
      </div>
      {excerpt && <p className="post-entry-excerpt">{excerpt}</p>}
    </article>
  );
}

export default function Posts(props) {
  const { post_per_page } = details.site;
  const { posts, all_posts_count } = props;
  const show_all = Boolean(props.show_all);
  const title = props.title || "Recent Writing";

  return (
    <div className="posts-container">
      <div className="posts-header-row">
        <h2 className="section-title">{title}</h2>
        {!show_all && all_posts_count > 0 && (
          <span className="posts-count-badge">
            {all_posts_count} {all_posts_count === 1 ? "essay" : "essays"}
          </span>
        )}
      </div>

      {(!posts || posts.length === 0) && (
        <p className="empty-notice">
          <em>No posts found in this section.</em>
        </p>
      )}

      <div className="posts-list">
        {posts?.map((p) => (
          <Post info={p} key={p._id || p.slug} />
        ))}
      </div>

      {!show_all && all_posts_count > post_per_page ? (
        <div className="posts-view-all">
          <Link href="/archives">
            <a className="archive-link">
              Explore complete archives &amp; topics &rarr;
            </a>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
