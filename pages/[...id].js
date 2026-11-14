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
import { Page, sitePages } from "../components/pages/list";
import { getBookShelves } from "../utils/goodreads";
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
      update_views(props.id).then((yes) => {
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
      <ProgressBar bgcolor="#9e472a" height="3px" />

      <div className="page-wrapper post-page-wrapper">
        <Head>
          <title>
            {post.title} — {details.name}
          </title>
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

        <div className="page-container post-view-container">
          {/* Post Top Bar: Breadcrumb + Author + Theme & Admin controls */}
          <div className="post-top-bar">
            <div className="post-top-left">
              <GoBack title="All Writing" />
            </div>

            <div className="post-top-right">
              {parseCookies(null).__token && (
                <div className="admin-post-actions">
                  <Link href={`admin/edit?slug=${post.slug}`}>
                    <a className="admin-btn" title="Edit Post">
                      Edit
                    </a>
                  </Link>
                  <Link href="admin/edit">
                    <a className="admin-btn" title="New Post">
                      + New
                    </a>
                  </Link>
                </div>
              )}
              <Toggle onSwitch={() => reloadCommentThread()} />
            </div>
          </div>

          <article className="post-main-article">
            <header className="post-header">
              {post.draft ? (
                <div
                  className="post-draft-badge"
                  title="This post isn't published yet"
                >
                  DRAFT
                </div>
              ) : null}

              <h1 className="post-main-title">{post.title}</h1>

              <div className="post-meta-byline">
                <span className="post-author-name">{post.author}</span>
                <span className="meta-sep">&bull;</span>
                {!post.is_loading && (
                  <>
                    <time
                      dateTime={post.pub_date_iso}
                      className="post-pub-date"
                    >
                      {post.pub_date}
                    </time>
                    <span className="meta-sep">&bull;</span>
                    <span className="post-read-time">{timeToRead.text}</span>
                  </>
                )}
                {post.views ? (
                  <>
                    <span className="meta-sep">&bull;</span>
                    <span className="post-view-count">
                      {HRNumbers.toHumanString(post_views)} views
                    </span>
                  </>
                ) : null}
              </div>
            </header>

            {/* Featured Quote */}
            {post.post_quote != null ? (
              <blockquote className="featured-post-quote">
                <p className="quote-text">
                  &ldquo;{post.post_quote.quote}&rdquo;
                </p>
                <cite className="quote-cite">
                  &mdash; {post.post_quote.author}
                </cite>
              </blockquote>
            ) : null}

            {/* Post Content */}
            <div
              className="post-content"
              dangerouslySetInnerHTML={{
                __html: post_content,
              }}
            />

            {post.last_modified && post.last_modified !== post.pub_date && (
              <p className="post-updated-time">
                <em>Updated: {post.last_modified}</em>
              </p>
            )}

            {/* Post Footer & Next Article */}
            <footer className="post-article-footer">
              <div className="post-newsletter-box">
                <span className="newsletter-box-title">
                  Receive new essays in your inbox
                </span>
                <div className="post-newsletter-form">
                  <SignupForm />
                </div>
              </div>

              {!isEmpty(post.next_post) && (
                <div className="next-post-card">
                  <span className="next-post-label">Next Essay &rarr;</span>
                  <Link href="[...id].js" as={`/${post.next_post.slug}`}>
                    <a className="next-post-title">{post.next_post.title}</a>
                  </Link>
                </div>
              )}

              <div className="post-back-home">
                <Link href="/">
                  <a className="back-home-link">&larr; Return to Homepage</a>
                </Link>
              </div>
            </footer>

            {/* Comments */}
            <div className="post-comments-wrapper" id="comments">
              {!post.allow_comments ? (
                post.is_loading ? null : (
                  <p className="comments-disabled">
                    <em>Comments are closed for this essay.</em>
                  </p>
                )
              ) : (
                <div className="comments-box">
                  <div id="fastcomments-count" className="comments-header">
                    Discussion
                  </div>
                  <div id="fastcomments-widget" />
                </div>
              )}
            </div>
          </article>
        </div>
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
async function update_views(slug) {
  if (!slug) return false;
  try {
    const url = `/api/post/${slug}`;
    await fetch(url, {
      headers: { cookie: parseCookies(null) },
    });
    return true;
  } catch (err) {
    return false;
  }
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
    if (path === "readings") {
      props.readings = (await getBookShelves()) || {};
    }
    if (path === "archives") {
      props.archives = await getPosts(["title", "slug", "topic", "excerpt"]);
    }
    if (path === "topic") {
      props.posts = await getPostsByTopic(id);
    }
    // Readings cached for 24h (86400s); other site pages for 1h (3600s)
    const pageRevalidate = path === "readings" ? 86400 : 3600;
    return extend(
      { revalidate: pageRevalidate },
      {
        props: extend(props, {
          post: {},
        }),
      }
    );
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
