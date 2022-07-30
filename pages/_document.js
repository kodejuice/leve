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
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/markdown-it-texmath/css/texmath.min.css"
          />
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

          <script
            id="dsq-count-scr"
            src={`//${process.env.DISQUS_HOST}/count.js`}
            async
          />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
