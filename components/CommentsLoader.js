/* eslint-disable react/no-danger */
import { useEffect } from "react";

const tenantId = "pMDzWlCsGYX";

// FastComment Initializer
export function LoadComments({ elementId }) {
  useEffect(() => {
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.innerHTML = `
function loadComments() {
  var randomNumber = ~~(Math.random()*1e6)
  var spinnerId = 'comments-spinner-'+randomNumber;

  var el = document.getElementById('${elementId}');
  if (!el) return;

  // add a spinner
  el.innerHTML = "<img class='comments-wait-spinner' id='"+spinnerId+"' src='icons/spinner.svg' alt='Loading comments...'/>";

  window.FastCommentsUI(el, {
    // "tenantId": "demo",
    "tenantId": "${tenantId}",
    absoluteAndRelativeDates: true,
    useShowCommentsToggle: true,
    onRender: function() {
      // remove spinner
      var spinner = document.getElementById(spinnerId);
      if (spinner) {
        el.removeChild(spinner);
      }
    }
  });
}

if (document.readyState === "complete") {
  loadComments();
} else {
  window.addEventListener('load', loadComments);
}
    `;
    document.body.appendChild(s);

    return () => {
      document.body.removeChild(s);
    };
  }, [elementId]);

  return null;
}

// load comment count
export function LoadCommentsCount({ elementId, urlId }) {
  useEffect(() => {
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.innerHTML = `
function getCommentsCount() {
  FastCommentsCommentCount(document.getElementById('${elementId}'), {
    tenantId: "${tenantId}",
    urlId: "${urlId}"
  });
}

if (document.readyState === "complete") {
  getCommentsCount();
} else {
  window.addEventListener('load', getCommentsCount);
}
`;
    document.body.appendChild(s);

    return () => {
      document.body.removeChild(s);
    };
  }, [elementId, urlId]);

  return null;
}
