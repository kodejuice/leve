import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

import Pagination from "react-js-pagination";

import { scrollToTop } from "../../utils";
import { site_details as details } from "../../site_config";

// single post component
function Post(props) {
  const { title, excerpt, slug, pub_date, last_modified } = props.info;
  const post_date = format(new Date(pub_date), "MMMM dd, yyyy");
  const last_modified_date = format(new Date(last_modified), "MMMM do, yyyy");
  const display_last_updated = post_date !== last_modified_date;

  return (
    <div className="mt-3">
      <Link href="/[...id]" as={`/${slug}`}>
        <a className="post-title"> {title} </a>
      </Link>
      <span className="pl-3">
        <time
          dateTime={pub_date}
          className="post-date"
          title={
            display_last_updated ? `Last updated on ${last_modified_date}` : ""
          }
        >
          {post_date}
        </time>
      </span>
      <div className="post-excerpt ml-3"> {excerpt} </div>
    </div>
  );
}

// list posts
function Posts(props) {
  const [activePage, setActivePage] = useState(1); // pagination state
  const [display_all, setDisplay] = useState(false); // post list state

  let post_block;
  const { post_per_page } = details.site;

  if (display_all) {
    // display all
    const { all_posts } = props;

    // pagination data
    const start = (activePage - 1) * post_per_page;
    const length = start + post_per_page;
    const posts_len = all_posts.length;

    // console.log([start, length, posts_len, `showing=${all_posts.slice(start, length).length}`]);

    post_block = (
      <div>
        <h2 className="section-title"> All Posts </h2>
        <div className="home-posts">
          {all_posts.slice(start, length).map((p) => (
            <Post info={p} key={p._id} />
          ))}
        </div>

        <div className="mt-4">
          {(posts_len > post_per_page && (
            <Pagination
              activePage={activePage}
              pageRangeDisplayed={4}
              itemsCountPerPage={post_per_page}
              totalItemsCount={posts_len}
              onChange={(p) => scrollToTop(() => setActivePage(p), 50, 40)}
              itemClass="page-item"
              linkClass="page-link"
              hideDisabled
            />
          )) ||
            ""}
        </div>

        <a
          onClick={() => scrollToTop(() => setDisplay(false))}
          className="link-btn btn btn-link p-1"
        >
          Recent posts
        </a>
      </div>
    );
  } else {
    // display most recent
    const { recent_posts } = props;

    post_block = (
      <div>
        <h2 className="section-title"> Most Recent </h2>

        {/* no posts yet ? */}
        {recent_posts.length === 0 ? (
          <div className="mt-3 ml-2"> Nothing to show here</div>
        ) : (
          ""
        )}

        {/* map posts to the Post component */}
        {recent_posts.map((p) => (
          <Post info={p} key={p._id} />
        ))}

        {props.all_posts.length > post_per_page ? (
          <a
            onClick={() => scrollToTop(() => setDisplay(true))}
            className="link-btn btn btn-link p-1"
          >
            All posts
          </a>
        ) : (
          ""
        )}
      </div>
    );
  }

  return post_block;
}

export default Posts;
