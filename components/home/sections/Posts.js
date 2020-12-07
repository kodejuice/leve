import PostList from '../Posts';
import { site_details as details } from '../../../site_config.js';

export default function Posts(props) {
    const {posts} = props;

    // get recent posts from data,
    // sorts them in descending order of their publication date, and gets the first few ${post_per_page}
    let post_per_page = details.site.post_per_page;
    let recent_posts = posts.slice().sort((x,y) => new Date(y.pub_date) - new Date(x.pub_date)).slice(0,post_per_page)

    return <PostList recent_posts={recent_posts} all_posts={posts} />;
}
