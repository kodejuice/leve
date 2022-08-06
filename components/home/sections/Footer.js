import Link from "next/link";

function LinkEl({ href, children, ...props }) {
  if (href === "#") {
    return (
      <a href="#" className="active" {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}

export default function Footer({ current }) {
  const [home, about, readings] = [
    current === "home",
    current === "about",
    current === "readings",
  ];

  // const active = (v) => (v ? "active" : "");

  return (
    <>
      <div className="f-nav mt-5">
        <div className="f-link about pr-3">
          <LinkEl href={home ? "#" : "/"}>Home</LinkEl>
        </div>

        <div className="f-link about pr-3">
          <LinkEl href={about ? "#" : "/about"}>About</LinkEl>
        </div>

        <div className="f-link projects">
          <LinkEl href={readings ? "#" : "/readings"}>Readings</LinkEl>
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
