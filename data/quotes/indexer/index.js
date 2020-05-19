#!/usr/bin/node

let fs = require('fs');
let quotes = require('../quotes');
let stopwords = require('./stopwords');

// convert stopwords array to a set
// for faster word check
stopwords = new Set(stopwords);

log = console.log;


// Get unique words from a string
const words = (string)=>{
	return new Set(
		string
			.split(/[^a-zA-Z]/) // split string by non alphabet characters
			.filter(w => w.length>1) // get non letters (.length > 1)
			.map(w => w.toLowerCase()) // convert word to lowercase
	);
};


// remove stopwords from array of words
const removeStop = (list)=>{
	let array = Array.from(list);
	return new Set(
		array.filter(word => !stopwords.has(word.toLowerCase()))
	);
}


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
(function main(quotes, stopwords){
	let index = {}, wordlist, q;

	for (i in quotes) {
		q = quotes[i];
		wordlist = removeStop(words(q.quote));

		for (w of wordlist) {
			if (w in index) index[w].push(i);
			else index[w] = [i];
		}
	}
	
	// Save file
	let fname = "../indexed-quotes.js";
	createFile(fname, `module.exports = ` + JSON.stringify(index));

	log("Quotes indexed! '" + fname + "'");

}(quotes, stopwords));





