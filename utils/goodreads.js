import fs from "fs";
import os from "os";
import path from "path";
import https from "https";
import { URL } from "url";
import { site_details as details } from "../site_config.js";

const PRIMARY_CACHE_FILE = path.join(
  process.cwd(),
  "data",
  "goodreads-cache.json"
);
const TMP_CACHE_FILE = path.join(os.tmpdir(), "goodreads-shelf-cache.json");

function readDiskCache() {
  // 1. Try TMP cache first (has recent runtime updates)
  try {
    if (fs.existsSync(TMP_CACHE_FILE)) {
      const raw = fs.readFileSync(TMP_CACHE_FILE, "utf8");
      const data = JSON.parse(raw);
      if (data?.shelves) return data.shelves;
    }
  } catch (e) {
    // ignore
  }

  // 2. Fallback to project-committed cache file
  try {
    if (fs.existsSync(PRIMARY_CACHE_FILE)) {
      const raw = fs.readFileSync(PRIMARY_CACHE_FILE, "utf8");
      const data = JSON.parse(raw);
      if (data?.shelves) return data.shelves;
    }
  } catch (e) {
    // ignore
  }

  return null;
}

function writeDiskCache(shelves) {
  const payload = JSON.stringify({ timestamp: Date.now(), shelves }, null, 2);
  try {
    fs.writeFileSync(TMP_CACHE_FILE, payload, "utf8");
  } catch (e) {
    // ignore
  }
  try {
    fs.writeFileSync(PRIMARY_CACHE_FILE, payload, "utf8");
  } catch (e) {
    // ignore
  }
}

function cleanText(str) {
  if (!str) return "";
  return str
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

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
    favorites: [],
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
          title: cleanText(titleMatch[1]),
          author_name: cleanText(authorMatch ? authorMatch[1] : "Unknown"),
          user_shelves: ["currently-reading"],
        });
      }
    });
  }

  // 2. Parse Favorite Books from profile grid
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
      result.favorites.push({
        book_id,
        title: cleanText(title),
        author_name: cleanText(author_name),
      });
    });
  }

  return result;
}

function parseWidgetBooks(html) {
  if (!html) return [];
  const books = [];
  const unescaped = html
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\n/g, "\n")
    .replace(/\\\//g, "/");

  // Pattern 1: custom widget containers
  if (unescaped.includes("gr_custom_each_container_")) {
    const blocks = unescaped.split("gr_custom_each_container_").slice(1);
    blocks.forEach((b) => {
      const titleMatch = b.match(
        /class="gr_custom_title_"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i
      );
      const authorMatch = b.match(
        /class="gr_custom_author_"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i
      );
      const idMatch =
        b.match(/\/books\/[0-9]+[a-z0-9_-]*\/([0-9]+)/i) ||
        b.match(/l\/([0-9]+)\./i) ||
        b.match(/show\/([0-9]+)/i);

      if (titleMatch && idMatch) {
        books.push({
          book_id: idMatch[1],
          title: cleanText(titleMatch[1]),
          author_name: cleanText(authorMatch ? authorMatch[1] : ""),
          user_shelves: ["favorites", "read"],
        });
      }
    });
  }

  // Pattern 2: grid widget containers
  if (unescaped.includes("gr_grid_book_container")) {
    const gridMatches = [
      ...unescaped.matchAll(
        /<div class="gr_grid_book_container"><a title="([^"]+)"[^>]*href="https:\/\/www\.goodreads\.com\/review\/show\/([0-9]+)[^"]*"><img[^>]*src="https:\/\/i\.gr-assets\.com\/images\/[^\/]+\/[^\/]+\/books\/[0-9]+l\/([0-9]+)[^"]*"/gi
      ),
    ];
    gridMatches.forEach((m) => {
      const rawTitle = m[1];
      const book_id = m[3];
      let title = rawTitle;
      let author_name = "";
      if (rawTitle.includes(" by ")) {
        const parts = rawTitle.split(" by ");
        title = parts[0].trim();
        author_name = parts.slice(1).join(" by ").trim();
      } else if (rawTitle.includes(" By ")) {
        const parts = rawTitle.split(" By ");
        title = parts[0].trim();
        author_name = parts.slice(1).join(" By ").trim();
      }
      books.push({
        book_id,
        title: cleanText(title),
        author_name: cleanText(author_name),
        user_shelves: ["favorites", "read"],
      });
    });
  }

  return books;
}

function parseYearBooks(html) {
  const books = [];
  if (!html) return books;
  const matches = [
    ...html.matchAll(
      /<a[^>]*href="\/book\/show\/([0-9]+)[^"]*"[^>]*>\s*<img[^>]*alt="([^"]+ by [^"]+)"/gi
    ),
  ];
  matches.forEach((m) => {
    const book_id = m[1];
    const raw = m[2];
    const parts = raw.split(" by ");
    books.push({
      book_id,
      title: cleanText(parts[0]),
      author_name: cleanText(parts.slice(1).join(" by ")),
      user_shelves: ["read"],
    });
  });
  return books;
}

function normalizeTitle(t) {
  if (!t) return "";
  return t
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 40);
}

let cachedShelves = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour in-memory throttle

export async function getBookShelves() {
  // If memory cache is fresh, serve it immediately
  if (cachedShelves && Date.now() - lastFetchTime < CACHE_TTL) {
    return cachedShelves;
  }

  // Load baseline from persistent disk cache (never expires)
  const diskData = readDiskCache();
  if (diskData && !cachedShelves) {
    cachedShelves = diskData;
  }

  const userId = details.goodreads_userid;

  try {
    const START_YEAR = 2020;
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= START_YEAR; y--) {
      years.push(y);
    }

    // Fetch profile, live favorites widget, and year-by-year reading history in parallel
    const [profileHtml, favWidgetHtml, ...yearHtmls] = await Promise.all([
      fetchGoodreadsProfile(userId),
      fetchGoodreadsProfile(userId, 0, `/review/custom_widget/${userId}`),
      ...years.map((y) =>
        fetchGoodreadsProfile(userId, 0, `/user/year_in_books/${y}/${userId}`)
      ),
    ]);

    const parsed = parseProfileBooks(profileHtml) || {
      "currently-reading": [],
      read: [],
    };

    // 1. Authoritative favorite books from live custom widget
    const favWidgetBooks = parseWidgetBooks(favWidgetHtml);
    let favIdSet;
    let favTitleSet;

    if (favWidgetBooks.length > 0) {
      favIdSet = new Set(favWidgetBooks.map((b) => String(b.book_id)));
      favTitleSet = new Set(
        favWidgetBooks.map((b) => normalizeTitle(b.title))
      );
    } else {
      const diskFavs = (diskData?.read || []).filter((b) =>
        b.user_shelves?.includes("favorites")
      );
      favIdSet = new Set(diskFavs.map((b) => String(b.book_id)));
      favTitleSet = new Set(diskFavs.map((b) => normalizeTitle(b.title)));
    }

    // 2. Build strictly chronological reading list (most recent first) without duplicates
    const seenTitles = new Set();
    const seenIds = new Set();
    const readList = [];

    function appendBook(b) {
      if (!b || !b.title) return;
      const norm = normalizeTitle(b.title);
      const id = String(b.book_id || "");

      // Deduplicate across edition IDs and identical book titles
      if (seenTitles.has(norm) || (id && seenIds.has(id))) return;
      seenTitles.add(norm);
      if (id) seenIds.add(id);

      const isFav = favIdSet.has(id) || favTitleSet.has(norm);
      readList.push({
        book_id: id,
        title: b.title,
        author_name: b.author_name || "",
        user_shelves: isFav ? ["read", "favorites"] : ["read"],
      });
    }

    // A. Add books chronologically from years descending (2026 down to START_YEAR)
    yearHtmls.forEach((yHtml) => {
      const yBooks = parseYearBooks(yHtml);
      yBooks.forEach((b) => appendBook(b));
    });

    // B. Add any older historical books from persistent cache (no duplicates)
    if (diskData?.read) {
      diskData.read.forEach((b) => appendBook(b));
    }

    const currentlyReading =
      parsed["currently-reading"]?.length > 0
        ? parsed["currently-reading"]
        : diskData?.["currently-reading"] || [];

    const result = {
      "currently-reading": currentlyReading,
      read: readList,
    };

    if (result["currently-reading"].length > 0 || result.read.length > 0) {
      cachedShelves = result;
      lastFetchTime = Date.now();
      writeDiskCache(result);
      return result;
    }
  } catch (err) {
    // network / parse error
  }

  // If live fetch failed or network was down, return diskData or cachedShelves
  if (diskData) {
    return diskData;
  }
  if (cachedShelves) {
    return cachedShelves;
  }

  return {
    "currently-reading": null,
    read: null,
  };
}
