export default function GoBack({ title }) {
  return (
    <a
      href="/"
      className="back-link"
      onClick={(ev) => {
        ev.preventDefault();
        if (
          typeof window !== "undefined" &&
          (history.length === 1 || !document.referrer)
        ) {
          const home = "/";
          history.replaceState(null, null, home);
          location.href = home;
        } else if (typeof window !== "undefined") {
          history.go(-1);
        }
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ marginRight: "6px" }}
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      <span>{title || "Back"}</span>
    </a>
  );
}
