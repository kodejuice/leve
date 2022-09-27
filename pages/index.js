import Home from "../components/pages/Home";
import { getPosts } from "../database/functions";
import { site_details as details } from "../site_config";

const { post_per_page } = details.site;

function App(props) {
  return <Home {...props} />;
}

export async function getStaticProps() {
  // Fetch data from database
  const data = await getPosts([
    "title",
    "excerpt",
    "slug",
    "pub_date",
    "last_modified",
  ]);

  // get recent posts from data,
  // sorts them in descending order of their publication date, and gets the first few ${post_per_page}
  const recent_posts = data
    .slice()
    .sort((x, y) => new Date(y.pub_date) - new Date(x.pub_date))
    .slice(0, post_per_page);

  // Pass data to the page via props
  return {
    props: {
      recent_posts,
      all_posts_count: data.length,
      host: process.env.HOST,
      scheme: process.env.SCHEME,
      ga_track_code: process.env.GA_TRACK_CODE,
    },

    revalidate: 1,
  };
}

export default App;
