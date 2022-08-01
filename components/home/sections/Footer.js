import Link from "next/link";

export default function Footer({ current }) {
  const [home, about, readings] = [
    current === "home",
    current === "about",
    current === "readings",
  ];

  const active = (v) => (v ? "active" : "");

  const About_home = (
    <a title="Home" className={active(home)}>
      Home
    </a>
  );

  const About_a = (
    <a title="About Me" className={active(about)}>
      About
    </a>
  );

  const About_readings = (
    <a title="My readings" className={active(readings)}>
      Readings
    </a>
  );

  return (
    <>
      <div className="f-nav mt-5">
        <div className="f-link about pr-3">
          {home ? About_home : <Link href="/">{About_home}</Link>}
        </div>

        <div className="f-link about pr-3">
          {about ? About_a : <Link href="/about">{About_a}</Link>}
        </div>

        <div className="f-link projects">
          {readings ? (
            About_readings
          ) : (
            <Link href="/readings">{About_readings}</Link>
          )}
        </div>
      </div>

      <div
        className="mt-4 pl-0 ml-0"
        title="Get an email whenever theres new content"
      >
        <a href="https://lb.benchmarkemail.com//listbuilder/signupnew?UOpPXfYpHY5FgmNYouPUxP5pwVnAjsSIHDOR9QrPhDftO5iNRn8gS049TyW7spdJ">
          {" "}
          <b> Subscribe to newsletter ! </b>{" "}
        </a>
      </div>
    </>
  );
}
