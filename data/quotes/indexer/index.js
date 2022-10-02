#!/usr/bin/node
/* eslint-disable no-restricted-syntax */

const fs = require("fs");
const all_quotes = require("../quotes");
let stopwords = require("./stopwords");

// convert stopwords array to a set
// for faster word check
stopwords = new Set(stopwords);

// eslint-disable-next-line no-console
const log = (...x) => console.log(...x);

// Get unique words from a string
const words = (string) =>
  new Set(
    string
      .split(/[^a-zA-Z0-9]/) // split string by non alphabet characters
      .filter((w) => w.length > 1) // get non letters (.length > 1)
      .map((w) => w.toLowerCase()) // convert word to lowercase
  );

// remove stopwords from array of words
const removeStop = (list) => {
  const array = Array.from(list);
  return new Set(array.filter((word) => !stopwords.has(word.toLowerCase())));
};

// create file
// ...
// stores the created indexed file on disk
function createFile(fname, content) {
  try {
    fs.writeFileSync(fname, content);
  } catch (e) {
    log(e);
    process.exit();
  }
}

// main()
(function main(quotes) {
  const index = {};
  let wordlist;
  let q;

  for (const i in quotes) {
    if (Object.prototype.hasOwnProperty.call(quotes, i)) {
      q = quotes[i];
      wordlist = removeStop(words(q.quote));

      // get words from quote author
      q.author.toLowerCase().split(' ').map((word) => {
        wordlist.add(word);
      });

      for (const w of wordlist) {
        if (w in index) index[w].push(i);
        else index[w] = [i];
      }
    }
  }

  // Save file
  const fname = "./indexed-quotes.js";
  createFile(fname, `module.exports = ${JSON.stringify(index)}`);

  log(`Quotes indexed! '${fname}'`);
})(all_quotes);
