/* eslint-disable no-param-reassign */
import Link from "next/link";
import Head from "next/head";
import { parseCookies } from "nookies";

import { format } from "date-fns";

import Posts from "../../components/admin/Posts";
import HeaderWrapper from "../../components/admin/Header";
import { site_details as details } from "../../site_config";

import { getPosts } from "../../database/functions";

import verifyAuth from "../../utils/auth";

function List(props) {
  return (
    <>
      <Head>
        <title> Posts &lsaquo; {details.description} - Admin </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="robots" content="noindex" />
      </Head>

      <div className="admin">
        <HeaderWrapper
          url={props.url}
          is_dark={props.is_dark}
          host={props.host}
          page="list"
          quick_draft
        >
          <div className="row" style={{ width: "250px" }}>
            <div className="col-6">
              {" "}
              <h2> Posts </h2>{" "}
            </div>
            <div className="col-6">
              <h2>
                <Link href="edit">
                  <a className="no-bg-color btn btn-sm btn-outline-secondary">
                    Add New
                  </a>
                </Link>
              </h2>
            </div>
          </div>

          <div className="posts">
            <Posts
              url={props.url}
              host={props.host}
              posts={props.posts}
              show_draft_on_load={props.show_draft_on_load}
            />
          </div>
        </HeaderWrapper>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  await verifyAuth(ctx);

  const fields = ["title", "slug", "excerpt", "pub_date", "topic"];
  const published = (await getPosts(fields)).map((post) => {
    post.pub_date =
      (post.pub_date && format(new Date(post.pub_date), "MMMM dd, yyyy")) ||
      null;
    return post;
  });

  const draft_fields = [
    "title",
    "slug",
    "excerpt",
    "pub_date",
    "topic",
    "draft_revisions",
  ];
  const drafts = (await getPosts(draft_fields, true))
    .sort((x, y) => new Date(y.creation_date) - new Date(x.creation_date)) // sort in desceding order of creation
    .map((post) => {
      post.creation_date =
        (post.creation_date &&
          format(new Date(post.creation_date), "MMMM dd, yyyy")) ||
        null;
      return post;
    });
  // ...

  const posts = {
    drafts,
    published,
  };

  return {
    props: {
      posts,
      url: `${process.env.SCHEME}://${ctx.req.headers.host}`,
      host: ctx.req.headers.host,
      is_dark: parseCookies({ req: ctx.req }).__dark === "1",
      show_draft_on_load: ctx.req.url.includes("draft=1"),
    },
  };
}

export default List;
