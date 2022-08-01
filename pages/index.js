import Head from "next/head";

import HomeHead from "../components/home/sections/HomeHead";
import { SideBar } from "../components/home/sections/SideBar";
import Posts from "../components/home/sections/Posts";

import SiteHeader from "../components/home/sections/SiteHeader";

import { getPosts } from "../database/functions";

import { site_details as details } from "../site_config";
import Footer from "../components/home/sections/Footer";

function Home(props) {
  const { posts } = props;
  const { host, scheme } = props;

  // rss feed url (for header icons)
  details.links.rss_url = `${scheme}://${host}/api/rss.xml`;

  return (
    <div className="container">
      <Head>
        <title> {details.name} </title>

        <HomeHead
          host={host}
          scheme={scheme}
          ga_track_code={props.ga_track_code}
        />
      </Head>

      <SideBar home />

      <div className="home-main mb-5">
        <section>
          <header>
            <SiteHeader details={details} />
          </header>

          <article>
            <div className="home-posts ml-2">
              <Posts posts={posts} />
            </div>
          </article>

          <footer>
            <Footer current="home" />
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
