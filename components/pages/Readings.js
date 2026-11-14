import Head from "next/head";
import HomeHead from "../sections/HomeHead";
import SiteHeader from "../sections/SiteHeader";
import Footer from "../sections/Footer";
import Readings from "../sections/Readings";
import { site_details as details } from "../../site_config";

export default function ReadingsPage(props) {
  const { host, scheme } = props;

  return (
    <div className="page-wrapper">
      <Head>
        <title>Reading Shelf | {details.name}</title>
        <HomeHead
          host={host}
          scheme={scheme}
          ga_track_code={props.ga_track_code}
        />
      </Head>

      <div className="page-container">
        <SiteHeader details={details} current="readings" />

        <main className="main-content">
          <Readings {...props} />
        </main>

        <Footer current="readings" />
      </div>
    </div>
  );
}
