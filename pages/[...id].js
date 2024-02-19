/* eslint-disable no-bitwise */
/* eslint-disable react/no-danger */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-use-before-define */
import { useEffect } from "react";

import Link from "next/link";
import Head from "next/head";
import fetch from "node-fetch";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import ProgressBar from "react-scroll-progress-bar";

import readingTime from "reading-time";
import { extend, isEmpty } from "lodash";
import { parseCookies, setCookie } from "nookies";
import HRNumbers from "human-readable-numbers";
import "highlight.js/styles/github.css";

import Toggle from "../components/home/Toggle";
import { Init, Page, sitePages } from "../components/pages/list";
import { getBestMatch } from "../utils/string-similarity";
import { WordCount } from "../utils/index";
import {
  getPost,
  getPosts,
  getPostsByTopic,
  getTopics,
} from "../database/functions";
import { site_details as details } from "../site_config";
import SignupForm from "../components/home/SignupForm";
import { getISOString, getPostDate } from "../utils/date";
import GoBack from "../components/GoBack";
import { LoadComments, LoadCommentsCount } from "../components/CommentsLoader";

// import PageNotFound from "../components/PageNotFound";
const PageNotFound = dynamic(() => import("../components/PageNotFound"), {
  ssr: false,
  loading: () => <p> Page Not Found </p>,
});

// DEBUG
// global.log = (...x) => console.log(...x)
// global.str = JSON.stringify;

function PostView(props) {
  const router = useRouter();

  const { id, host, scheme, corrections } = props;
  let { post } = props;

  useEffect(() => {
    if (post?.slug && !parseCookies(null)[post.slug]) {
      update_views(props.id, scheme).then((yes) => {
        if (yes) {
          // store cookie so the 'views' field of this post gets updated once
          setCookie(null, post.slug, "1", {
            path: "/",
            maxAge: 86400 * 62 /* 62 days */,
          });
        }
      });
    }
  });

  // a site page?
  if (sitePages.has(id)) {
    return <>{Page[id](props)}</>;
  }

  // page not yet generated
  // display an incomplete loading page
  // until getStaticProps() finish running
  if (router.isFallback) {
    post = getPlaceholder(host);
  } else if (!post) {
    // no post data
    // implies invalid post id, render 404 page
    return <PageNotFound id={id} corrections={corrections} />;
  }

  const site_url = post.is_loading ? "" : `${scheme}://${host}/`;
  const page_url = post.is_loading ? "" : `${scheme}://${host}/${post.slug}`;
  const post_keywords = isEmpty(post.topic.join())
    ? post.excerpt
    : post.topic.join(", ");
  const page_description = post.is_loading
    ? "Post doesn't exist"
    : `${post.excerpt}, By: ${post.author}`;

  const post_views = post.views | 0;

  const post_content = post.html_content;
  const stripped_content = post_content.replace(/<[^>]+>/gi, ""); // remove tags
  const timeToRead = readingTime(stripped_content);
  const words_in_post = WordCount(stripped_content);

  return (
    <>
      <ProgressBar bgcolor="#999" height="5px" />

      <div className="container">
        <Head>
          <title> {post.title} </title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <meta name="description" content={page_description} />
          <meta name="keywords" content={post_keywords} />

          {/*<!-- Facebook Meta Tags -->*/}
          <meta property="og:type" content="article" />
          <meta property="og:image" content={post.post_image} />
          <meta property="og:title" content={post.title} />
          <meta property="og:url" content={page_url} />
          <meta property="og:description" content={page_description} />
          <meta property="og:site_name" content={details.description} />

          {/*<!-- Twitter Meta Tags -->*/}
          <meta name="twitter:creator" content={`@${details.handle.twitter}`} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="twitter:domain" content={host} />
          <meta property="twitter:url" content={page_url} />

          {/* styling for katex */}
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css"
          />
          {/* <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/markdown-it-texmath/css/texmath.min.css"
          /> */}

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: `{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "${post.title}",
  "image": [
    "${post.post_image}",
    ],
  "wordCount": "${words_in_post}",
  "datePublished": "${post.pub_date_iso}",
  "dateModified": "${post.last_modified_iso}",
  "author": [{
      "@type": "Person",
      "name": "${post.author}",
      "url": "${site_url}"
    }]
}
`,
            }}
          />
        </Head>

        <div className="hide-on-desktop mt-4">
          <div title="Go Home">
            <GoBack title="Back" />
          </div>
        </div>

        <div className="position-fixed action-btn">
          <div className="toggler">
            <Toggle onSwitch={() => reloadCommentThread()} />
          </div>

          <div className="hide-on-mobile">
            <p
              className="hide-on-lt-823"
              style={{ position: "fixed", top: 0, left: 2, fontFamily: "Fira" }}
            >
              <small style={{ fontSize: "14px" }}>{details.name}</small>
            </p>
            <div title="Go Home">
              <GoBack />
            </div>
            <div className="mt-4">
              {parseCookies(null).__token ? (
                <>
                  <div title="Edit post">
                    <Link href={`admin/edit?slug=${post.slug}`}>
                      <a className="btn btn-link">
                        <span className="glyphicon glyphicon-pencil" />
                      </a>
                    </Link>
                  </div>

                  <div title="Add new post">
                    <Link href="admin/edit">
                      <a className="btn btn-link">
                        <span className="glyphicon glyphicon-plus" />
                      </a>
                    </Link>
                  </div>

                  <div>
                    {(post.views && (
                      <small>
                        <em title={post_views} className="mt-1">
                          {HRNumbers.toHumanString(post_views)} views
                        </em>
                      </small>
                    )) ||
                      null}
                  </div>
                </>
              ) : (
                !parseCookies(null).__token &&
                post.views && (
                  <div>
                    <small>
                      <em title={post_views} className="mt-1">
                        {HRNumbers.toHumanString(post_views)} views
                      </em>
                    </small>
                  </div>
                )
              )}
              <div>
                {(post.draft && (
                  <div
                    title="This post isnt published yet"
                    className="mt-3 p-0 btn btn-secondary px-1"
                  >
                    DRAFT
                  </div>
                )) ||
                  null}
              </div>
            </div>
          </div>
        </div>

        <section>
          <div className="home-main mt-5 post-view pl-2">
            <header>
              <h1 className="post-title"> {post.title} </h1>
              <p className="info ml-3">
                <Link href="/">
                  <a title="author" className="no-underline">
                    {post.author}
                  </a>
                </Link>
                ,<span>&lt;</span>
                <a
                  target="_blank"
                  href={`mailto:${post.author_email}`}
                  rel="noreferrer"
                >
                  {post.author_email}
                </a>
                <span>/&gt;</span>
              </p>
            </header>

            <div className="article">
              <article>
                {!post.is_loading && (
                  <p className="pub_date">
                    <span className="mr-2">{post.pub_date}</span> ·{" "}
                    <span className="ml-2">{timeToRead.text}</span>
                  </p>
                )}

                {/* quote */}
                {post.post_quote != null ? (
                  <blockquote className="blockquote text-right mt-4">
                    <p className="mb-0 post-quote">{post.post_quote.quote}</p>
                    <footer className="blockquote-footer p-quote">
                      <cite title="Author">{post.post_quote.author}</cite>
                    </footer>
                  </blockquote>
                ) : (
                  ""
                )}

                {/* post content */}
                <div
                  className="post-content mt-4 visible-text"
                  dangerouslySetInnerHTML={{
                    __html: post_content,
                  }}
                />
                <p className="pt-1 text-right updated-time">
                  {" "}
                  {post.last_modified !== post.pub_date &&
                    `Updated ${post.last_modified}`}{" "}
                </p>
              </article>

              <footer>
                <div className="row mb-2 _post_footer">
                  {/* subsribe to newsletter */}
                  <div className="col">
                    <legend id="subscribe" className="visible-text">
                      Get an email whenever theres a new article
                    </legend>
                    <div className="form-row newsletter-signup">
                      <div className="col">
                        <SignupForm />
                      </div>
                    </div>
                  </div>

                  {/* next post >> */}
                  {!isEmpty(post.next_post) ? (
                    <div className="col-12 col-sm-6 text-right next-post-link">
                      <Link href="[...id].js" as={`/${post.next_post.slug}`}>
                        <a className="next-post-link">
                          {post.next_post.title}{" "}
                          <span className="glyphicon glyphicon-chevron-right" />
                        </a>
                      </Link>
                    </div>
                  ) : (
                    ""
                  )}
                </div>

                <div className="mb-4">
                  <div className="text-left">
                    <Link href="/">
                      <a className="">
                        <span className="glyphicon glyphicon-chevron-left" />
                        Home
                      </a>
                    </Link>
                  </div>
                </div>
              </footer>

              {/*<!-- COMMENTS HERE -->*/}
              <div className="comments" id="comments">
                {!post.allow_comments ? (
                  post.is_loading ? null : (
                    <b>
                      <em> Comments Disabled </em>
                    </b>
                  )
                ) : (
                  <div>
                    <div
                      id="fastcomments-count"
                      className="post-comments-count"
                    >
                      Comments
                    </div>
                    <div id="fastcomments-widget" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <LoadComments elementId="fastcomments-widget" />
      <LoadCommentsCount
        elementId="fastcomments-count"
        urlId={`//${host}/${post.slug}`}
      />
    </>
  );
}

// reload comment thread
function reloadCommentThread() {
  try {
    // eslint-disable-next-line no-undef
    loadComments();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

// this update the `views` property of a post
// in the database
async function update_views(slug, scheme) {
  if (!slug) return;
  const url = `${scheme}://${location.host}/api/post/${slug}`;
  await fetch(url, {
    headers: { cookie: parseCookies(null) },
  });
  return true;
}

// placeholder data
// this will be used if the page isFallback
function getPlaceholder() {
  return {
    is_loading: true,
    topic: [],
    slug: "/",
    views: 0,
    draft: 0,
    // content: "![Loading...](icons/spinner.svg)",
    html_content: "<img src='icons/spinner.svg' alt='Loading...'/>",
    title: "Loading...",
    post_image: `https://tinyurl.com/y3x3hrzk`,
    author: details.name,
    author_email: details.email,
    pub_date: null,
    last_modified: null,
    pub_date_iso: "",
    last_modified_iso: "",
    allow_comments: false,
    post_quote: null, // {}
    next_post: null, // {}
  };
}

/////////////////////
// pre-render util //
////////////////////

// get routes that should be pre-rendered
export async function getStaticPaths() {
  // posts
  const data = (await getPosts(["slug", "topic"])) || [];

  // site pages
  const site_pages = Array.from(sitePages).map((p) => ({ slug: p }));

  // post topics
  const post_topics = (await getTopics()).map((topic) => ({
    slug: `topic/${topic.toLowerCase()}`,
  }));

  // collate
  const all = data.concat(site_pages).concat(post_topics);

  return {
    paths: all.map((post) => ({
      params: { id: post.slug.split("/") },
    })),

    fallback: true,
  };
}

// fetch Post information from database
export async function getStaticProps(ctx) {
  const params = ctx.params.id;
  const [path, id /* needed for multi-route pages */] = params;
  const [host, scheme] = [process.env.HOST, process.env.SCHEME];

  const props = {
    host,
    scheme,
    id: path,
    ga_track_code: process.env.GA_TRACK_CODE,
  };

  const staticProps = {
    revalidate: 1,
  };

  if (sitePages.has(path)) {
    props.paths = params;
    if (Init[path]) {
      props[path] = (await Init[path](id)) || {};
    }
    if (path === "archives") {
      props.archives = await getPosts(["title", "slug", "topic", "excerpt"]);
    }
    if (path === "topic") {
      props.posts = await getPostsByTopic(id);
    }
    return extend(staticProps, {
      props: extend(props, {
        post: {},
      }),
    });
  }

  // fetch post from DB
  const data = await getPost(path);
  if (data.error) {
    // no post with slug '${path}'
    return extend(staticProps, {
      props: extend(props, {
        corrections: await getBestMatch(path),
      }),
    });
  }

  // preserve original date object
  data.pub_date_iso = getISOString(data.pub_date);
  data.last_modified_iso = getISOString(data.last_modified);

  // format date in post
  data.pub_date = getPostDate(data.pub_date);
  data.last_modified = getPostDate(data.last_modified);

  // remove markdown content, we don't need it here, we'll use
  // html_content instead if we dont do this, the HTML source
  //  will be bloated and take longer to load
  data.content = null;

  return extend(staticProps, {
    props: extend(props, {
      post: data,
    }),
  });
}

export default PostView;
