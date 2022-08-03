/* eslint-disable no-use-before-define */
/* eslint-disable no-bitwise */
/* eslint-disable no-param-reassign */
import dynamic from "next/dynamic";
import "react-markdown-editor-lite/lib/index.css";

import { useEffect, useState } from "react";
import Head from "next/head";
import { format } from "date-fns";

import Modal from "react-modal";
import ClipLoader from "react-spinners/ClipLoader";
import { HotKeys } from "react-hotkeys";

import Header from "../../components/admin/Header";
import PreviewPost from "../../components/admin/PreviewPost";
import QuoteSelect from "../../components/admin/QuoteSelect";
import { WordCount, LineCount, toSlug, getKeywords } from "../../utils";

import { getPost } from "../../database/functions";
import verifyAuth from "../../utils/auth";
import { addPostToDB, deleteDBPost } from "../../utils/db_requests";

import { site_details as details } from "../../site_config";

import mdParser from "../../utils/mdParser";

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: false,
  loading: () => <p> Loading editor... </p>,
});

export default function Edit(props) {
  const { post, url, host } = props;
  const isNew = post.slug === null;

  // modal states
  const [previewOpen, openPreview] = useState(false);
  const [quotesOpen, openQuotes] = useState(false);

  // post states
  const post_topic = (post.topic || []).join(",");
  const [slug, setSlug] = useState(post.slug);
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [author_email, setAuthorEmail] = useState(
    post.author_email || details.email
  );
  const [content, setContent] = useState(post.content);
  const [post_image, setPostImage] = useState(post.post_image);
  const [auto_slug, setAutoSlug] = useState("");
  const [postquote, setQuote] = useState(post.post_quote || {});
  const [topic, setTopic] = useState(post_topic);
  const [draft, setVisibility] = useState(post.draft);
  const [allow_comments, allowComment] = useState(Boolean(post.allow_comments));
  const [isSaving, setSaveState] = useState(false);

  const post_data = {
    slug,
    auto_slug,
    post_image,
    title,
    excerpt,
    content,
    postquote,
    topic,
    draft,
    author_email,
    allow_comments,
    isNew,
  };
  //...

  useEffect(() => {
    document.querySelector("body").classList.remove("dark");
    document.querySelector("nav.navbar.fixed-top").classList.remove("bg-dark");
    document.querySelector("nav.navbar.fixed-top").classList.add("bg-light");

    // before unload event
    window.onbeforeunload = function beforeunload(e) {
      // Saving? or New Post? or Deleted?, no need to prompt
      if (isSaving || !slug || window.post_deleted) return null;

      e = e || window.event;

      // For IE and Firefox prior to version 4
      if (e) {
        e.returnValue = "Leave page ?";
      }
      // For Safari
      return "Leave page ?";
    };

    // cleanup
    return () => {
      // before unload event
      window.onbeforeunload = () => null;
    };
  });

  const highlight = post.slug !== null ? { border: "1px solid orange" } : {};
  return (
    <HotKeys keyMap={{ SAVE: "ctrl+enter", PREVIEW: "ctrl+b" }}>
      <HotKeys
        handlers={{
          SAVE: (ev) => {
            ev.preventDefault();
            savePost(post_data, setSaveState, null, url);
          },
          PREVIEW: (ev) => {
            ev.preventDefault();
            if (!quotesOpen) openPreview(!previewOpen);
          },
        }}
      >
        <Head>
          <title> Edit Post &lsaquo; {details.description} - Admin </title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <meta name="robots" content="noindex" />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/markdown-it-texmath/css/texmath.min.css"
          />
        </Head>

        <div className="admin">
          <Modal
            ariaHideApp={false}
            isOpen={previewOpen || quotesOpen}
            contentLabel="Modal"
          >
            {previewOpen ? (
              <>
                <button
                  className="btn btn-danger close-modal"
                  onClick={() => openPreview(false)}
                >
                  <b>X</b>
                </button>
                <PreviewPost
                  post={post_data}
                  content={mdParser.render(content)}
                />
              </>
            ) : (
              <>
                <button
                  className="btn btn-danger close-modal"
                  onClick={() => openQuotes(false)}
                >
                  <b>X</b>
                </button>
                <QuoteSelect
                  setQuote={setQuote}
                  selected={postquote}
                  keywords={getKeywords(`${content || ""} ${excerpt || ""}`)}
                  fullText_kwrds={getKeywords(
                    `${content || ""} ${excerpt || ""}`,
                    false
                  )}
                />
              </>
            )}
          </Modal>

          <Header
            url={url}
            host={host}
            dark={false}
            quick_draft={false}
            page="edit"
          >
            <div className="row">
              <div className="col-12 col-sm-9 border-right">
                <form className="post_create">
                  <div className="form-group">
                    <label htmlFor="Post title" style={{ fontSize: "18px" }}>
                      Post title
                    </label>
                    <input
                      type="text"
                      className="form-control w-50 in"
                      placeholder="Post title"
                      value={title}
                      disabled={isSaving === true}
                      onChange={(v) => {
                        setTitle(v.target.value);

                        // set a slug if there isnt one already
                        const _slug = slug || "";
                        if (_slug.length === 0) {
                          setAutoSlug(toSlug(v.target.value));
                        }
                      }}
                      style={post.title !== title ? highlight : {}}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="Post excerpt" style={{ fontSize: "18px" }}>
                      Post excerpt
                    </label>
                    <input
                      type="text"
                      className="form-control w-50 in"
                      placeholder="Post Excerpt"
                      value={excerpt}
                      disabled={isSaving === true}
                      onChange={(v) => setExcerpt(v.target.value)}
                      style={post.excerpt !== excerpt ? highlight : {}}
                    />
                  </div>
                </form>

                {/* markdown editor */}
                <div className="mt-5">
                  <MdEditor
                    value={content}
                    style={{ height: "500px" }}
                    renderHTML={(text) => {
                      if (!isSaving) {
                        setContent(text);
                        return mdParser.render(text);
                      }
                      setContent(content);
                      return mdParser.render(content);
                    }}
                  />
                </div>
              </div>

              {/* Second column */}
              <div className="col-12 col-sm-3 visible-text">
                {/* BLOCKS */}

                {/*1st block (action block)*/}
                <div className="block-1 border-bottom pb-2 mt-3">
                  {/* view post link */}
                  <button
                    disabled={isSaving === true}
                    className="btn btn-link"
                    onClick={() =>
                      confirm("Save ?") &&
                      savePost(
                        post_data,
                        setSaveState,
                        `//${host}/${slug}`,
                        url
                      )
                    }
                  >
                    <a underline="underline"> View Post Page </a>
                  </button>

                  <div className="btn btn-group">
                    {/* Preview post */}
                    <button
                      onClick={() => openPreview(true)}
                      title="Ctrl-b to preview"
                      disabled={isSaving === true}
                      className="btn btn-outline-secondary"
                    >
                      Preview{" "}
                      <span
                        className="glyphicon glyphicon-eye-open"
                        aria-hidden="true"
                      />
                    </button>

                    {/* Save Post */}
                    <button
                      onClick={() => {
                        savePost(post_data, setSaveState, null, url);
                      }}
                      title="Ctrl-enter to save"
                      disabled={isSaving === true}
                      className="btn btn-outline-primary"
                    >
                      <ClipLoader
                        size={14}
                        color="#123abc"
                        loading={isSaving}
                      />
                      Save{" "}
                      <span
                        className="glyphicon glyphicon-floppy-disk"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                {/*2nd block (readonly info)*/}
                <div
                  className="block-2 border-bottom"
                  style={{ fontSize: "14px" }}
                >
                  {/*views|comments|revisions*/}
                  {!post.draft ? (
                    <>
                      <div className="row">
                        <div className="col-4">Views: </div>{" "}
                        <div className="col">{post.views | 0}</div>{" "}
                      </div>
                      <div className="row">
                        <div className="col-4">Comments: </div>
                        <div className="col comment-div">
                          {/* disqus commentcount */}
                          <a
                            href={`https://${host}/${slug}#disqus_thread`}
                            underline="underline"
                          >
                            {" "}
                            Comments{" "}
                          </a>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="row">
                      {" "}
                      <div className="col-4">Revisions:</div>{" "}
                      <div className="col">{post.draft_revisions | 0} </div>
                    </div>
                  )}

                  {/*publication date*/}
                  {!post.draft && post.pub_date ? (
                    <div className="row mt-2">
                      <div className="col-4">Published: </div>
                      <div className="col-8">
                        {format(new Date(post.pub_date), "MMM d, yyyy HH:mm a")}
                      </div>
                    </div>
                  ) : (
                    ""
                  )}

                  {/*last modified date*/}
                  {!post.draft && post.last_modified ? (
                    <div className="row mt-2">
                      <div className="col-4">Last Modified: </div>
                      <div className="col-8">
                        {format(
                          new Date(post.last_modified),
                          "MMM d, yyyy HH:mm a"
                        )}
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>

                {/*3rd block (post-info settings) */}
                <div className="block-3 mt-1 border-bottom">
                  {/*slug*/}
                  <div className="sub-block">
                    <label htmlFor="Post slug">URL slug</label>
                    {isNew ? (
                      <input
                        style={post.slug !== slug ? highlight : {}}
                        id="slug-input"
                        type="text"
                        disabled={isSaving === true}
                        title={`https://${host}/[post_slug]`}
                        className="form-control"
                        value={slug || auto_slug}
                        placeholder="post slug"
                        onChange={(e) => {
                          setSlug(e.target.value);
                          setAutoSlug("");
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        className="form-control"
                        value={post.slug || ""}
                        readOnly
                      />
                    )}
                  </div>

                  {/*post_image*/}
                  <div className="sub-block">
                    <label htmlFor="Post slug">Post Image</label>
                    <input
                      type="url"
                      id="slug-input"
                      value={post_image}
                      placeholder="http://url to post image"
                      disabled={isSaving === true}
                      title="Image to be used in OpenGraph preview"
                      style={post.post_image !== post_image ? highlight : {}}
                      className="form-control"
                      onChange={(e) => {
                        setPostImage(e.target.value);
                      }}
                    />
                  </div>

                  {/*topic*/}
                  <div className="sub-block">
                    <label htmlFor="Post topic">Post keywords</label>
                    <input
                      style={post_topic !== topic ? highlight : {}}
                      name="topic"
                      type="text"
                      title="used for search engines"
                      disabled={isSaving === true}
                      className="form-control"
                      value={topic || ""}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="separate by commas (, )"
                    />
                  </div>

                  {/* post quote*/}
                  <div className="sub-block">
                    <label htmlFor="Post Quote">Post Quote</label>

                    {postquote.quote ? (
                      <blockquote
                        style={
                          post?.post_quote?.quote !== postquote.quote
                            ? highlight
                            : {}
                        }
                      >
                        <p className="mb-0 post-quote">{postquote.quote}.</p>
                        <footer className="blockquote-footer p-quote text-right">
                          <cite>{postquote.author}</cite>
                        </footer>
                      </blockquote>
                    ) : (
                      <div>Not set</div>
                    )}

                    <button
                      disabled={isSaving === true}
                      className="btn btn-outline-secondary"
                      onClick={() => openQuotes(true)}
                    >
                      Change Quote{" "}
                      <span
                        className="glyphicon glyphicon-eye-edit"
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  {/* draft*/}
                  <div className="sub-block">
                    <label htmlFor="Visibility">Visibility</label>
                    <select
                      disabled={isSaving === true}
                      style={post.draft !== draft ? highlight : {}}
                      className="custom-select"
                      defaultValue={draft}
                      onChange={(e) => setVisibility(e.target.value === "true")}
                    >
                      <option value={false}> Public </option>
                      <option value> Private </option>
                    </select>
                  </div>

                  {/* allow comments*/}
                  <div className="sub-block">
                    <label htmlFor="Visibility">Allow comments</label>
                    <select
                      disabled={isSaving === true}
                      style={
                        post.allow_comments !== Boolean(allow_comments)
                          ? highlight
                          : {}
                      }
                      className="custom-select"
                      defaultValue={allow_comments}
                      onChange={(e) => allowComment(e.target.value === "true")}
                    >
                      <option value> Yes </option>
                      <option value={false}> No </option>
                    </select>
                  </div>

                  {/* author email */}
                  <div className="sub-block">
                    <label htmlFor="Visibility">Authors Email</label>
                    <input
                      type="email"
                      id="email-input"
                      value={author_email}
                      placeholder="enter email"
                      disabled={isSaving === true}
                      title="Authors email"
                      style={
                        post.author_email !== author_email ? highlight : {}
                      }
                      className="form-control"
                      onChange={(e) => {
                        setAuthorEmail(e.target.value);
                      }}
                    />
                  </div>
                </div>

                {/*4th block (text stats) */}
                <div className="block-3 mt-1">
                  <div className="block-1 border-bottom pb-2 mt-3">
                    <div className="row">
                      <div className="col-4">Words: </div>{" "}
                      <div className="col">{WordCount(content)}</div>{" "}
                    </div>
                    <div className="row">
                      <div className="col-4">Lines: </div>{" "}
                      <div className="col comment-div">
                        {LineCount(content)}
                      </div>{" "}
                    </div>
                  </div>
                </div>

                {/*5th block (delete) */}
                {!isNew ? (
                  <div className="block-3 mt-1">
                    <div className="block-1 pb-2 mt-3">
                      <button
                        onClick={() => slug && deletePost(slug, url)}
                        disabled={isSaving === true}
                        className="btn btn-danger"
                      >
                        Delete{" "}
                        <span
                          className="glyphicon glyphicon-trash"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>

            <br />
          </Header>
        </div>
      </HotKeys>
    </HotKeys>
  );
}

/**
 * Saves Post to DB
 */
async function savePost(params, setSaveState, redirect_url, url) {
  const {
    auto_slug,
    title,
    post_image,
    excerpt,
    content,
    postquote,
    topic,
    draft,
    author_email,
    allow_comments,
    isNew,
  } = params;

  const slug = params.slug || auto_slug;

  if (!slug) {
    alert("Invalid Slug!");
    setSaveState(false);
    return false;
  }
  // saveState
  // renders button disabled,
  // dispays a spinner in Save-Button
  setSaveState(true);

  // extract params
  const data = {
    slug,
    title,
    excerpt,
    content,
    post_image,
    post_quote: postquote,
    draft,
    topic: topic.split(","),
    author: details.name,
    author_email,
    allow_comments,
  };

  let res;
  try {
    // create/update post
    res = await addPostToDB(data, isNew, url);
  } catch (e) {
    alert(e);
    setSaveState(false);
    return false;
  }

  // didnt go well ?
  if (res.success !== true) {
    alert(JSON.stringify(res));
    setSaveState(false);
    return false;
  }

  // no need for this, the page gets reloaded anyways
  // and we also need to check if the reload was caused by a Save action
  // so we dont ask the user if they want to leave
  // setSaveState(false);

  if (redirect_url) location.href = redirect_url;
  else location.search = `?slug=${slug}`;
  return null;
}

/**
 * Delete Post from DB
 */
async function deletePost(slug, url) {
  if (confirm("Delete ?")) {
    const res = await deleteDBPost(slug, url);
    if (res.success !== true) {
      return alert(JSON.stringify(res));
    }
    window.post_deleted = true;
    window.location = "list";
  }
  return null;
}

export async function getServerSideProps(ctx) {
  await verifyAuth(ctx);

  const post_id = ctx.query.slug;
  const data = await getPost(post_id, false, true);

  if (data.error) {
    // no post with slug '${post_id}'
    return {
      props: {
        host: ctx.req.headers.host,
        url: `${process.env.SCHEME}://${ctx.req.headers.host}`,
        disqus_host: process.env.DISQUS_HOST,

        post_id: post_id || null,

        // blank template, (new post)
        post: {
          title: "",
          slug: null,
          excerpt: "",
          draft: true,
          allow_comments: true,
          next_post: {},
          post_quote: { quote: null },
        },
      },
    };
  }

  return {
    props: {
      host: ctx.req.headers.host,
      url: `${process.env.SCHEME}://${ctx.req.headers.host}`,
      disqus_host: process.env.DISQUS_HOST,
      post_id,
      post: data,
    },
  };
}
