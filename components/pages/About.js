import Head from "next/head";

import About from "../home/sections/About";
import HomeHead from "../home/sections/HomeHead";
import { SideBar } from "../home/sections/SideBar";

import SiteHeader from "../home/sections/SiteHeader";

import { site_details as details } from "../../site_config";
import Footer from "../home/sections/Footer";

function AboutPage(props) {
  const { host, scheme } = props;

  // rss feed url (for header icons)
  details.links.rss_url = `${scheme}://${host}/api/rss.xml`;

  return (
    <div className="container">
      <Head>
        <title> About | {details.name} </title>

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
              <About />
            </div>
          </article>

          <footer>
            <Footer current="about" />
          </footer>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;