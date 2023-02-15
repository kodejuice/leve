/* eslint-disable func-names */
import MarkdownIt from "markdown-it";
import tm from "markdown-it-texmath";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { memoize } from "lodash";
import { escapeHtml } from "markdown-it/lib/common/utils";

const katex = require("katex");

// Initialize a markdown parser
const mdParser = new MarkdownIt({
  html: true,
  breaks: true,
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

// table styling
mdParser.renderer.rules.table_open = function () {
  return '<div class="table-wrapper"><table class="table" style="width: auto;">';
};
mdParser.renderer.rules.table_close = function () {
  return "</table></div>";
};

// inline blocks
mdParser.renderer.rules.code_inline = function (
  tokens,
  idx
  // options,
  // env,
  // slf
) {
  const token = tokens[idx];
  // return `<code${slf.renderAttrs(token)}>${escapeHtml(token.content)}</code>`;
  return `<code class="inline">${escapeHtml(token.content)}</code>`;
};

mdParser.render = memoize(mdParser.render);

export default mdParser;
