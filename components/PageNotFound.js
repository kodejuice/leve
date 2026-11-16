import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { site_details as details } from "../site_config";
import SiteHeader from "./sections/SiteHeader";
import Footer from "./sections/Footer";

/* renders a 404 page not found error */
export default function PageNotFound(props) {
  const router = useRouter();
  const rawId =
    props.id ||
    (router?.asPath ? router.asPath.replace(/^\//, "").split("?")[0] : "");
  const query = Array.isArray(rawId) ? rawId.join("/") : rawId;
  const displayQuery = query && query !== "404" ? query : null;
  const { corrections = [] } = props;

  return (
    <div className="page-wrapper">
      <Head>
        <title>Page Not Found · {details.name}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="The requested page or essay could not be found."
        />
        <meta name="robots" content="noindex, follow" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={`Page Not Found · ${details.name}`}
        />
        <meta property="og:site_name" content={details.name} />
      </Head>

      <div className="page-container">
        <SiteHeader details={details} current="404" />

        <main className="main-content">
          <section className="page-not-found-showcase">
            <div className="not-found-header">
              <span className="not-found-badge">404 · Not Found</span>
              <h1 className="not-found-title">Page Not Found</h1>
              <p className="not-found-lead">
                {displayQuery ? (
                  <>
                    The page or essay at{" "}
                    <code className="not-found-query">/{displayQuery}</code>{" "}
                    could not be located. It may have been moved, renamed, or
                    never existed.
                  </>
                ) : (
                  <>
                    The page or essay you are looking for could not be located.
                    It may have been moved, renamed, or never existed.
                  </>
                )}
              </p>
            </div>

            {corrections?.length > 0 && (
              <div className="not-found-corrections">
                <div className="corrections-header">
                  <h2 className="corrections-title">
                    Possible matches from the archives
                  </h2>
                  <span className="corrections-subtitle">
                    Did you mean one of these essays?
                  </span>
                </div>

                <ul className="corrections-list">
                  {corrections.map((p) => (
                    <li key={p.slug} className="correction-item">
                      <Link href={`/${p.slug}`}>
                        <a className="correction-card">
                          <div className="correction-card-head">
                            <span className="correction-title">{p.title}</span>
                            <span className="correction-arrow">
                              Read essay &rarr;
                            </span>
                          </div>
                          <code className="correction-slug">/{p.slug}</code>
                          {p.excerpt ? (
                            <p className="correction-excerpt">{p.excerpt}</p>
                          ) : null}
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="not-found-actions">
              <Link href="/">
                <a className="btn-not-found primary">
                  &larr; Return to Writing
                </a>
              </Link>
              <Link href="/archives">
                <a className="btn-not-found secondary">
                  Browse Archives &amp; Index
                </a>
              </Link>
              <Link href="/about">
                <a className="btn-not-found secondary">About &amp; Research</a>
              </Link>
            </div>
          </section>
        </main>

        <Footer current="404" />
      </div>
    </div>
  );
}
