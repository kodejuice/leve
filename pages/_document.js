import Script from "next/script";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/favicon/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon/favicon-16x16.png"
          />
          <link rel="canonical" href={`https://${process.env.HOST}`} />
          <link rel="manifest" href="/favicon/site.webmanifest" />
          <link
            rel="alternate"
            type="application/rss+xml"
            title="Sochima Biereagu"
            href={`https://${process.env.HOST}/api/rss.xml`}
          />
          <meta name="charset" content="utf-8" />
          <meta name="referrer" content="no-referrer-when-downgrade" />
        </Head>
        <body className="body">
          <Main />
          <NextScript />

          {/* FastComments */}
          <Script
            strategy="beforeInteractive"
            src="https://cdn.fastcomments.com/js/embed-v2.min.js"
          />
          <script src="https://cdn.fastcomments.com/js/widget-comment-count.min.js" />

          {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}
          <Script
            strategy="beforeInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=G-QDSBDZSG0Z`}
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
          />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
