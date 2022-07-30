/* eslint-disable no-bitwise */
/* eslint-disable no-use-before-define */
import { useState } from "react";
import Link from "next/link";

import Pagination from "react-js-pagination";

import { scrollToTop } from "../../utils";
import { deleteDBPost } from "../../utils/db_requests";
import { site_details as details } from "../../site_config";

function List(props) {
  const [activePage, setActivePage] = useState(1); // pagination state
  const { is_published, posts, url } = props;

  // pagination data
  const { post_per_page } = details.site;

  const start = (activePage - 1) * post_per_page;
  const length = start + post_per_page;
  const posts_len = posts.length;
  // ...

  return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered post-listing">
        <thead>
          <tr>
            <td scope="col">Title</td>
            <td scope="col">Category</td>

            {/* comments/revisions */}
            <td scope="col" title={is_published ? "Comments" : "Revisions"}>
              {" "}
              <span
                className={`glyphicon glyphicon-${
                  is_published ? "comment" : "edit"
                }`}
              />{" "}
            </td>

            {/* publication/creation date */}
            <td
              scope="col"
              title={is_published ? "Publication Date" : "Creation Date"}
            >
              {" "}
              <span className="glyphicon glyphicon-time" />{" "}
            </td>
          </tr>
        </thead>

        <tbody>
          {posts.slice(start, length).map((post) => (
            <tr key={post._id}>
              <td>
                {/* Post title */}
                <Link href={`edit?slug=${post.slug}`}>
                  <a className="p-link" title={post.excerpt}>
                    {" "}
                    {post.title}{" "}
                  </a>
                </Link>

                {/* View post link */}
                <Link href="/[...id].js" as={`/${post.slug}`}>
                  <a className="btn btn-link btn-sm" title="View">
                    {" "}
                    <span
                      className="glyphicon glyphicon-eye-open"
                      aria-hidden="true"
                    />{" "}
                  </a>
                </Link>

                {/* Delete post (drafts only) */}
                {!is_published ? (
                  <button
                    className="btn-link btn pl-0 ml-0 mb-0 pb-0"
                    onClick={async () => {
                      deletePost(post.slug, url);
                    }}
                  >
                    <a className="btn btn-link btn-sm" title="Delete">
                      {" "}
                      <span
                        className="glyphicon glyphicon-trash"
                        aria-hidden="true"
                      />{" "}
                    </a>
                  </button>
                ) : (
                  ""
                )}
              </td>

              {/* Post category */}
              <td> {post.topic.join(", ") || "Uncategorized"} </td>

              {/* Comment_count || Revisions_count */}
              {is_published ? (
                <td className="comment-count">
                  <a href={`${url}/${post.slug}#disqus_thread`}> cmnts </a>
                </td>
              ) : (
                <td>{post.draft_revisions | 0}</td>
              )}

              {/* Publication/Creation date */}
              <td>{is_published ? post.pub_date : post.creation_date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        {posts_len > post_per_page && (
          <Pagination
            activePage={activePage}
            pageRangeDisplayed={4}
            itemsCountPerPage={post_per_page}
            totalItemsCount={posts_len}
            onChange={(p) => scrollToTop(() => setActivePage(p), 400, 0)}
            itemClass="page-item"
            linkClass="page-link"
            hideDisabled
          />
        )}
      </div>
    </div>
  );
}

// delete post button click
async function deletePost(slug, url) {
  if (confirm("Delete ?")) {
    const res = await deleteDBPost(slug, url);
    if (res.success !== true) {
      return alert(JSON.stringify(res));
    }
    window.location = "list";
  }
  return null;
}

export default function Posts(props) {
  const { url } = props;
  const { drafts, published } = props.posts;
  const [list_published, setState] = useState(
    !(props.show_draft_on_load && drafts.length > 0)
  );

  const l_pub = list_published;
  return (
    <>
      <div className="mt-4">
        <div className="toggle-btn">
          {(published.length && (
            <a
              onClick={() => setState(true)}
              className={`no-bg-color link-btn btn btn-link bold-${l_pub}`}
            >
              {" "}
              Published ({published.length}){" "}
            </a>
          )) ||
            ""}
          {(published.length && drafts.length && <b>|</b>) || ""}
          {(drafts.length && (
            <a
              onClick={() => setState(false)}
              className={`no-bg-color link-btn btn btn-link bold-${!l_pub}`}
            >
              {" "}
              Draft ({drafts.length}){" "}
            </a>
          )) ||
            ""}
        </div>
      </div>

      <div className="list ml-3 mt-3">
        {drafts.length || published.length ? (
          <List
            url={url}
            posts={list_published ? published : drafts}
            is_published={list_published}
          />
        ) : (
          <h5>Nothing here! Create a new post</h5>
        )}
      </div>
    </>
  );
}
