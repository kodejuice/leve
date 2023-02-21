/* eslint-disable react/no-danger */

const tenantId = "pMDzWlCsGYX";

// FastComment Initializer
export function LoadComments({ elementId }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
function loadComments() {
  var randomNumber = ~~(Math.random()*1e6)
  var spinnerId = 'comments-spinner-'+randomNumber;

  var el = document.getElementById('${elementId}');
  if (!el) return;

  // add a spinner
  el.innerHTML = "<img id='"+spinnerId+"' src='icons/spinner.svg' alt='Loading comments...'/>";

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
`,
      }}
    />
  );
}

// load comment count
export function LoadCommentsCount({ elementId, urlId }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
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
`,
      }}
    />
  );
}
