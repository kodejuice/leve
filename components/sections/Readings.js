/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unescaped-entities */

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
