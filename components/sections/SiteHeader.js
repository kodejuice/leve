import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import Toggle from "../home/Toggle";

// Crisp inline SVGs for scholarly & professional networks
function ScholarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function RssIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  );
}

export default function SiteHeader({ details, current }) {
  const router = useRouter();
  const path = current || router.asPath || "/";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(parseCookies(null).__token));
  }, []);

  const isWriting = path === "/" || path === "home";
  const isAbout = path.startsWith("/about") || path === "about";
  const isReadings = path.startsWith("/readings") || path === "readings";
  const isArchives =
    path.startsWith("/archives") ||
    path.startsWith("/topic") ||
    path === "archives" ||
    path === "topic";

  const { links } = details;

  return (
    <header className="site-header">
      <div className="site-header-top">
        <div className="site-identity">
          <Link href="/">
            <a className="site-title">{details.name}</a>
          </Link>
          <p className="site-tagline">Research Scientist · Engineer · Priest</p>
        </div>

        <div className="site-controls">
          {isLoggedIn && (
            <div className="admin-quick-links">
              <Link href="/admin/list">
                <a className="admin-btn" title="Dashboard">
                  Admin
                </a>
              </Link>
              <Link href="/admin/edit">
                <a className="admin-btn" title="Write New Post">
                  + New
                </a>
              </Link>
            </div>
          )}
          <Toggle />
        </div>
      </div>

      <div className="site-header-bar">
        <nav className="site-nav" aria-label="Main Navigation">
          <Link href="/">
            <a className={`nav-link ${isWriting ? "active" : ""}`}>Writing</a>
          </Link>
          <Link href="/about">
            <a className={`nav-link ${isAbout ? "active" : ""}`}>
              About &amp; Research
            </a>
          </Link>
          <Link href="/readings">
            <a className={`nav-link ${isReadings ? "active" : ""}`}>Readings</a>
          </Link>
          <Link href="/archives">
            <a className={`nav-link ${isArchives ? "active" : ""}`}>Archives</a>
          </Link>
        </nav>

        <div className="site-socials" aria-label="External Profiles">
          <a
            href={links.google_scholar}
            target="_blank"
            rel="noreferrer"
            className="social-icon"
            title="Google Scholar (Research Papers)"
            aria-label="Google Scholar"
          >
            <ScholarIcon />
          </a>
          <a
            href={links.github}
            target="_blank"
            rel="noreferrer"
            className="social-icon"
            title="GitHub (@kodejuice)"
            aria-label="GitHub"
          >
            <GithubIcon />
          </a>
          <a
            href={links.twitter}
            target="_blank"
            rel="noreferrer"
            className="social-icon"
            title="X / Twitter (@sochima_b)"
            aria-label="X (Twitter)"
          >
            <XIcon />
          </a>
          <a
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="social-icon"
            title="LinkedIn"
            aria-label="LinkedIn"
          >
            <LinkedinIcon />
          </a>
          <a
            href={`mailto:${details.email}`}
            className="social-icon"
            title={`Email: ${details.email}`}
            aria-label="Email"
          >
            <MailIcon />
          </a>
          <a
            href={links.rss_url}
            className="social-icon"
            title="RSS Feed"
            aria-label="RSS Feed"
          >
            <RssIcon />
          </a>
        </div>
      </div>
    </header>
  );
}
