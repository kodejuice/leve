/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unescaped-entities */
import _ from "lodash";
import https from "https";
import { XMLParser } from "fast-xml-parser";
import { site_details as details } from "../../site_config";

const parser = new XMLParser();

function requestList(userId, shelf, urlPath, redirectCount = 0) {
  if (redirectCount > 3) return Promise.resolve(null);

  const path =
    urlPath || `/review/list_rss/${userId}?shelf=${shelf}&sort=date_read`;
  const isFullUrl = path.startsWith("http");
  const targetUrl = isFullUrl ? new URL(path) : null;

  return new Promise((resolve) => {
    https
      .request(
        {
          host: targetUrl ? targetUrl.hostname : "www.goodreads.com",
          path: targetUrl ? `${targetUrl.pathname}${targetUrl.search}` : path,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            Accept: "application/rss+xml, application/xml, text/xml, */*",
          },
        },
        (response) => {
          if (
            response.statusCode >= 300 &&
            response.statusCode < 400 &&
            response.headers.location
          ) {
            resolve(
              requestList(
                userId,
                shelf,
                response.headers.location,
                redirectCount + 1
              )
            );
            return;
          }

          if (response.statusCode !== 200) {
            resolve(null);
            return;
          }

          let data = "";
          response.on("data", (chunk) => {
            data += chunk;
          });
          response.on("end", () => {
            try {
              const o = parser.parse(data);
              const all = o?.rss?.channel?.item;
              const items = Array.isArray(all) ? all : all ? [all] : [];
              resolve(
                items
                  .filter((i) => Boolean(i?.book_id))
                  .map((i) => ({
                    book_id: i.book_id,
                    user_read_at: i.user_read_at,
                    title: i.title,
                    link: i.link,
                    author_name: i.author_name,
                    user_shelves: i.user_shelves,
                  }))
              );
            } catch (err) {
              resolve(null);
            }
          });
          response.on("error", () => resolve(null));
        }
      )
      .on("error", () => {
        resolve(null);
      })
      .end();
  });
}

let cachedShelves = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

export async function getBookShelves() {
  if (cachedShelves && Date.now() - lastFetchTime < CACHE_TTL) {
    return cachedShelves;
  }

  const userId = details.goodreads_userid;
  const shelves = ["currently-reading", "read"];
  const d = {};
  await Promise.all(
    shelves.map(async (shelf) => {
      const list = await requestList(userId, shelf);
      d[shelf] = list !== null ? list : cachedShelves?.[shelf] ?? null;
    })
  );

  if (d["currently-reading"] !== null || d.read !== null) {
    cachedShelves = d;
    lastFetchTime = Date.now();
  }

  return d;
}

function ShelfItem({ data }) {
  const noList = data?.user_shelves?.includes("nolist");
  if (noList) return null;
  const isFav = data?.user_shelves?.includes("favorites");
  const link = `https://www.goodreads.com/book/show/${data.book_id}`;
  return (
    <p>
      {isFav && "⭐️ "}
      <a rel="noreferrer" target="_blank" href={link}>
        {data.title}
      </a>{" "}
      by <em style={{ fontSize: "1.1rem" }}>{data.author_name}</em>
    </p>
  );
}

function ListShelf({ shelf, data }) {
  // console.log(data);
  return (
    <>
      <h3 className="mt-4 section-header">
        <b>{_.startCase(shelf)}</b>
      </h3>
      {!Array.isArray(data) ? (
        <p>
          <em>Failed to load data</em>
        </p>
      ) : data.length === 0 ? (
        <p>
          <em>Nothing here!</em>
        </p>
      ) : (
        data.map((book) => <ShelfItem key={book.book_id} data={book} />)
      )}
    </>
  );
}

export default function Readings(props) {
  return (
    <div>
      <h2 className="section-title"> Readings </h2>

      <div className="mt-4 mb-4">
        <ListShelf
          shelf="currently-reading"
          data={props.readings?.["currently-reading"]}
        />
        <ListShelf shelf="read" data={props.readings?.read} />
      </div>
    </div>
  );
}
