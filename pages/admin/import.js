import {useEffect} from 'react'

import Link from 'next/link'
import Head from 'next/head'
import fetch from 'node-fetch'
import { parseCookies } from 'nookies'

import Header from '../../components/admin/Header';

import { site_details as details } from '../../site_config.js';
import verifyAuth from '../../utils/auth.js';


function Import(props) {
    let {host, scheme} = props;

    useEffect(_=>{
        if (parseCookies(null).__dark == "1")
            document.querySelector("body").classList.add('dark');
        window.onbeforeunload = ()=>null;
    });

    return (
        <>
            <Head>
                <title> Import Data &lsaquo; {details.description} - Admin </title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <meta name="robots" content="noindex"/>
            </Head>

            <div className='admin'>
                <Header url={props.url} is_dark={props.is_dark} host={host} quick_draft={true} page='import'>
                    <p> This allows you to import exteral blog posts </p>
                    <p> Data beign imported should match the following schema, props marked with the asterik (*) are required </p>

                    <pre><code>{`
[{
    *author: String,
    *author_email: String,

    *title: String,
    *slug: String,
    *excerpt: String,
    post_quote: {author: String, quote: String},

    *pub_date: Date,
    creation_date: Date,
    last_modified: Date,

    *content: String,
    topic: [String],

    views: {type: Number, default: 0},
    draft: {type: Boolean, default: true},  
    draft_revisions: {type: Number, default: 0},

    allow_comments: Boolean
}, ...]
                    `}</code></pre>
                    <hr/>

                    <div className="input-group mt-3 mb-5">
                        <form method="post" encType="multipart/form-data" className="mt-4 mb-5 wp-upload-form" action={`${scheme}://${host}/api/post/import_export?type=import`}>
                            <label className="screen-reader-text file-label" htmlFor="site_data">Upload site data</label>
                            <input type="file" name="data" required={true}/>
                            <input type="submit" name="site-data" className="btn btn-outline-secondary" value="Upload"  />
                        </form>
                        <style>{`
                                .file-label {
                                    display: block;
                                }
                                input[type=file] {
                                    border: 1px solid #ccc;
                                    border-radius: 5px;
                                }
                                input.btn {
                                    padding-top: 5px;
                                    padding-bottom: 3px;
                                    margin-left: 5px;
                                    margin-bottom: 2px;
                                }
                        `}</style>      
                    </div>

                </Header>
            </div>
        </>
    );
}


export async function getServerSideProps(ctx) {
    await verifyAuth(ctx);

    return {
        props: {
            host: ctx.req.headers.host,
            url: process.env.SCHEME + "://" + ctx.req.headers.host,
            scheme: process.env.SCHEME,
            is_dark: parseCookies({req:ctx.req}).__dark=='1',
        }
    };
}

export default Import;
