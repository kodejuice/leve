import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";

import HomeHead from "../sections/HomeHead";
import SiteHeader from "../sections/SiteHeader";
import Footer from "../sections/Footer";
import { site_details as details } from "../../site_config";

const PostList = dynamic(() => import("../sections/Posts"), {
  ssr: false,
  loading: () => <p className="loading-notice">Loading writing...</p>,
});

export default function Home(props) {
  const { recent_posts, all_posts_count } = props;
  const { host, scheme } = props;

  return (
    <div className="page-wrapper">
      <Head>
        <title>
          {details.name} — Computer Science, Information Theory &amp;
          Engineering
        </title>
        <HomeHead
          host={host}
          scheme={scheme}
          ga_track_code={props.ga_track_code}
        />
      </Head>

      <div className="page-container">
        <SiteHeader details={details} current="home" />

        <main className="main-content">
          <section className="intro-hero">
            <p className="hero-lead">
              Engineer and research scientist turning first-principles discovery
              into real-world technology. Committed to disciplined execution and
              the pursuit of truth.
            </p>
            <div className="hero-quick-links">
              <Link href="/about">
                <a className="hero-pill-link">
                  <span className="pill-badge">Research</span>
                  <span>Selected Publications &rarr;</span>
                </a>
              </Link>
              <Link href="/readings">
                <a className="hero-pill-link secondary">
                  <span>Reading Shelf &rarr;</span>
                </a>
              </Link>
            </div>
          </section>

          <section className="home-writing-section">
            <PostList
              posts={recent_posts}
              all_posts_count={all_posts_count}
              title="Recent Writing"
            />
          </section>
        </main>

        <Footer current="home" />
      </div>
    </div>
  );
}
