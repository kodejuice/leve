import Head from "next/head";

import Readings from "../home/sections/Readings";
import HomeHead from "../home/sections/HomeHead";
import { SideBar } from "../home/sections/SideBar";

import SiteHeader from "../home/sections/SiteHeader";

import { site_details as details } from "../../site_config";
import Footer from "../home/sections/Footer";

function ReadingsPage(props) {
  const { host, scheme } = props;

  return (
    <div className="container">
      <Head>
        <title> Readings | {details.name} </title>

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
              <div>
                <Readings {...props} />
              </div>
            </div>
          </article>

          <footer>
            <Footer current="readings" />
          </footer>
        </section>
      </div>
    </div>
  );
}

export default ReadingsPage;
