import Head from "next/head";
import HomeHead from "../sections/HomeHead";
import SiteHeader from "../sections/SiteHeader";
import Footer from "../sections/Footer";
import About from "../sections/About";
import { site_details as details } from "../../site_config";

export default function AboutPage(props) {
  const { host, scheme } = props;

  return (
    <div className="page-wrapper">
      <Head>
        <title>About &amp; Research | {details.name}</title>
        <HomeHead
          host={host}
          scheme={scheme}
          ga_track_code={props.ga_track_code}
        />
      </Head>

      <div className="page-container">
        <SiteHeader details={details} current="about" />

        <main className="main-content">
          <About />
        </main>

        <Footer current="about" />
      </div>
    </div>
  );
}
