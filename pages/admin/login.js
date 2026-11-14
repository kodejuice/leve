/* eslint-disable no-use-before-define */
import Link from "next/link";
import Head from "next/head";
import { useState } from "react";
import { setCookie } from "nookies";
import ClipLoader from "react-spinners/ClipLoader";
import queryString from "query-string";

import { site_details as details } from "../../site_config";

function LoginPage() {
  const [pwd, setPwd] = useState("");
  const [isLoading, beginAuth] = useState(false);

  return (
    <>
      <Head>
        <title> Admin Login - {details.description} </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="robots" content="noindex" />
        <meta name="description" content={details.name} />
      </Head>

      <div className="page-wrapper">
        <div
          className="page-container"
          style={{ maxWidth: 440, paddingTop: "4rem" }}
        >
          <div className="login-box">
            <div style={{ marginBottom: "2rem" }}>
              <Link href="/">
                <a
                  style={{
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                  }}
                >
                  &larr; Back to site
                </a>
              </Link>
            </div>

            <h1
              style={{
                fontSize: "1.75rem",
                fontFamily: "var(--font-serif)",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Admin Access
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.95rem",
                marginBottom: "1.75rem",
              }}
            >
              Authenticate to manage publications, drafts, and archives.
            </p>

            <form onSubmit={(ev) => Login(ev, pwd, beginAuth)}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <input
                  type="password"
                  placeholder="Enter administrator password"
                  value={pwd}
                  onChange={(ev) => setPwd(ev.target.value)}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text-primary)",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "var(--accent)",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {isLoading ? (
                    <ClipLoader size={16} color="#ffffff" loading={isLoading} />
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

async function Login(ev, pwd, beginAuth) {
  ev.preventDefault();

  const queryPart =
    typeof location !== "undefined" ? location.href.split("?")[1] : "";
  const { rdr } = queryString.parse(queryPart || "");

  beginAuth(true);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password: pwd }),
      headers: { "Content-Type": "application/json" },
    });
    const json = await res.json();

    if (json.success !== true) {
      alert("Invalid password.");
    } else {
      setCookie(null, "__token", json.token, {
        path: "/",
        maxAge: 86400 * 31, // 31 days
      });

      window.location = rdr || "/admin/list";
      return;
    }
  } catch (err) {
    alert("Network or server error while logging in.");
  } finally {
    beginAuth(false);
  }
}

export default LoginPage;
