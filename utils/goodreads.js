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
  let tmpData = null;
  let primaryData = null;

  // 1. Try TMP cache first (has recent runtime updates)
  try {
    if (fs.existsSync(TMP_CACHE_FILE)) {
      const raw = fs.readFileSync(TMP_CACHE_FILE, "utf8");
      const data = JSON.parse(raw);
      if (data?.shelves) tmpData = data;
    }
  } catch (e) {
    // ignore
  }

  // 2. Fallback to project-committed cache file
  try {
    if (fs.existsSync(PRIMARY_CACHE_FILE)) {
      const raw = fs.readFileSync(PRIMARY_CACHE_FILE, "utf8");
      const data = JSON.parse(raw);
      if (data?.shelves) primaryData = data;
    }
  } catch (e) {
    // ignore
  }

  if (tmpData && primaryData) {
    return (tmpData.timestamp || 0) >= (primaryData.timestamp || 0)
      ? tmpData
      : primaryData;
  }

  return tmpData || primaryData || null;
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
    const req = https
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
            res.resume();
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
            res.resume();
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

    req.setTimeout(4500, () => {
      req.destroy();
      resolve(null);
    });
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
const DISK_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours disk cache expiration

export async function getBookShelves(forceRefresh = false) {
  // 1. If memory cache is fresh, serve it immediately
  if (!forceRefresh && cachedShelves && Date.now() - lastFetchTime < CACHE_TTL) {
    return cachedShelves;
  }

  // 2. Load baseline from persistent disk cache
  const diskCache = readDiskCache();
  const diskData = diskCache?.shelves || null;
  const isDiskFresh =
    Boolean(diskCache?.timestamp) &&
    Date.now() - Number(diskCache.timestamp) < DISK_CACHE_TTL;

  // Serve disk cache immediately if it is fresh (< 24h old) and has books
  if (!forceRefresh && isDiskFresh && diskData?.read?.length > 0) {
    cachedShelves = diskData;
    lastFetchTime = Date.now();
    return diskData;
  }

  const userId = details.goodreads_userid;

  try {
    const currentYear = new Date().getFullYear();
    const prevYear = currentYear - 1;

    // Check profile (for currently-reading), favorites widget (for live favorites shelf), and recent years (for newly finished books)
    const [profileHtml, favWidgetHtml, currentYearHtml, prevYearHtml] =
      await Promise.all([
        fetchGoodreadsProfile(userId),
        fetchGoodreadsProfile(
          userId,
          0,
          `/review/custom_widget/${userId}?shelf=favorites&num_books=100&sort=date_added&order=d`
        ),
        fetchGoodreadsProfile(
          userId,
          0,
          `/user/year_in_books/${currentYear}/${userId}`
        ),
        fetchGoodreadsProfile(
          userId,
          0,
          `/user/year_in_books/${prevYear}/${userId}`
        ),
      ]);

    const parsed = parseProfileBooks(profileHtml) || {
      "currently-reading": [],
      read: [],
    };
    const favWidgetBooks = parseWidgetBooks(favWidgetHtml);

    // Existing curated favorites from diskData MUST NEVER be wiped or un-favorited
    const existingFavIdSet = new Set(
      (diskData?.read || [])
        .filter((b) => b.user_shelves?.includes("favorites"))
        .map((b) => String(b.book_id))
    );
    const existingFavTitleSet = new Set(
      (diskData?.read || [])
        .filter((b) => b.user_shelves?.includes("favorites"))
        .map((b) => normalizeTitle(b.title))
    );

    // Pick up all favorite books from live Goodreads favorites widget + profile showcase
    [...favWidgetBooks, ...(parsed.favorites || [])].forEach((b) => {
      if (b?.book_id) existingFavIdSet.add(String(b.book_id));
      if (b?.title) existingFavTitleSet.add(normalizeTitle(b.title));
    });

    // Build deduplicated chronological list
    const seenTitles = new Set();
    const seenIds = new Set();
    const readList = [];

    function appendBook(b, defaultFav = false) {
      if (!b || !b.title) return;
      const norm = normalizeTitle(b.title);
      const id = String(b.book_id || "");

      if (seenTitles.has(norm) || (id && seenIds.has(id))) return;
      seenTitles.add(norm);
      if (id) seenIds.add(id);

      const isFav =
        defaultFav ||
        existingFavIdSet.has(id) ||
        existingFavTitleSet.has(norm) ||
        Boolean(b.user_shelves?.includes("favorites"));

      readList.push({
        book_id: id,
        title: b.title,
        author_name: b.author_name || "",
        user_shelves: isFav ? ["read", "favorites"] : ["read"],
      });
    }

    // A. Add latest books from current and previous year in books (captures newly finished books)
    const currentYearBooks = parseYearBooks(currentYearHtml);
    const prevYearBooks = parseYearBooks(prevYearHtml);
    currentYearBooks.forEach((b) => appendBook(b));
    prevYearBooks.forEach((b) => appendBook(b));

    // B. Maintain existing chronological reading order from disk cache
    if (diskData?.read) {
      diskData.read.forEach((b) => appendBook(b));
    }

    // C. Include any newly favorited books not yet present in year_in_books or disk cache
    favWidgetBooks.forEach((b) => appendBook(b, true));

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

  if (diskData) {
    cachedShelves = diskData;
    lastFetchTime = Date.now();
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
