/* eslint-disable no-bitwise */
/* eslint-disable react/no-danger */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-use-before-define */
import { useEffect } from "react";

import Script from "next/script";
import Link from "next/link";
import Head from "next/head";
import fetch from "node-fetch";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import { extend, isEmpty } from "lodash";
import { format } from "date-fns";
import { parseCookies, setCookie } from "nookies";
import HRNumbers from "human-readable-numbers";
import "highlight.js/styles/github.css";

import Toggle from "../components/home/Toggle";
import { Page, sitePages } from "../components/pages/list";
import { getBestMatch } from "../utils/string-similarity";
import { getPost, getPosts } from "../database/functions";
import { site_details as details } from "../site_config";
import { getBookShelves } from "../components/home/sections/Readings";

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
            maxAge: 86400 * 31 /* 31 days */,
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

  const page_url = post.is_loading ? "" : `${scheme}://${host}/${post.slug}`;
  const post_keywords = isEmpty(post.topic.join())
    ? post.excerpt
    : post.topic.join(", ");
  const page_description = post.is_loading
    ? "Post doesn't exist"
    : `${post.excerpt}, By: ${post.author}`;

  return (
    <div className="container">
      <Head>
        <title> {post.title} </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
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

        {/* styles for katex */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/markdown-it-texmath/css/texmath.min.css"
        />

        <Script
          strategy="lazyOnload"
          defer
          src="./js/benchmarkemail-signupform.js"
        />
        <Script
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
                // Disqus config
                var disqus_config = function () {
                    this.page.url = "https://${host}/${post.slug}";
                    this.page.identifier = "${details.name}:${post.slug}";
                    this.page.title = "${post.title}";
                };
                (function() { // DON'T EDIT BELOW THIS LINE
                    var d=document, s=d.createElement('script');
                    s.src="https://${props.disqus_host}/embed.js";
                    s.setAttribute('data-timestamp', +new Date());
                    (d.head||d.body).appendChild(s);
                })();
                `,
          }}
        />
      </Head>

      <div className="hide-on-desktop mt-4">
        <Link href="/">
          <div title="Go Home">
            <a className="btn btn-link">
              <span className="glyphicon glyphicon-chevron-left" /> Back
            </a>
          </div>
        </Link>
      </div>

      <div className="position-fixed action-btn">
        <div className="toggler">
          <Toggle onSwitch={() => reloadDisqusThread()} />
        </div>

        <div className="hide-on-mobile">
          <p style={{ position: "fixed", top: 0, left: 2, fontFamily: "Fira" }}>
            <small style={{ fontSize: "14px" }}>{details.name}</small>
          </p>
          <Link href="/">
            <div title="Go Home">
              <a className="btn btn-link">
                <span className="glyphicon glyphicon-chevron-left" />
              </a>
            </div>
          </Link>
          {parseCookies(null).__token ? (
            <div className="mt-4">
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
                    <em title="" className="mt-1">
                      {HRNumbers.toHumanString(post.views | 0)} views
                    </em>
                  </small>
                )) ||
                  ""}
              </div>

              <div>
                {(post.draft && (
                  <>
                    -
                    <small>
                      <em title="This post isnt published yet" className="mt-1">
                        {" "}
                        {post.draft ? "draft" : ""}
                      </em>
                    </small>
                  </>
                )) ||
                  ""}
              </div>
            </div>
          ) : (
            ""
          )}
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
              <em className="pub_date"> {post.pub_date} </em>

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
                  __html: post.html_content,
                }}
              />
              <p className="pt-1 text-right updated-time">
                {" "}
                {post.last_modified !== post.pub_date &&
                  `Updated ${post.last_modified}`}{" "}
              </p>
            </article>

            <footer>
              <div className="row mb-5 _post_footer">
                {/* subsribe to newsletter */}
                <div className="col">
                  <legend id="subscribe" className="visible-text">
                    Get an email whenever theres a new article
                  </legend>
                  <div className="form-row">
                    <div
                      className="col"
                      dangerouslySetInnerHTML={{
                        __html: `
                          <div id="signupFormContainer_YPLMC">
                          <div id="signupFormContent_YPLMC">
                          <div class="formbox-editor_YPLMC"><div id="formbox_screen_subscribe_YPLMC" style="display:block;" name="frmLB_YPLMC">
                          <input type=hidden name=token_YPLMC id=token_YPLMC value="mFcQnoBFKMREm%2FBVsa6KJrJ25jqXIyRIGAsuYxzAV7Knxdbvm8OfpQ%3D%3D" />
                          <input type=hidden name=successurl_YPLMC id=successurl_YPLMC value="https://lb.benchmarkemail.com/Code/ThankYouOptin" />
                          <input type=hidden name=errorurl_YPLMC id=errorurl_YPLMC value="http://lb.benchmarkemail.com//Code/Error" />
                          <input type=text placeholder="Email Address" class="formbox-field_YPLMC text-placeholder" onfocus="javascript:focusPlaceHolder(this);" onblur="javascript:blurPlaceHolder(this);" id="fldemail_YPLMC" name="fldemail_YPLMC" maxlength=100 />
                          <button id="btnSubmit_YPLMC" onClick="javascript:return submit_YPLMCClick();" class="formbox-button_YPLMC btn-link btn submit visible-text">subscribe</button>
                          </div>
                          </div>
                          </div>
                          </div>
                        `,
                      }}
                    />
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
            </footer>

            {/*<!-- DISQUS HERE -->*/}
            <div className="comments" id="comments">
              {!post.allow_comments ? (
                post.is_loading ? (
                  ""
                ) : (
                  <b>
                    <em> Comments Disabled </em>
                  </b>
                )
              ) : (
                <div id="disqus_thread" />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// reload disqus thread
function reloadDisqusThread() {
  // DISQUS is a global variable,
  // which comes with the embedded disqus embed.js script
  try {
    // eslint-disable-next-line no-undef
    DISQUS.reset({
      reload: true,
    });
  } catch (e) {
    // ...
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
    html_content: "<img src='icons/spinner.svg' alt='Loading...'>",
    title: "Post not found",
    post_image: `https://tinyurl.com/y3x3hrzk`,
    author: details.name,
    author_email: details.email,
    pub_date: null,
    last_modified: null,
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
  const data = (await getPosts(["slug"])) || [];
  const site_pages = Array.from(sitePages).map((p) => ({ slug: p }));
  const all = data.concat(site_pages);

  return {
    paths: all.map((post) => ({
      params: { id: [post.slug] },
    })),

    fallback: true,
  };
}

// fetch Post information from database
export async function getStaticProps(ctx) {
  const post_id = ctx.params.id.join("/"); // `/{slug}`
  const [host, scheme] = [process.env.HOST, process.env.SCHEME];

  const props = {
    host,
    scheme,
    id: post_id,
    // id: ctx.params.id,
    ga_track_code: process.env.GA_TRACK_CODE,
    disqus_host: process.env.DISQUS_HOST,
  };

  if (sitePages.has(post_id)) {
    if (post_id === "readings") {
      props.readings = await getBookShelves();
    }
    return {
      props: extend(props, {
        post: {},
      }),
      revalidate: 1,
    };
  }

  // fetch post from DB

  const data = await getPost(post_id);
  if (data.error) {
    // no post with slug '${post_id}'
    return {
      props: extend(props, {
        corrections: await getBestMatch(post_id),
      }),
      revalidate: 1,
    };
  }

  // format date in post
  const { pub_date, last_modified } = data;
  data.pub_date =
    (data.pub_date && format(new Date(pub_date), "MMMM dd, yyyy")) || null;
  data.last_modified =
    (data.last_modified && format(new Date(last_modified), "MMMM dd, yyyy")) ||
    null;
  // ...

  return {
    props: extend(props, {
      post: data,
    }),
    revalidate: 1,
  };
}

export default PostView;
