import Head from "next/head";
import dynamic from "next/dynamic";

import HomeHead from "../sections/HomeHead";
import { SideBar } from "../sections/SideBar";
import SiteHeader from "../sections/SiteHeader";
import Footer from "../sections/Footer";
import { site_details as details } from "../../site_config";

// import PostList from "../sections/Posts";
const PostList = dynamic(() => import("../sections/Posts"), {
  ssr: false,
  loading: () => <p> Loading posts... </p>,
});

function Home(props) {
  const { all_posts, recent_posts } = props;
  const { host, scheme } = props;

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

export default Home;
