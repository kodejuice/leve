import Head from "next/head";
import dynamic from "next/dynamic";
import { startCase } from "lodash";
import HomeHead from "../sections/HomeHead";
import SiteHeader from "../sections/SiteHeader";
import Footer from "../sections/Footer";
import { site_details as details } from "../../site_config";

const PostList = dynamic(() => import("../sections/Posts"), {
  ssr: false,
  loading: () => <p className="loading-notice">Loading writing...</p>,
});

function getTopicName(post, topicFromURL) {
  if (!post) return topicFromURL;
  const topics = post.topic || [];
  for (let i = 0; i < topics.length; i += 1) {
    const topic = topics[i].trim().toLowerCase();
    if (topic === topicFromURL) return topics[i].trim();
  }
  return topicFromURL;
}

export default function TopicsPage(props) {
  const { host, scheme, paths, posts = [] } = props;
  const route = paths?.[1];

  if (!route) {
    if (typeof window !== "undefined") window.location = "/";
    return null;
  }

  const topicName = getTopicName(posts[0], route);

  return (
    <div className="page-wrapper">
      <Head>
        <title>
          &ldquo;{startCase(route)}&rdquo; Essays | {details.name}
        </title>
        <HomeHead
          host={host}
          scheme={scheme}
          ga_track_code={props.ga_track_code}
        />
      </Head>

      <div className="page-container">
        <SiteHeader details={details} current="topic" />

        <main className="main-content">
          <div className="topic-header-bar mb-4">
            <span className="topic-pretitle">Topic Collection</span>
            <h1 className="topic-title">{topicName}</h1>
          </div>

          <PostList
            show_all
            posts={posts}
            title={`${posts.length} ${
              posts.length === 1 ? "Essay" : "Essays"
            } on ${topicName}`}
          />
        </main>

        <Footer current="archives" />
      </div>
    </div>
  );
}
