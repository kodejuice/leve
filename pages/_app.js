import {useEffect} from 'react'
import '../assets/styles.scss'
import '../assets/dark-theme.scss'
import '../assets/pagination.scss'
import '../assets/admin.scss'
import "bootstrap/dist/css/bootstrap.min.css"

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {

    // add style <body> tag
    useEffect(_=>{
        document.querySelector("body").classList.add('body');
    });

    return <Component {...pageProps} />;
}
