import Head from 'next/head'
import Link from 'next/link'

import {useEffect} from 'react'

import { site_details as details } from '../site_config.js';


/* renders a 404 page not found error */
export default function PageNotFound(props) {
    let query = props.id.join('/');
    let {corrections} = props;

    return (
        <>
            <Head>
                <title> Page Not Found </title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <meta name="description" content="That page doesn't exist" />
                <meta name="robots" content="noindex"/>
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://tinyurl.com/y3x3hrzk" />
                <meta property="og:title" content="Page Not Found" />
                <meta property="og:site_name" content="Sochima Biereagu" />
            </Head>

            <div style={{position: 'fixed', bottom:0, right:5, fontSize: '16px'}}>
                <em><cite>{details.description}</cite></em>
            </div>

            <div className='container home-main page-not-found-div'>
                <h1> Page Not Found </h1>

                <div style={{marginTop: '80px'}}>
                    <div className='corrections'>
                        { corrections.length ? (
                            <>
                                <em> Possible corrections for '/{`${query}`}' </em>
                                <ul className='mt-2'>
                                    { corrections.map(p =>
                                        <li title={p.excerpt} key={p.slug}>
                                            <Link href={`/${p.slug}`}>
                                                <a className='link no-underline'> {p.slug} <span>[{p.title}]</span></a>
                                            </Link>
                                        </li> 
                                    )}
                                </ul>
                            </>
                        ) : "" }
                    </div>

                    <div className='mt-5'>
                        <Link href="/">
                            <a> &lt;&lt; Go home </a>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
