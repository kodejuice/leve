import {useState} from 'react'

import { site_details as details } from '../../site_config.js';

import indexed_quotes from '../../data/quotes/indexed-quotes.js';
import quotes from '../../data/quotes/quotes.js';


function getMatchingQuotes(kwords, selectQuotes) {
	let matches = [], // stores matching quotes
		seen = {};	// stores the count of keywords a quote with a certain id has

	kwords = kwords.split(/[^a-zA-Z0-9]/);
	if (!kwords.length) {
		return alert("Enter keywords!");
	}

	// go through keywords and get quotes with those words
	for (let k of kwords) {
		if (k in indexed_quotes) {
			// indexed_quotes[k] is an array of quote ids
			// these quote ids are indexes to quotes in the 'quoutes.js' file
			indexed_quotes[k].forEach(id => {
				if (!(id in seen)) {
					// we've not added this yet
					// add now
					matches.push([id, quotes[id]]);
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
	matches.sort((x,y)=>seen[y[0]] - seen[x[0]]);

	// updates view
	selectQuotes(
		matches.map(q=>q[1]).slice(0, 16)
	);
}



export default function QuoteSelect(props) {
	const {keywords, setQuote, selected} = props;

	// states
	const [kwords, setKeywords] = useState(keywords || "");
	const [quotes, selectQuotes] = useState([]);

	return (
		<>
			<div className="quote-select">
				<div className='form border-bottom pb-2 mb-3'>
					<form onSubmit={ev=>{ev.preventDefault(); getMatchingQuotes(kwords, selectQuotes)}}>
						<label htmlFor="Post keywords" style={{fontSize: "18px", display: "block"}}>Keywords</label>
						<div className="btn-group w-100">
							<input
								type="text"
								className="w-75 post-in"
								placeholder="Enter keywords to get matching quotes"
								title="Enter keywords to get matching quotes"
								value={kwords}
								style={{color: "#333", fontSize: "16px"}}
								onChange={v=>setKeywords(v.target.value)}
							/>
							<button className="btn btn-outline-primary" type="submit"> Get Quotes </button>
						</div>
					</form>
				</div>

				<div className="quotes">
					{quotes.map(q => (
						<blockquote onClick={_=>setQuote(q)} className="btn w-25 blockquote mt-4" style={q.quote==selected.quote?{border: "1px solid #333"}:{}}>
							<p className="mb-0 post-quote">{q.quote}.</p>
							<footer className="blockquote-footer p-quote text-right"><cite>{q.author}</cite></footer>
						</blockquote>
					))}
					<style>{`
						blockquote {
							display: inline-block;
						}
					`}</style>
				</div>
			</div>
		</>
	);
}


