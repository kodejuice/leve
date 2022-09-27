export default function GoBack({ title }) {
  return (
    <a
      href="/"
      className="btn btn-link"
      onClick={(ev) => {
        ev.preventDefault();
        history.go(-1);
      }}
    >
      <span className="glyphicon glyphicon-chevron-left" /> {title || null}
    </a>
  );
}
