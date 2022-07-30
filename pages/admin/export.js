import { useEffect } from "react";

import Head from "next/head";
import fetch from "node-fetch";
import { parseCookies } from "nookies";

import Header from "../../components/admin/Header";
import { site_details as details } from "../../site_config";

import verifyAuth from "../../utils/auth";

function Export(props) {
  const { host } = props;
  useEffect(() => {
    if (parseCookies(null).__dark === "1")
      document.querySelector("body").classList.add("dark");
  });

  return (
    <>
      <Head>
        <title> Export Data &lsaquo; {details.description} - Admin </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="robots" content="noindex" />
      </Head>

      <div className="admin">
        <Header
          url={props.url}
          is_dark={props.is_dark}
          host={host}
          quick_draft
          page="export"
        >
          <div className="mt-4">
            <a
              href={`${props.scheme}://${host}/api/post/import_export?type=export`}
            >
              {" "}
              Download site data ({props.total_size}){" "}
            </a>
          </div>
        </Header>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  await verifyAuth(ctx);

  const baseUrl = `${process.env.SCHEME}://${ctx.req.headers.host}`;

  const res = await fetch(
    `${baseUrl}/api/post/import_export?size_only=true&type=export`,
    {
      headers: { cookie: ctx.req.headers.cookie },
    }
  );
  const json = await res.json();

  return {
    props: {
      host: ctx.req.headers.host,
      scheme: process.env.SCHEME,
      url: `${process.env.SCHEME}://${ctx.req.headers.host}`,
      total_size: json.size || null,
      is_dark: parseCookies({ req: ctx.req }).__dark === "1",
    },
  };
}

export default Export;
