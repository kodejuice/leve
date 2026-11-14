import Link from "next/link";
import { site_details as details } from "../../site_config";
import SignupForm from "../home/SignupForm";

export default function Footer({ current }) {
  return (
    <footer className="site-footer">
      <div className="footer-newsletter">
        <div className="newsletter-text">
          <span className="newsletter-title">
            Subscribe to occasional essays
          </span>
          <p className="newsletter-desc">
            Thoughts on technology, ideas, faith, and life.
          </p>
        </div>
        <div className="footer-newsletter-form">
          <SignupForm />
        </div>
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
          {details.links.newsletter && (
            <>
              <span className="sep">·</span>
              <a
                href={details.links.newsletter}
                target="_blank"
                rel="noreferrer"
              >
                Newsletter
              </a>
            </>
          )}
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
