import AboutPage from "./About";
import ReadingsPage from "./Readings";

export const Page = {
  about(props) {
    return <AboutPage {...props} />;
  },
  readings(props) {
    return <ReadingsPage {...props} />;
  },
};

// We'd use still to prevent post slugs from being named one of these
// to prevent a route clash in "/[...id].js"
export const sitePages = new Set(Object.keys(Page));
