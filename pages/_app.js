import { useEffect } from "react";
import { parseCookies } from "nookies";
import "../assets/styles.scss";
import "../assets/dark-theme.scss";
import "../assets/pagination.scss";
import "../assets/admin.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import Router from "next/router";
import NProgress from "nprogress"; //nprogress module
import "nprogress/nprogress.css"; //styles of nprogress
import { GoogleAnalytics } from '@next/third-parties/google'

//Binding events.
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // set dark theme
    if (parseCookies(null).__dark === "1") {
      document.querySelector("body").classList.add("dark");
    }
  });

  return (
    <>
      <Component {...pageProps} />

      {/* <!-- Google Analytics --> */}
      <GoogleAnalytics gaId="G-QDSBDZSG0Z" />

      {/* <Script
            strategy="beforeInteractive"
            src="https://www.googletagmanager.com/gtag/js?id=G-QDSBDZSG0Z"
          />
          <Script
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('post_config', 'G-QDSBDZSG0Z');
              `,
            }}
          /> */}
    </>
  );
}
