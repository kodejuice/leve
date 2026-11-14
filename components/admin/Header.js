/* eslint-disable no-use-before-define */
import { useState } from "react";
import Link from "next/link";
import ClipLoader from "react-spinners/ClipLoader";

import { addPostToDB } from "../../utils/db_requests";
import { site_details as details } from "../../site_config";

const navLinks = [
  {
    href: "/admin/list",
    page: "list",
    name: "Posts",
  },
  {
    href: "/admin/edit",
    page: "edit",
    name: "+ New Post",
  },
  {
    href: "/admin/export",
    page: "export",
    name: "Export",
  },
  {
    href: "/admin/import",
    page: "import",
    name: "Import",
  },
];

function HeaderWrapper(props) {
  const { page, url } = props;

  const [saving, setSaving] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostSlug, setNewPostSlug] = useState("");

  return (
    <div className="admin-layout">
      {/* Top Navigation Bar */}
      <header className="admin-nav-bar navbar">
        <div className="admin-nav-inner">
          <div className="admin-brand-group">
            <Link href="/admin/list">
              <a className="admin-brand-title">
                {details.name}
                <span className="admin-badge">Admin</span>
              </a>
            </Link>
          </div>

          <nav className="admin-nav-links" aria-label="Admin Navigation">
            {navLinks.map((item) => (
              <Link href={item.href} key={item.name}>
                <a
                  className={`admin-nav-link ${
                    page === item.page ? "active" : ""
                  }`}
                >
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>

          <div className="admin-nav-actions">
            <Link href="/">
              <a
                className="admin-site-link"
                target="_blank"
                rel="noreferrer"
                title="Open live website"
              >
                View Site &rarr;
              </a>
            </Link>
            <button
              type="button"
              className="admin-signout-btn"
              onClick={() => {
                if (confirm("Sign out of admin?")) {
                  document.cookie = "__token=; path=/; max-age=0;";
                  window.location = "/admin/login";
                }
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-main-wrap">
        <div className="admin-content-shell">
          {props.quick_draft && (
            <div className="admin-quick-draft-box">
              <h3 className="quick-draft-title">Quick Draft</h3>
              <form
                className="quick-draft-form"
                onSubmit={(ev) => {
                  ev.preventDefault();
                  saveDraft(setSaving, url, [newPostSlug, newPostTitle]);
                }}
              >
                <div className="draft-inputs">
                  <input
                    type="text"
                    name="qtitle"
                    className="admin-input"
                    placeholder="Working post title..."
                    value={newPostTitle}
                    onChange={(e) => {
                      setNewPostTitle(e.target.value);
                      if (!newPostSlug || newPostSlug.length < 3) {
                        setNewPostSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-+|-+$/g, "")
                        );
                      }
                    }}
                  />
                  <input
                    type="text"
                    name="qslug"
                    className="admin-input"
                    placeholder="url-slug"
                    value={newPostSlug}
                    onChange={(e) => setNewPostSlug(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="admin-btn-save"
                  disabled={saving}
                >
                  {saving ? (
                    <ClipLoader size={14} color="#ffffff" loading={saving} />
                  ) : (
                    "Create Draft"
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="admin-body-content">{props.children}</div>
        </div>
      </main>
    </div>
  );
}

/**
 *
 * @param {(boolean)=>void} setSaving
 * @param {string} url
 * @param {string[slug, title]} posts
 * @returns
 */
async function saveDraft(setSaving, url, [slug, title]) {
  if (!title.trim().length || !slug.trim().length) return;

  setSaving(true);

  const res = await addPostToDB(
    {
      slug: slug.trim(),
      title: title.trim(),
      author: details.name,
      author_email: details.email,
    },
    true,
    url
  );

  if (res.success) {
    window.location.search = "?draft=1";
  } else {
    alert(JSON.stringify(res));
  }
  setSaving(false);
}

export default HeaderWrapper;
