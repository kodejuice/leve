import {useEffect, useState} from 'react'
import { parseCookies } from 'nookies'
import '../assets/styles.scss'
import '../assets/dark-theme.scss'
import '../assets/pagination.scss'
import '../assets/admin.scss'
import "bootstrap/dist/css/bootstrap.min.css"
import Router from 'next/router'
import NProgress from 'nprogress' //nprogress module
import 'nprogress/nprogress.css' //styles of nprogress

//Binding events. 
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function MyApp({ Component, pageProps }) {
	const [isMounted, setIsMounted] = useState(false);

    // add style <body> tag
    useEffect(_=>{
        // set theme
        document.querySelector("body").classList.add('body');
        if (parseCookies(null).__dark == "1") {
            document.querySelector("body").classList.add('dark');
        }

		setIsMounted(true);
    });

    return isMounted && <Component {...pageProps} />;
}

