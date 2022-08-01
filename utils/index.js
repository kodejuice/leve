/* eslint-disable no-bitwise */
/* eslint-disable no-restricted-syntax */
import stopwords from "../data/quotes/indexer/stopwords";

const stop = new Set(stopwords);

/**
 * Set site theme
 * @param {String} state state we need should switch to
 */
export function setTheme(state) {
  // 0=>light, 1=>dark
  state = Number(state);

  const list = document.querySelector("body").classList;

  if (state) {
    if (!list.contains("dark")) list.add("dark"); // and darkness was upon the face of the deep
  } else if (list.contains("dark")) {
    list.remove("dark"); // let there be light
    list.add("body");
  }
}

/**
 * Convert a string to a slug
 * replaces non alphabetic characters with '-'
 * and removes stopwords
 * @param       {String}        string to process
 * @return  {String}        slug
 */
export function toSlug(str) {
  str = str.replace(/[^A-Z0-9_]+/gi, "-").toLowerCase();
  str = str.replace(/^[-]+|[-]+$/g, "");

  str = str
    .split("-")
    .filter((w) => !stop.has(w)) // remove stopwords
    .join("-");

  return str;
}

/**
 * Get keywords from a large string
 * @param  {String}         String
 * @return {String}       keywords from string separated by ", "
 */
export function getKeywords(string, limit = true) {
  const freq = {};

  // remove https? links
  // (this may be buggy)
  string = string.replace(/(https?:\/\/[^)]+)/g, "");

  let words = new Set(
    string
      .split(/[^a-zA-Z]/)
      .filter((w) => w.length > 1)
      .map((w) => w.toLowerCase())
      .filter((w) => !stop.has(w))
  );

  for (const word of words) {
    if (word in freq) freq[word] += 1;
    else freq[word] = 1;
  }

  // convert Set to Array
  words = Array.from(words);

  // sort words in descending order of their frequency
  words.sort((x, y) => freq[y] - freq[x]);

  return (limit ? words.slice(0, 10) : words).join(", ");
}

/**
 * Takes a string and returns the line count
 * @param  {String}          string to check
 * @return {String}          count of lines in string
 */
export function LineCount(str) {
  return (str || "").split("\n").length;
}

/**
 * Takes a string and returns the word count
 * @param  {String}          string to check
 * @return {String}          count of words in string
 */
export function WordCount(str) {
  str = str || "";
  return str
    .split(/[^a-zA-Z]/) // divide string by anything thats not an alphabet
    .filter((n) => n !== "").length;
}

/**
 * Take file size in bytes and converts to appropriate size
 *  in respective range
 * @param  {Number}   byte   file size in bytes
 * @return {String}          file size in GB|MG|KB|B
 */
export function bytesToSize(byte) {
  const gb = 1024 ** 3;
  const mb = 1024 ** 2;
  const kb = 1024 ** 1;
  if (byte >= gb) return `${~~(byte / gb)}GB`;
  if (byte >= mb) return `${~~(byte / mb)}MB`;
  if (byte >= kb) return `${~~(byte / kb)}KB`;
  return `${byte}B`;
}

/**
 * scroll to top
 * @param  {Function} cb    callback function, called after delay ms
 * @param  {Number}   delay milliseonds to invoke cb
 * @param  {Number}   top   top position
 * @return {undefined}         [void]
 */
export const scrollToTop = (cb, delay = 300, top = 0) => {
  window.scroll({
    top,
    left: 0,
    behavior: "smooth",
  });

  if (cb) {
    setTimeout(cb, delay); // call cb() after delay-ms
  }
};
