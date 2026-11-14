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
        title: cleanText(title),
        author_name: cleanText(author_name),
        user_shelves: ["favorites", "read"],
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

    // Fetch profile, favorite widgets, and years in parallel from Goodreads
    const [profileHtml, customWidgetHtml, gridWidgetHtml, ...yearHtmls] =
      await Promise.all([
        fetchGoodreadsProfile(userId),
        fetchGoodreadsProfile(
          userId,
          0,
          `/review/custom_widget/${userId}?shelf=favorites`
        ),
        fetchGoodreadsProfile(
          userId,
          0,
          `/review/grid_widget/${userId}?shelf=favorites&num_books=100&order=d&sort=date_added`
        ),
        ...years.map((y) =>
          fetchGoodreadsProfile(userId, 0, `/user/year_in_books/${y}/${userId}`)
        ),
      ]);

    const parsed = parseProfileBooks(profileHtml) || {
      "currently-reading": [],
      read: [],
    };

    // Initialize Map with diskData books so NO existing book is ever lost!
    const readMap = new Map();
    if (diskData?.read) {
      diskData.read.forEach((b) => {
        if (b?.book_id) {
          readMap.set(b.book_id, { ...b });
        }
      });
    }

    function upsertBook(b, isFav = false) {
      if (!b || !b.book_id) return;
      const existing = readMap.get(b.book_id);
      if (!existing) {
        const shelves = [...(b.user_shelves || ["read"])];
        if (isFav && !shelves.includes("favorites")) shelves.push("favorites");
        readMap.set(b.book_id, {
          book_id: b.book_id,
          title: b.title,
          author_name: b.author_name || "",
          user_shelves: shelves,
        });
      } else {
        if (isFav && !existing.user_shelves.includes("favorites")) {
          existing.user_shelves.push("favorites");
        }
        if (!existing.author_name && b.author_name) {
          existing.author_name = b.author_name;
        }
        if (
          b.title &&
          (!existing.title || existing.title.length < b.title.length)
        ) {
          existing.title = b.title;
        }
      }
    }

    // 1. Profile favorites & read
    (parsed.read || []).forEach((b) => upsertBook(b, true));

    // 2. Custom widget favorites
    const customWidgetBooks = parseWidgetBooks(customWidgetHtml);
    customWidgetBooks.forEach((b) => upsertBook(b, true));

    // 3. Grid widget favorites
    const gridWidgetBooks = parseWidgetBooks(gridWidgetHtml);
    gridWidgetBooks.forEach((b) => upsertBook(b, true));

    // 4. Year in Books
    yearHtmls.forEach((yHtml) => {
      const yBooks = parseYearBooks(yHtml);
      yBooks.forEach((b) => upsertBook(b, false));
    });

    const currentlyReading =
      parsed["currently-reading"]?.length > 0
        ? parsed["currently-reading"]
        : diskData?.["currently-reading"] || [];

    const combinedRead = Array.from(readMap.values());

    const result = {
      "currently-reading": currentlyReading,
      read: combinedRead,
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
