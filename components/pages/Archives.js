import Head from "next/head";
import Link from "next/link";

import HomeHead from "../sections/HomeHead";
import SiteHeader from "../sections/SiteHeader";
import Footer from "../sections/Footer";
import RSSIcon from "../RSSIcon";
import { site_details as details } from "../../site_config";

function MostPopular({ posts }) {
  if (!posts?.length) return null;

  return (
    <section className="archives-sub-section">
      <div className="sub-section-header">
        <h3 className="sub-section-title">Most Read Essays</h3>
        <span className="sub-section-note">Ranked by readership</span>
      </div>
      <ol className="popular-posts-list">
        {posts.map((p) => (
          <li key={p._id} className="popular-post-item">
            <Link href={`/${p.slug}`}>
              <a className="popular-post-link">{p.title}</a>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PostsByTopic({ posts }) {
  const count = {};
  const topics = new Set();

  posts.forEach((post) => {
    post.topic?.forEach((t) => {
      const topic = t.trim();
      if (topic?.length) {
        count[topic] = (count[topic] || 0) + 1;
        topics.add(topic);
      }
    });
  });

  const topicList = Array.from(topics).sort();

  return (
    <section className="archives-sub-section mt-5">
      <div className="sub-section-header">
        <h3 className="sub-section-title">Themes &amp; Topics</h3>
        <span className="sub-section-note">Index of categories</span>
      </div>
      <div className="topics-pills-cloud">
        {topicList.map((topic) => (
          <div key={topic} className="topic-pill-item">
            <Link href={`/topic/${topic.toLowerCase()}`}>
              <a className="topic-pill">
                <span className="topic-name">{topic}</span>
                <span className="topic-count">{count[topic]}</span>
              </a>
            </Link>
            <a
              href={`/api/rss/${topic.toLowerCase()}`}
              className="topic-rss-link"
              title={`RSS feed for ${topic}`}
              aria-label={`RSS feed for ${topic}`}
            >
              <RSSIcon />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Archives(props) {
  const { archives = [] } = props;
  const { host, scheme } = props;

  return (
    <div className="page-wrapper">
      <Head>
        <title>Archives &amp; Themes | {details.name}</title>
        <HomeHead
          host={host}
          scheme={scheme}
          ga_track_code={props.ga_track_code}
        />
      </Head>

      <div className="page-container">
        <SiteHeader details={details} current="archives" />

        <main className="main-content">
          <div className="archives-showcase">
            <div className="archives-intro">
              <h1 className="archives-title">Archives &amp; Subject Index</h1>
              <p className="archives-desc">
                An index of all published essays, notes, and discourses
                organized by readership and subject matter.
              </p>
            </div>

            <MostPopular posts={archives.slice(0, 10)} />
            <PostsByTopic posts={archives} />
          </div>
        </main>

        <Footer current="archives" />
      </div>
    </div>
  );
}
