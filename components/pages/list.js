import AboutPage from "./About";
import ReadingsPage from "./Readings";
import TopicsPage from "./Topics";
import ArchivesPage from "./Archives";

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

// We'd use this to prevent post slugs from being named one of these
// to prevent a route clash in "/[...id].js"
export const sitePages = new Set(Object.keys(Page));
