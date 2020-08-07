import Head from 'next/head'
import Link from 'next/link'

import {useEffect} from 'react'

import { parseCookies } from 'nookies'

import { site_details as details } from '../site_config.js';


export default function PageError() {
    useEffect(_=>{
        if (parseCookies(null).__dark == "1")
            document.querySelector("body").classList.add('dark');
    });

    return (
        <>
            <Head>
                <title> An Error Occured </title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <meta name="description" content={details.description}/>
                <meta name="robots" content="noindex"/>
            </Head>

            <div style={{position: 'fixed', bottom:0, right:5, fontSize: '16px'}}>
                <em><cite>{details.description}</cite></em>
            </div>

            <div className='container home-main page-not-found-div'>
                <h1> Oops! </h1>

                <div style={{marginTop: '60px'}}>
                    <div className='corrections'>
                        An error occured while trying to load the page
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
