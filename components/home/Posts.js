import {useState} from 'react'
import Link from 'next/link'

import Pagination from "react-js-pagination"

import {scrollToTop} from '../../utils';
import { site_details as details } from '../../site_config.js';


// single post component
const Post = (props) => {
    const {title, excerpt, slug} = props.info;

    return (
        <div className='mt-3'>
            <Link href="/[...id]" as={`/${slug}`}>
                <a className='post-title'> {title} </a>
            </Link>
            <div className='post-excerpt ml-3'> {excerpt} </div>
        </div>
    );
}


// list posts
const Posts = (props) => {
    const [activePage, setActivePage] = useState(1);    // pagination state
    const [display_all, setDisplay] = useState(false);  // post list state

    let post_block,
        {post_per_page} = details.site;

    if (display_all) { // display all
        let {all_posts} = props;

        // pagination data
        let start = (activePage-1) * post_per_page,
            length = start + post_per_page,
            posts_len = all_posts.length;

        // console.log([start, length, posts_len, `showing=${all_posts.slice(start, length).length}`]);

        post_block = (
            <div>
                <h2 className='section-title'> All Posts </h2>
                <div> {all_posts.slice(start, length).map(p => <Post info={p} key={p._id} />)} </div>

                <div className='mt-4'>
                    {posts_len > post_per_page && (
                        <Pagination
                            activePage={activePage}
                            pageRangeDisplayed={4}

                            itemsCountPerPage={post_per_page}
                            totalItemsCount={posts_len}

                            onChange={p => scrollToTop(_=>setActivePage(p), 50, 40)}

                            itemClass="page-item"
                            linkClass="page-link"

                            hideDisabled={true}
                        />
                    ) || ""}
                </div>

                <a onClick={_=>scrollToTop(_=>setDisplay(false))} className="link-btn btn btn-link"> Recent posts </a>
            </div>
        );
    }
    else { // display most recent
        const {recent_posts} = props;

        post_block = (
            <div>
                <h2 className='section-title'> Most Recent </h2>

                {/* no posts yet ? */}
                {recent_posts.length == 0 ? <div className='mt-3 ml-2'> Nothing to show here</div> : ""}

                {/* map posts to the Post component */}
                { recent_posts.map(p => <Post info={p} key={p._id} />) }

                { props.all_posts.length > post_per_page
                    ? <a onClick={_=>scrollToTop(_=>setDisplay(true))} className="link-btn btn btn-link"> All posts </a> :
                 "" }
            </div>
        );
    }

    return (
        <>
            {post_block}
        </>
    );
}

export default Posts;
