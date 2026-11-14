import Link from "next/link";
import { site_details as details } from "../../site_config";

export default function Footer({ current }) {
  return (
    <footer className="site-footer">
      <div className="footer-newsletter">
        <div className="newsletter-text">
          <span className="newsletter-title">
            Subscribe to occasional essays
          </span>
          <p className="newsletter-desc">
            Dispatches on information theory, algorithms, engineering, and
            faith.
          </p>
        </div>
        <a
          href="http://eepurl.com/h8OUC5"
          target="_blank"
          rel="noreferrer"
          className="newsletter-btn"
        >
          Subscribe via Email
        </a>
      </div>

      <div className="footer-bottom">
        <div className="footer-links">
          <Link href="/">
            <a className={current === "home" ? "active" : ""}>Writing</a>
          </Link>
          <span className="sep">·</span>
          <Link href="/about">
            <a className={current === "about" ? "active" : ""}>
              About &amp; Research
            </a>
          </Link>
          <span className="sep">·</span>
          <Link href="/readings">
            <a className={current === "readings" ? "active" : ""}>Readings</a>
          </Link>
          <span className="sep">·</span>
          <Link href="/archives">
            <a className={current === "archives" ? "active" : ""}>Archives</a>
          </Link>
          <span className="sep">·</span>
          <a href={details.links.rss_url}>RSS</a>
        </div>

        <div className="footer-colophon">
          <span>
            &copy; {new Date().getFullYear()} {details.name}
          </span>
        </div>
      </div>
    </footer>
  );
}
