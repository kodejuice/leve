export default function GoBack({ title }) {
  return (
    <a
      href="/"
      className="btn btn-link"
      onClick={(ev) => {
        ev.preventDefault();
        if (history.length === 1 || !document.referrer) {
          const home = "/";
          history.replaceState(null, null, home);
          location.href = home;
        } else {
          history.go(-1);
        }
      }}
    >
      <span className="glyphicon glyphicon-chevron-left" /> {title || null}
    </a>
  );
}
