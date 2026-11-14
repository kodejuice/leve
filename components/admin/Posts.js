/* eslint-disable no-bitwise */
/* eslint-disable no-use-before-define */
import { useState } from "react";
import Link from "next/link";
import Pagination from "react-js-pagination";

import { scrollToTop } from "../../utils";
import { deleteDBPost } from "../../utils/db_requests";
import { site_details as details } from "../../site_config";

function List(props) {
  const [activePage, setActivePage] = useState(1);
  const { is_published, posts, url } = props;

  const { post_per_page } = details.site;
  const start = (activePage - 1) * post_per_page;
  const length = start + post_per_page;
  const posts_len = posts.length;

  return (
    <div className="admin-table-container">
      <table className="admin-posts-table">
        <thead>
          <tr>
            <th className="th-title">Title &amp; Slug</th>
            <th className="th-topics">Topics</th>
            <th className="th-meta">
              {is_published ? "Comments" : "Revisions"}
            </th>
            <th className="th-date">
              {is_published ? "Published" : "Created"}
            </th>
            <th className="th-actions">Actions</th>
          </tr>
        </thead>

        <tbody>
          {posts.slice(start, length).map((post) => (
            <tr key={post._id || post.slug}>
              <td className="td-title">
                <div className="post-entry-head">
                  <Link href={`/admin/edit?slug=${post.slug}`}>
                    <a
                      className="post-row-title"
                      title={post.excerpt || post.title}
                    >
                      {post.title}
                    </a>
                  </Link>
                  <span className="post-row-slug">/{post.slug}</span>
                </div>
              </td>

              <td className="td-topics">
                <div className="topic-tags-wrap">
                  {post.topic && post.topic.length > 0 ? (
                    post.topic.map((t) => (
                      <span key={t} className="admin-topic-pill">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="admin-topic-empty">—</span>
                  )}
                </div>
              </td>

              <td className="td-meta">
                {is_published ? (
                  <a
                    href={`${url}/${post.slug}#comments`}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-comment-link"
                  >
                    Discuss &rarr;
                  </a>
                ) : (
                  <span className="admin-rev-count">
                    {post.draft_revisions | 0} revs
                  </span>
                )}
              </td>

              <td className="td-date">
                <span className="admin-date-text">
                  {is_published ? post.pub_date : post.creation_date}
                </span>
              </td>

              <td className="td-actions">
                <div className="admin-actions-group">
                  <Link href={`/admin/edit?slug=${post.slug}`}>
                    <a className="admin-btn-action edit" title="Edit Post">
                      Edit
                    </a>
                  </Link>
                  <Link href="/[...id].js" as={`/${post.slug}`}>
                    <a
                      className="admin-btn-action view"
                      title="View Post"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </Link>
                  {!is_published && (
                    <button
                      type="button"
                      className="admin-btn-action delete"
                      title="Delete Draft"
                      onClick={() => deletePost(post.slug, url)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {posts_len > post_per_page && (
        <div className="admin-pagination-bar">
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
        </div>
      )}
    </div>
  );
}

// delete post button click
async function deletePost(slug, url) {
  if (confirm(`Permanently delete draft "${slug}"?`)) {
    const res = await deleteDBPost(slug, url);
    if (res.success !== true) {
      return alert(JSON.stringify(res));
    }
    window.location = "list?draft=1";
  }
  return null;
}

export default function Posts(props) {
  const { url } = props;
  const { drafts, published } = props.posts;
  const [list_published, setState] = useState(
    !(props.show_draft_on_load && drafts.length > 0)
  );

  return (
    <div className="admin-posts-view">
      <div className="admin-tabs-row">
        <div className="admin-segmented-tabs">
          <button
            type="button"
            onClick={() => setState(true)}
            className={`admin-tab-btn ${list_published ? "active" : ""}`}
          >
            Published <span className="tab-badge">{published.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setState(false)}
            className={`admin-tab-btn ${!list_published ? "active" : ""}`}
          >
            Drafts <span className="tab-badge">{drafts.length}</span>
          </button>
        </div>
      </div>

      <div className="admin-posts-body">
        {drafts.length || published.length ? (
          <List
            url={url}
            posts={list_published ? published : drafts}
            is_published={list_published}
          />
        ) : (
          <div className="admin-empty-state">
            <p>No posts found in this section.</p>
            <Link href="/admin/edit">
              <a className="admin-action-btn primary">+ Write First Post</a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
