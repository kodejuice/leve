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
          <meta
            name="follow.it-verification-code"
            content="utTSUNq7yLNkJl4s547U"
          />
          <meta name="charset" content="utf-8" />
          <meta name="referrer" content="no-referrer-when-downgrade" />

          {/* Typography: Newsreader (Editorial Serif), Inter (Sans UI), JetBrains Mono (Code/Math) */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=Source+Sans+3:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
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
        </body>
      </Html>
    );
  }
}

export default MyDocument;
