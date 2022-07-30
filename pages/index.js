import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { parseCookies } from "nookies";

import Posts from "../components/home/sections/Posts";
import About from "../components/home/sections/About";
import Projects from "../components/home/sections/Projects";

import Header from "../components/home/Header";
import Toggle from "../components/home/Toggle";

import { getPosts } from "../database/functions";
import { scrollToTop } from "../utils";

import { site_details as details } from "../site_config";

const tabs = {
  "?posts": 0,
  "?about": 1,
  "?projects": 2,
};

function Home(props) {
  const { posts } = props;
  const { host, scheme } = props;

  const [section_index, setSectionIndex] = useState(0);
  const sections = useRef([<Posts posts={posts} />, <About />, <Projects />]);

  const switchTab = (ev, num) => {
    if (ev) ev.preventDefault();
    scrollToTop(() => setSectionIndex(num), 50, 40);
  };

  useEffect(() => {
    switchTab(null, tabs[location.search] || 0);
  }, []);

  // rss feed url (for header icons)
  details.links.rss_url = `${props.scheme}://${props.host}/api/rss.xml`;

  const page_url = `${scheme}://${host}/`;
  return (
    <div className="container">
      <Head>
        <title> {details.name} </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content={details.description} />

        {/*<!-- Facebook Meta Tags -->*/}
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${scheme}://${host}/sb.png`} />
        <meta property="og:title" content={details.name} />
        <meta property="og:url" content={page_url} />
        <meta property="og:description" content={details.description} />
        <meta property="og:site_name" content="Sochima Biereagu" />

        {/*<!-- Twitter Meta Tags -->*/}
        <meta name="twitter:creator" content="@kodejuice" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content={host} />
        <meta property="twitter:url" content={page_url} />

        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${props.ga_track_code}`}
        />
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${props.ga_track_code}');
                `,
          }}
        />
      </Head>

      <div className="position-fixed action-btn">
        <div className="toggler">
          <Toggle />
        </div>

        {parseCookies(null).__token && (
          <div className="mt-4 hide-on-mobile">
            <div title="Dashboard">
              <Link href="admin/list">
                <a className="btn btn-link">
                  <span className="glyphicon glyphicon-dashboard" />
                </a>
              </Link>
            </div>

            <div title="Add new post">
              <Link href="admin/edit">
                <a className="btn btn-link">
                  {" "}
                  <span className="glyphicon glyphicon-plus" />{" "}
                </a>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="home-main mb-5">
        <section>
          <header>
            <Header details={details} />
          </header>

          <article>
            <div className="home-posts ml-2">
              {sections.current[section_index]}
            </div>
          </article>

          <footer>
            <div className="f-nav mt-5">
              {section_index !== 0 && (
                <div className="f-link about br pr-2">
                  <a href="?posts" onClick={(_) => switchTab(_, 0)}>
                    {" "}
                    Posts{" "}
                  </a>
                </div>
              )}
              {section_index !== 1 && (
                <div
                  className={`f-link about ${
                    section_index !== 2 && "br"
                  } pl-2 pr-2`}
                >
                  <a
                    href="?about"
                    title="About Me"
                    onClick={(_) => switchTab(_, 1)}
                  >
                    {" "}
                    About{" "}
                  </a>
                </div>
              )}
              {section_index !== 2 && (
                <div
                  className="f-link projects pl-2"
                  id={section_index === 2 ? "inactive" : ""}
                >
                  <a
                    href="?projects"
                    title="My Software Projects"
                    onClick={(_) => switchTab(_, 2)}
                  >
                    {" "}
                    Software Projects{" "}
                  </a>
                </div>
              )}
            </div>

            <div
              className="mt-4 pl-0 ml-0"
              title="Get an email whenever theres new content"
            >
              <a href="https://lb.benchmarkemail.com//listbuilder/signupnew?UOpPXfYpHY5FgmNYouPUxP5pwVnAjsSIHDOR9QrPhDftO5iNRn8gS049TyW7spdJ">
                {" "}
                <b> Subscribe to newsletter ! </b>{" "}
              </a>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  // Fetch data from database
  const data = await getPosts(["title", "excerpt", "slug", "pub_date"]);

  // Pass data to the page via props
  return {
    props: {
      posts: data,
      host: process.env.HOST,
      scheme: process.env.SCHEME,
      ga_track_code: process.env.GA_TRACK_CODE,
    },

    revalidate: 1,
  };
}

export default Home;
