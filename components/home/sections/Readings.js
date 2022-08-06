/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unescaped-entities */
import _ from "lodash";
import https from "https";
import { XMLParser } from "fast-xml-parser";
import { site_details as details } from "../../../site_config";

const parser = new XMLParser();

function requestList(userId, shelf) {
  return new Promise((resolve) => {
    https
      .request(
        {
          host: "www.goodreads.com",
          path: `/review/list_rss/${userId}?shelf=${shelf}&sort=date_read`,
        },
        (response) => {
          let data = "";
          response.on("data", (chunk) => (data += chunk));
          response.on("end", () => {
            try {
              const o = parser.parse(data);
              const items = o?.rss?.channel?.item;
              if (Array.isArray(items)) {
                resolve(
                  items.map((i) => ({
                    user_read_at: i.user_read_at,
                    title: i.title,
                    link: i.link,
                    author_name: i.author_name,
                    user_shelves: i.user_shelves,
                  }))
                );
              } else {
                resolve([]);
              }
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

export async function getBookShelves() {
  const userId = details.goodreads_userid;
  const shelves = ["currently-reading", "read"];
  const d = {};
  await Promise.all(
    shelves.map(async (shelf) => {
      d[shelf] = await requestList(userId, shelf);
    })
  );
  return d;
}

function ShelfItem({ data }) {
  const isFav = data?.user_shelves?.includes("favorites");
  return (
    <p>
      <a rel="noreferrer" target="_blank" href={data.link}>
        {data.title}
      </a>{" "}
      {isFav && "⭐️"} by{" "}
      <em style={{ fontSize: "1.1rem" }}>{data.author_name}</em>
    </p>
  );
}

function ListShelf({ shelf, data }) {
  return (
    <>
      <h3 className="section-header">
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
        data.map((book) => <ShelfItem key={book.link} data={book} />)
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
          data={props.readings["currently-reading"]}
        />
        <ListShelf shelf="read" data={props.readings.read} />
      </div>
    </div>
  );
}
