/* eslint-disable no-use-before-define */
import { useState } from "react";
import Link from "next/link";
import ClipLoader from "react-spinners/ClipLoader";
import { parseCookies } from "nookies";

import { addPostToDB } from "../../utils/db_requests";
import { site_details as details } from "../../site_config";

const sidebarLinks = [
  {
    icon: "book",
    href: "/admin/list",
    page: "list",
    name: "Posts",
  },
  {
    icon: "floppy-disk",
    href: "/admin/export",
    page: "export",
    name: "Export Data",
  },
  {
    icon: "floppy-disk",
    href: "/admin/import",
    page: "import",
    name: "Import Data",
  },
];

function HeaderWrapper(props) {
  const { page, host, url } = props;

  const [saving, setSaving] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostSlug, setNewPostSlug] = useState("");

  const theme =
    parseCookies(null).__dark === "1" || props.is_dark ? "bg-dark" : "bg-light";

  return (
    <div className="container-fluid">
      {/* navbar */}
      <nav
        className={`navbar ${theme} fixed-top flex-md-nowrap p-0 shadow`}
        style={{ zIndex: 999 }}
      >
        <a
          title="Visit website"
          className="no-bg-color navbar-brand col-sm-3 col-md-2 mr-0"
          href={`http://${host}`}
        >
          {details.name}
        </a>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap">
            <a
              className="nav-link btn btn-link no-bg-color"
              onClick={() => {
                if (confirm("Sign out?")) {
                  document.cookie = "__token=; path=/; maxAge=0;";
                  location.reload();
                }
              }}
            >
              {" "}
              Sign Out
            </a>
          </li>
        </ul>
      </nav>

      <div className="row">
        {/* sidebar */}
        <nav className="col-md-2 d-none d-md-block sidebar position-relative">
          <div className="sidebar-sticky">
            <ul className="nav flex-column mt-5">
              {sidebarLinks.map((obj) => (
                <li className="nav-item" key={obj.href}>
                  <Link href={obj.href} key={obj.name}>
                    <a
                      className={`nav-link${
                        page === obj.page ? " active" : ""
                      } no-bg-color`}
                    >
                      <span
                        className={`mr-2 glyphicon glyphicon-${obj.icon}`}
                      />
                      {obj.name} <span className="sr-only">(current)</span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <main
          style={{ paddingTop: "60px" }}
          role="main"
          className="col-md-9 ml-sm-auto col-lg-10 px-4 position-relative"
        >
          <div className="position-relative main mb-4">
            {props.quick_draft && (
              <div className="border-bottom quick-draft">
                <h4>Quick draft</h4>
                <form className="form-inline">
                  <div className="form-row align-items-center">
                    <div className="col-auto" title="post title">
                      <label className="sr-only" htmlFor="title">
                        Title
                      </label>
                      <input
                        type="text"
                        name="qtitle"
                        className="form-control mb-2"
                        placeholder="post title"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                      />
                    </div>
                    <div className="col-auto" title="post slug">
                      <label className="sr-only" htmlFor="slug">
                        Slug
                      </label>
                      <input
                        type="text"
                        name="qslug"
                        className="form-control mb-2"
                        placeholder="post slug"
                        value={newPostSlug}
                        onChange={(e) => setNewPostSlug(e.target.value)}
                      />
                    </div>
                    <div className="col-auto">
                      <button
                        type="submit"
                        className="mb-2 btn btn-outline-secondary"
                        onClick={(ev) => {
                          ev.preventDefault();
                          saveDraft(setSaving, url, [
                            newPostSlug,
                            newPostTitle,
                          ]);
                        }}
                      >
                        <ClipLoader size={14} color="#333" loading={saving} />{" "}
                        Save Draft
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* page content */}
          <div className="page-content">{props.children}</div>
        </main>
      </div>
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
  if (!title.length || !slug.length) return;

  // set SavingState
  setSaving(true);

  const res = await addPostToDB(
    {
      slug,
      title,
      author: details.name,
      author_email: details.email,
    },
    true,
    url
  );

  if (res.success) {
    location.search = "?draft=1";
  } else {
    alert(JSON.stringify(res));
  }
  setSaving(false);
}

export default HeaderWrapper;
