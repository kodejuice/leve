import Link from "next/link";

import { site_details as details } from "../../site_config";
import { getPostDate } from "../../utils/date";

// single post component
function Post(props) {
  const { title, excerpt, slug, pub_date } = props.info;
  const post_date = getPostDate(pub_date);

  return (
    <div className="mt-3">
      <Link href="/[...id]" as={`/${slug}`}>
        <a className="post-title"> {title} </a>
      </Link>
      <span className="pl-3">
        <time dateTime={pub_date} className="post-date">
          {post_date}
        </time>
      </span>
      <div className="post-excerpt ml-3"> {excerpt} </div>
    </div>
  );
}

/**
 * List posts
 *
 * @param {Object} props
 * @param {Object[]} props.posts Posts array
 * @param {number} props.all_posts_count Total number of posts
 * @param {string} props.title Header title of posts listing
 * @param {boolean} props.show_all Show all posts? (default = false)
 * @returns
 */
function Posts(props) {
  const { post_per_page } = details.site;
  const { posts, all_posts_count } = props;
  const show_all = !!props.show_all;
  const title = props.title || "Most Recent";

  return (
    <div>
      <h2 className="section-title"> {title} </h2>

      {/* no posts yet ? */}
      {posts.length === 0 && (
        <div className="mt-3 ml-2"> Nothing to show here</div>
      )}

      {/* map posts to the Post component */}
      {posts.map((p) => (
        <Post info={p} key={p._id} />
      ))}

      {!show_all && all_posts_count > post_per_page ? (
        <div className="mt-3">
          <Link href="/archives">
            <a className="post-title p-1">All posts</a>
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default Posts;
