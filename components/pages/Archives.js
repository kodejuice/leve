import Head from "next/head";
import Link from "next/link";

import HomeHead from "../sections/HomeHead";
import { SideBar } from "../sections/SideBar";
import SiteHeader from "../sections/SiteHeader";
import Footer from "../sections/Footer";
import RSSIcon from "../RSSIcon";
import { site_details as details } from "../../site_config";

function MostPopular({ posts }) {
  return (
    <div className="mt-4">
      <h4> Most Popular </h4>
      <small className="em">Based on page views</small>
      <ol>
        {posts.map((p) => (
          <li key={p._id}>
            <Link href={`/${p.slug}`}>
              <a title={p.excerpt}>{p.title}</a>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PostsByTopic({ posts }) {
  const count = {};
  const topics = new Set();

  // get all topics
  posts.forEach((post) => {
    post.topic.forEach((t) => {
      const topic = t.trim();
      if (topic?.length) {
        count[topic] = (count[topic] || 0) + 1;
        topics.add(topic);
      }
    });
  });

  return (
    <div className="mt-4">
      <h4>By Topic</h4>
      <ul>
        {[...topics].map((topic) => (
          <li key={topic}>
            <Link href={`/topic/${topic.toLowerCase()}`}>
              <a>
                {topic} ({count[topic]})
              </a>
            </Link>
            <a
              href={`/api/rss/${topic.toLowerCase()}`}
              className="d-inline-block ml-2"
            >
              <RSSIcon />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Archives(props) {
  const { archives } = props;
  const { host, scheme } = props;

  return (
    <div className="container">
      <Head>
        <title> Archives | {details.description} </title>

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
              <h1 className="section-title"> Archives </h1>

              <MostPopular posts={archives.slice(0, 10)} />
              <PostsByTopic posts={archives} />
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

export default Archives;
