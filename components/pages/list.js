// import dynamic from "next/dynamic";
import { getBookShelves } from "../sections/Readings";
import AboutPage from "./About";
import ReadingsPage from "./Readings";
import TopicsPage from "./Topics";
import ArchivesPage from "./Archives";

// const AboutPage = dynamic(() => import("./About"), {
//   ssr: false,
//   loading: () => <p>Loading page...</p>,
// });

// const ReadingsPage = dynamic(() => import("./Readings"), {
//   ssr: false,
//   loading: () => <p>Loading page...</p>,
// });

export const Page = {
  about(props) {
    return <AboutPage {...props} />;
  },
  readings(props) {
    return <ReadingsPage {...props} />;
  },
  topic(props) {
    return <TopicsPage {...props} />;
  },
  archives(props) {
    return <ArchivesPage {...props} />;
  },
};

export const Init = {
  async readings() {
    return getBookShelves();
  },
  // async topic(category) {
  //   // get posts with this category
  //   return {};
  // },
};

// We'd use this to prevent post slugs from being named one of these
// to prevent a route clash in "/[...id].js"
export const sitePages = new Set(Object.keys(Page));
