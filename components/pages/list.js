import dynamic from "next/dynamic";
// import AboutPage from "./About";
// import ReadingsPage from "./Readings";

const AboutPage = dynamic(() => import("./About"), {
  ssr: false,
  loading: () => <p>Loading page...</p>,
});

const ReadingsPage = dynamic(() => import("./Readings"), {
  ssr: false,
  loading: () => <p>Loading page...</p>,
});

export const Page = {
  about(props) {
    return <AboutPage {...props} />;
  },
  readings(props) {
    return <ReadingsPage {...props} />;
  },
};

// We'd use this to prevent post slugs from being named one of these
// to prevent a route clash in "/[...id].js"
export const sitePages = new Set(Object.keys(Page));
