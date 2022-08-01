import Head from "next/head";

import HomeHead from "../components/home/sections/HomeHead";
import { SideBar } from "../components/home/sections/SideBar";
import PostList from "../components/home/Posts";

import SiteHeader from "../components/home/sections/SiteHeader";

import { getPosts } from "../database/functions";

import { site_details as details } from "../site_config";
import Footer from "../components/home/sections/Footer";

const { post_per_page } = details.site;

function Home(props) {
  const { all_posts, recent_posts } = props;
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

      <div className="home-main mb-5 pl-2">
        <section>
          <header>
            <SiteHeader details={details} />
          </header>

          <article>
            <div className="home-posts ml-2">
              <PostList recent_posts={recent_posts} all_posts={all_posts} />
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

  // get recent posts from data,
  // sorts them in descending order of their publication date, and gets the first few ${post_per_page}
  const recent_posts = data
    .slice()
    .sort((x, y) => new Date(y.pub_date) - new Date(x.pub_date))
    .slice(0, post_per_page);

  // Pass data to the page via props
  return {
    props: {
      all_posts: data,
      recent_posts,
      host: process.env.HOST,
      scheme: process.env.SCHEME,
      ga_track_code: process.env.GA_TRACK_CODE,
    },

    revalidate: 1,
  };
}

export default Home;
