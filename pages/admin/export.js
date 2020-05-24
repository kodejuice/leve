import {useEffect} from 'react'

import Link from 'next/link'
import Head from 'next/head'
import fetch from 'node-fetch'
import { parseCookies } from 'nookies'

import Header from '../../components/admin/Header';
import { site_details as details } from '../../site_config.js';

import verifyAuth from '../../utils/auth.js';


function Export(props) {
    let is_dark = props.is_dark;
    useEffect(_=>{
        if (parseCookies(null).__dark == "1")
            document.querySelector("body").classList.add('dark');
        window.onbeforeunload = ()=>null;
    });

    return (
        <>
            <Head>
                <title> Export Data &lsaquo; {details.description} - Admin </title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <meta name="robots" content="noindex"/>
            </Head>

            <div className='admin'>
                <Header dark={is_dark} quick_draft={true} page='export'>
                    <div className='mt-4'>
                        <a href='../../api/post/import_export?type=export'> Download site data ({props.total_size}) </a>
                    </div>
                </Header>
            </div>
        </>
    );
}



export async function getServerSideProps(ctx) {
    await verifyAuth(ctx);

    const baseUrl = `http://${process.env.HOST}`;
    const res = await fetch(`${baseUrl}/api/post/import_export?size_only=true&type=export`, {
        headers: {cookie: ctx.req.headers.cookie}
    });
    const json = (await res.json());

    return {
        props: {
            total_size: json.size || null,
            is_dark: ctx.req.url.includes('?dark')
        }
    };
}

export default Export;
