import MarkdownIt from "markdown-it";
import tm from "markdown-it-texmath";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { memoize } from "lodash";

const katex = require("katex");

// Initialize a markdown parser
const mdParser = new MarkdownIt({
  html: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(lang, str, true).value
        }</code></pre>`;
      } catch (__) {
        return `<pre><code>${mdParser.utils.escapeHtml(str)}</code></pre>`;
      }
    }
    return `<pre class="hljs"><code>${mdParser.utils.escapeHtml(
      str
    )}</code></pre>`;
  },
});

// MarkdownIt plugin
//  for math text processing
mdParser.use(tm, {
  engine: katex,
  delimiters: "dollars",
  katexOptions: { macros: { "\\RR": "\\mathbb{R}" } },
});

mdParser.render = memoize(mdParser.render);

export default mdParser;
