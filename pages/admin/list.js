import {useEffect} from 'react'

import Link from 'next/link'
import Head from 'next/head'
import fetch from 'node-fetch'
import { parseCookies } from 'nookies'

import {format} from 'date-fns'

import Posts from '../../components/admin/Posts'
import Header from '../../components/admin/Header'
import { site_details as details } from '../../site_config.js';

import verifyAuth from '../../utils/auth.js';


function List(props) {
    useEffect(_=>{
        window.onbeforeunload = ()=>null;
        if (parseCookies(null).__dark == "1")
            document.querySelector("body").classList.add('dark');
    });

    return (
        <>
            <Head>
                <title> Posts &lsaquo; {details.description} - Admin </title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <meta name="robots" content="noindex"/>
                <script id="dsq-count-scr" src={`//${process.env.DISQUS_HOST}/count.js`} async></script>
            </Head>

            <div className='admin'>
                <Header is_dark={props.is_dark} host={props.host} quick_draft={true} page='list'>
                    <div className='row' style={{width: '250px'}}>
                        <div className='col-6'> <h2> Posts </h2> </div>
                        <div className='col-6'>
                            <h2>
                                <Link href="edit">
                                    <a className="btn btn-sm btn-outline-secondary">Add New</a>
                                </Link>
                            </h2>
                        </div>
                    </div>

                    <div className='posts'>
                        <Posts host={props.host} posts={props.posts} show_draft_on_load={props.show_draft_on_load} />
                    </div>
                </Header>
            </div>
        </>
    );
}




export async function getServerSideProps(ctx) {
    await verifyAuth(ctx);

    const baseUrl = `${process.env.SCHEME}://${ctx.req.headers.host}`;

    const pub_res = await fetch(`${baseUrl}/api/post/list?fields=title slug excerpt pub_date topic`, {
        headers: {cookie: ctx.req.headers.cookie}
    });
    const draft_res= await fetch(`${baseUrl}/api/post/list?fields=title slug excerpt creation_date topic draft_revisions&draft=true`, {
        headers: {cookie: ctx.req.headers.cookie}
    });

    // format date in posts
    const published = (await pub_res.json()).map(post => {
        post.pub_date = (post.pub_date && format(new Date(post.pub_date), "MMMM dd, yyyy")) || null;
        return post;
    });
    const drafts = (await draft_res.json())
        .sort((x,y) => new Date(y.creation_date) - new Date(x.creation_date)) // sort in desceding order of creation
        .map(post => {
            post.creation_date = (post.creation_date && format(new Date(post.creation_date), "MMMM dd, yyyy")) || null;
            return post;
        });
    // ...

    const posts = {
        drafts,
        published
    };

    return {
        props: {
            posts,
            host: ctx.req.headers.host,
            is_dark: parseCookies({req:ctx.req}).__dark=='1',
            show_draft_on_load: ctx.req.url.includes('draft=1')
        }
    };
}

export default List;
