/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import { useState } from "react";

import indexed_quotes from "../../data/quotes/indexed-quotes";
import all_quotes from "../../data/quotes/quotes";

/**
 *
 * @param {string} kwords
 * @param {(string[])=>void} selectQuotes
 * @returns
 */
function getMatchingQuotes(kwords, selectQuotes) {
  const matches = []; // stores matching quotes
  const seen = {}; // stores the count of keywords a quote with a certain id has

  kwords = kwords
    .trim()
    .toLowerCase()
    .split(/[^a-zA-Z0-9]/);
  if (!kwords.length) {
    return alert("Enter keywords!");
  }

  // go through keywords and get quotes with those words
  for (const k of kwords) {
    if (k in indexed_quotes) {
      // indexed_quotes[k] is an array of quote ids
      // these quote ids are indexes to quotes in the 'quoutes.js' file
      indexed_quotes[k].forEach((id) => {
        if (!(id in seen)) {
          // we've not added this yet
          // add now
          matches.push([id, all_quotes[id]]);
          seen[id] = 1;
        } else {
          // We've added this, increment the count.
          // This quote has another of our keyword
          seen[id] += 1;
        }
      });
    }
  }

  // sort in descending order of keywords matches a quote has
  matches.sort((x, y) => seen[y[0]] - seen[x[0]]);

  // updates view
  selectQuotes(matches.map((q) => q[1]).slice(0, 4 * 10));

  return null;
}

export default function QuoteSelect(props) {
  const { keywords, setQuote, selected, fullText_kwrds } = props;

  // states
  const [kwords, setKeywords] = useState(keywords || "");
  const [quotes, selectQuotes] = useState([]);

  const [searchBy, setSearchBy] = useState("keywords");

  return (
    <div className="quote-select">
      <div className="form border-bottom pb-2 mb-3">
        <form onSubmit={(ev) => ev.preventDefault()}>
          <label
            htmlFor="Post keywords"
            style={{ fontSize: "18px", display: "block" }}
          >
            Get Matching Quotes
          </label>
          <div className="row">
            <div className="col-12 col-sm-8 btn-group">
              <input
                type="text"
                className="w-100 post-in keywords-in"
                placeholder="Enter keywords to get matching quotes"
                title="Enter keywords to get matching quotes"
                value={kwords}
                style={{
                  color: "#333",
                  fontSize: "16px",
                  borderRadius: "5px",
                }}
                onChange={(v) => setKeywords(v.target.value)}
                disabled={searchBy === "fulltext"}
              />
            </div>
            <div className="col-12 col-sm-4 btn-group">
              <button
                onClick={() => {
                  setSearchBy("keywords");
                  getMatchingQuotes(kwords, selectQuotes);
                }}
                title="match keywords"
                className={`kwrd-btn btn btn${
                  searchBy === "fulltext" ? "-outline" : ""
                }-primary`}
              >
                {" "}
                keywords{" "}
              </button>
              <button
                onClick={() => {
                  setSearchBy("fulltext");
                  getMatchingQuotes(fullText_kwrds, selectQuotes);
                }}
                title="match fulltext"
                className={`kwrd-btn btn btn${
                  searchBy === "keywords" ? "-outline" : ""
                }-info`}
              >
                {" "}
                fullText{" "}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="quotes">
        {quotes.map((q) => (
          <blockquote
            key={q.quote}
            onClick={() => setQuote(q.quote !== selected.quote ? q : {})}
            className="dialog-quote-block btn w-25 blockquote mt-4"
            style={
              q.quote === selected.quote ? { border: "1px solid #333" } : {}
            }
          >
            <p className="mb-0 post-quote">{q.quote}.</p>
            <footer className="blockquote-footer p-quote text-right">
              <cite>{q.author}</cite>
            </footer>
          </blockquote>
        ))}
        <style>{`
                        blockquote {
                            display: inline-block;
                        }
                    `}</style>
      </div>
    </div>
  );
}
