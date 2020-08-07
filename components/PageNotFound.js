import Head from 'next/head'
import Link from 'next/link'

import {useEffect} from 'react'

import fetch from 'node-fetch'
import { parseCookies, setCookie } from 'nookies'

import { site_details as details } from '../site_config.js';


/* renders a 404 page not found error */
export default function PageNotFound(props) {
    useEffect(_=>{
        if (parseCookies(null).__dark == "1")
            document.querySelector("body").classList.add('dark');
    });

    let query = props.id.join('/');
    let {corrections} = props;

    return (
      <>
        <Head>
          <title> Page Not Found </title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <meta name="description" content={details.description}/>
          <meta name="robots" content="noindex"/>
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
                                            <a className='link no-underline'> {p.slug} <em>&lt;{p.title}&gt;</em></a>
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
