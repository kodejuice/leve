import stopwords from "../data/quotes/indexer/stopwords";

let stop = new Set(stopwords);


/** Set site theme
 * @param       {String}        theme to switch to
 */
// set site theme
export function setTheme(which) {
    // 0=>light, 1=>dark
    which = Number(which);

    let list = document.querySelector("body").classList;

    if (which == 0) {
        if (list.contains('dark')) list.remove('dark'); // let there be light
    } else {
        if (!list.contains('dark')) list.add('dark'); // let there be darkness
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
    str = str.replace(/[^A-Z0-9_]+/gi, '-').toLowerCase();
    str = str.replace(/^[-]+|[-]+$/g, '');

    str = str.split('-')
        .filter(w => !stop.has(w)) // remove stopwords
        .join('-');

    return str;
}


/**
 * Get keywords from a large string
 * @param  {String}         String
 * @return {String}       keywords from string separated by ", "
 */
export function getKeywords(string, limit = true) {
    let freq = {};

    // remove https? links
    // (this may be buggy)
    string = string.replace(/(https?:\/\/[^)]+)/g, "");

    let words = new Set(
        string
        .split(/[^a-zA-Z]/)
        .filter(w => w.length > 1)
        .map(w => w.toLowerCase())
        .filter(w => !stop.has(w))
    );

    for (let word of words) {
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
 * Delete Post from DB
 * @param  {Object}          post slug
 * @return {Promise}         resolved data is request's response
 */
export async function deleteDBPost(slug, url) {
    const baseUrl = `${url}`;

    return new Promise(async (yes, no) => {
        const res = await fetch(`${baseUrl}/api/post/${slug}`, {
            method: "DELETE",
        });
        const data = await res.json()
        yes(data);
    })
}


/**
 * Add Post to DB / Modify Post in DB
 * @param  {Object}          post paramaeters
 * @return {Promise}         resolved data is request's response
 */
export async function addPostToDB(body, create = true, url) {
    const baseUrl = `${url}`;
    const { slug } = body;

    return new Promise(async (yes, no) => {
        const res = await fetch(`${baseUrl}/api/post/${slug}`, {
            method: create ? "PUT" : "POST", // PUT->create post, POST->update post
            body: JSON.stringify(body),
            headers: { 'Content-type': 'application/json' }
        });
        const data = await res.json()
        yes(data);
    })
}


/**
 * Modify post in DB
 * @param  {Object}          post paramaeters
 * @return {Promise}         resolved data is request's response
 */
export async function modifyPost(body, host) {
    const baseUrl = `${process.env.SCHEME}://${host}`;
    const { slug } = body;

    return new Promise(async (yes, no) => {
        const res = await fetch(`${baseUrl}/api/post/${slug}`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: { 'Content-type': 'application/json' }
        });
        const data = await res.json()
        yes(data);
    })
}


/**
 * Takes a string and returns the line count
 * @param  {String}          string to check
 * @return {String}          count of lines in string
 */
export function LineCount(str) {
    return (str || "").split('\n').length;
}

/**
 * Takes a string and returns the word count
 * @param  {String}          string to check
 * @return {String}          count of words in string
 */
export function WordCount(str) {
    str = str || "";
    return str.split(/[^a-zA-Z]/) // divide string by anything thats not an alphabet
        .filter(function(n) { return n != '' })
        .length;
}


/**
 * Take file size in bytes and converts to appropriate size
 *  in respective range
 * @param  {Number}   byte   file size in bytes
 * @return {String}          file size in GB|MG|KB|B
 */
export function bytesToSize(byte) {
    const gb = 1024 ** 3,
        mb = 1024 ** 2,
        kb = 1024 ** 1;
    if (byte >= gb) return `${~~(byte/gb)}GB`;
    if (byte >= mb) return `${~~(byte/mb)}MB`;
    if (byte >= kb) return `${~~(byte/kb)}KB`;
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
        top: top,
        left: 0,
        behavior: 'smooth'
    });
    setTimeout(cb, delay); // call cb() after delay-ms
}