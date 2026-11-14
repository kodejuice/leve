/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unescaped-entities */
import https from "https";
import { URL } from "url";
import { site_details as details } from "../../site_config";

function fetchGoodreadsProfile(userId, redirectCount = 0, customPath = null) {
  if (redirectCount > 3) return Promise.resolve(null);

  const targetPath = customPath || `/user/show/${userId}`;
  const isFull = targetPath.startsWith("http");
  const targetUrl = isFull ? new URL(targetPath) : null;

  return new Promise((resolve) => {
    https
      .get(
        {
          hostname: targetUrl ? targetUrl.hostname : "www.goodreads.com",
          path: targetUrl
            ? `${targetUrl.pathname}${targetUrl.search}`
            : targetPath,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        },
        (res) => {
          if (
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            resolve(
              fetchGoodreadsProfile(
                userId,
                redirectCount + 1,
                res.headers.location
              )
            );
            return;
          }

          if (res.statusCode !== 200) {
            resolve(null);
            return;
          }

          let html = "";
          res.on("data", (chunk) => {
            html += chunk;
          });
          res.on("end", () => resolve(html));
          res.on("error", () => resolve(null));
        }
      )
      .on("error", () => resolve(null));
  });
}

function parseProfileBooks(html) {
  if (!html) return null;

  const result = {
    "currently-reading": [],
    read: [],
  };

  // 1. Parse Currently Reading
  const crMatch = html.match(
    /id="currentlyReadingReviews"[\s\S]*?(?:<div class="h2Container|<div class="clearFloats bigBox")/i
  );
  if (crMatch) {
    const blocks = crMatch[0].split(/class="Updates/i).slice(1);
    blocks.forEach((block) => {
      const idMatch = block.match(/\/book\/show\/([0-9]+)/);
      const titleMatch =
        block.match(/<a title="([^"]+)" href="\/book\/show\//i) ||
        block.match(/alt="([^"]+)"/i);
      const authorMatch = block.match(/class="authorName"[^>]*>([^<]+)<\/a>/i);

      if (idMatch && titleMatch) {
        result["currently-reading"].push({
          book_id: idMatch[1],
          title: titleMatch[1].trim(),
          author_name: authorMatch ? authorMatch[1].trim() : "Unknown",
          user_shelves: ["currently-reading"],
        });
      }
    });
  }

  // 2. Parse Favorite / Read Books
  const favMatch = html.match(
    /favorite books<\/a><\/h2>[\s\S]*?<div class="imgGrid"[\s\S]*?>([\s\S]*?)<\/div>/i
  );
  if (favMatch) {
    const gridHtml = favMatch[1];
    const items = [
      ...gridHtml.matchAll(
        /<a href="\/book\/show\/([0-9]+)[^"]*"><img [^>]*alt="([^"]+)"[^>]*>/gi
      ),
    ];
    items.forEach((m) => {
      const book_id = m[1];
      const rawAlt = m[2];
      let title = rawAlt;
      let author_name = "";
      if (rawAlt.includes(" by ")) {
        const parts = rawAlt.split(" by ");
        title = parts[0].trim();
        author_name = parts.slice(1).join(" by ").trim();
      }
      result.read.push({
        book_id,
        title,
        author_name,
        user_shelves: ["favorites", "read"],
      });
    });
  }

  return result;
}

let cachedShelves = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

export async function getBookShelves() {
  if (cachedShelves && Date.now() - lastFetchTime < CACHE_TTL) {
    return cachedShelves;
  }

  const userId = details.goodreads_userid;

  try {
    const html = await fetchGoodreadsProfile(userId);
    const parsed = parseProfileBooks(html);

    if (
      parsed &&
      (parsed["currently-reading"]?.length > 0 || parsed.read?.length > 0)
    ) {
      cachedShelves = parsed;
      lastFetchTime = Date.now();
      return parsed;
    }
  } catch (err) {
    // network / parse error
  }

  if (cachedShelves) {
    return cachedShelves;
  }

  return {
    "currently-reading": null,
    read: null,
  };
}

function ShelfItem({ data }) {
  const noList = data?.user_shelves?.includes("nolist");
  if (noList) return null;
  const isFav = data?.user_shelves?.includes("favorites");
  const link = `https://www.goodreads.com/book/show/${data.book_id}`;

  return (
    <div className="book-item">
      <div className="book-main">
        {isFav && (
          <span className="book-fav-badge" title="Personal Favorite">
            &#9733; Favorite
          </span>
        )}
        <h4 className="book-title">
          <a rel="noreferrer" target="_blank" href={link}>
            {data.title}
          </a>
        </h4>
        <span className="book-author">by {data.author_name}</span>
      </div>
      <a
        rel="noreferrer"
        target="_blank"
        href={link}
        className="book-external-link"
        title="View on Goodreads"
      >
        Goodreads &rarr;
      </a>
    </div>
  );
}

function ListShelf({ shelf, data }) {
  const title =
    shelf === "currently-reading" ? "Currently Reading" : "Read Books";
  const count = Array.isArray(data) ? data.length : 0;

  return (
    <section className="reading-shelf-section">
      <div className="shelf-header">
        <h3 className="shelf-title">{title}</h3>
        {count > 0 && (
          <span className="shelf-count">
            {count} {count === 1 ? "book" : "books"}
          </span>
        )}
      </div>

      {!Array.isArray(data) ? (
        <p className="shelf-notice error">
          <em>Unable to retrieve Goodreads data at this time.</em>
        </p>
      ) : data.length === 0 ? (
        <p className="shelf-notice empty">
          <em>No books listed on this shelf currently.</em>
        </p>
      ) : (
        <div className="shelf-books-grid">
          {data.map((book) => (
            <ShelfItem key={book.book_id} data={book} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Readings(props) {
  return (
    <div className="readings-showcase">
      <div className="readings-intro">
        <h1 className="readings-main-title">Reading Shelf</h1>
        <p className="readings-desc">
          An ongoing bibliographic log of books across information theory,
          computer science, theology, kingdom dominion, and strategy — curated
          alongside Goodreads.
        </p>
        <div style={{ marginTop: "0.85rem" }}>
          <a
            href="https://www.goodreads.com/user/show/115473285"
            target="_blank"
            rel="noreferrer"
            className="external-link-btn"
            style={{ fontSize: "0.85rem" }}
          >
            Browse complete library on Goodreads (330+ titles) &rarr;
          </a>
        </div>
      </div>

      <div className="shelves-wrapper">
        <ListShelf
          shelf="currently-reading"
          data={props.readings?.["currently-reading"]}
        />
        <ListShelf shelf="read" data={props.readings?.read} />
      </div>
    </div>
  );
}
