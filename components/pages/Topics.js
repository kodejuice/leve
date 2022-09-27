import Head from "next/head";
import dynamic from "next/dynamic";

// import Readings from "../sections/Readings";
import { startCase } from "lodash";
import HomeHead from "../sections/HomeHead";
import { SideBar } from "../sections/SideBar";

import SiteHeader from "../sections/SiteHeader";

import { site_details as details } from "../../site_config";
import Footer from "../sections/Footer";

// import PostList from "../sections/Posts";
const PostList = dynamic(() => import("../sections/Posts"), {
  ssr: false,
  loading: () => <p> Loading posts... </p>,
});

// get the topic name as its stored in the post
function getTopicName(post, topicFromURL) {
  if (!post) return topicFromURL;
  const topics = post.topic;
  for (let i = 0; i < topics.length; i += 1) {
    const topic = topics[i].trim().toLowerCase();
    if (topic === topicFromURL) return topics[i].trim();
  }
  return topicFromURL;
}

function TopicsPage(props) {
  const { host, scheme, paths, posts } = props;
  const route = paths[1];

  if (!route) {
    if (typeof window !== "undefined") window.location = "/";
    return null;
  }

  return (
    <div className="container">
      <Head>
        <title>
          &quot;{startCase(route)}&quot; Posts | {details.description}
        </title>

        <HomeHead
          host={host}
          scheme={scheme}
          ga_track_code={props.ga_track_code}
        />
      </Head>

      <SideBar />

      <div className="home-main mb-5 pl-2">
        <section>
          <header>
            <SiteHeader details={details} />
          </header>

          <article>
            <div className="home-posts ml-2">
              <PostList
                show_all
                posts={posts}
                limit={false}
                title={`"${getTopicName(posts[0], route)}" Posts`}
              />
            </div>
          </article>

          <footer>
            <Footer />
          </footer>
        </section>
      </div>
    </div>
  );
}

export default TopicsPage;
