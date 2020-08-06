import Link from 'next/link'
import Head from 'next/head'
import fetch from 'node-fetch'
import {useEffect} from 'react'
import { parseCookies, setCookie } from 'nookies'

import Posts from '../components/home/Posts';
import Header from '../components/home/Header';
import Toggle from '../components/home/Toggle';

import {getPosts} from '../utils/fetch-post';

import { site_details as details } from '../site_config.js';


function Home(props) {
    useEffect(_=>{
        if (parseCookies(null).__dark == "1")
            document.querySelector("body").classList.add('dark');
    });

    let {posts} = props;

    // get recent posts from data,
    // sorts them in descending order of their publication date, and gets the first few ${post_per_page}
    let post_per_page = details.site.post_per_page;
    let recent_posts = posts.slice().sort((x,y) => new Date(y.pub_date) - new Date(x.pub_date)).slice(0,post_per_page)

    return (
        <>
            <Head>
                <title> {details.name} </title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <meta name="description" content={details.description}/>
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA_TRACK_CODE}`}/>
                <script dangerouslySetInnerHTML={{__html:`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.GA_TRACK_CODE}');
                `}} />
            </Head>

            <div className='container'>
                <div className='position-fixed action-btn'>
                    <div className='toggler'>
                        <Toggle />
                    </div>

                    {
                        parseCookies(null).__token ?
                        (
                            <div className="mt-4 hide-on-mobile">
                                <div title="Dashboard">
                                    <Link href={"admin/list"}>
                                        <a className="btn btn-link"><span className='glyphicon glyphicon-dashboard'></span></a>
                                    </Link>
                                </div>

                                <div title="Add new post">
                                    <Link href="admin/edit">
                                        <a className="btn btn-link"> <span className='glyphicon glyphicon-plus'></span> </a>
                                    </Link>
                                </div>
                            </div>
                        )
                        : ""
                    }
                </div>

                <div className='home-main mb-5'>
                    <section>
                        <header>
                            <Header details={details} />
                        </header>

                        <article>
                            <Posts recent_posts={recent_posts} all_posts={posts} />
                        </article>

                        <footer>
                            <div className='mt-5 pl-0 ml-0' title='Get an email whenever theres new content'>
                                <a href="https://lb.benchmarkemail.com//listbuilder/signupnew?UOpPXfYpHY5FgmNYouPUxP5pwVnAjsSIHDOR9QrPhDftO5iNRn8gS049TyW7spdJ"> <em> Subscribe to newsletter ! </em> </a>
                            </div>
                        </footer>
                    </section>
                </div>
            </div>
        </>
    );
}




export async function getStaticProps(ctx) {
    const mongo_uri = process.env.MONGODB_URI;

    // Fetch data from database
    const data = await getPosts(['title', 'excerpt', 'slug', 'pub_date'], mongo_uri);

    // Pass data to the page via props
    return {
        props: {
            posts: data
        },

        // we will attempt to re-generate the page:
        // - at most once every 24 hours
        revalidate: 86400 //seconds
    };
}


export default Home;
