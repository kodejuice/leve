import { useState } from "react";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { site_details as details } from "../../site_config";
import Projects from "./Projects";

const yearBorn = details.dob.year;
const monthBorn = details.dob.month - 1;
const dayBorn = details.dob.day;

function getAge() {
  const d = new Date();
  const currYear = d.getFullYear();
  const currMonth = d.getMonth();
  const currDay = d.getDate();

  const birthdayReached = Number(
    currMonth > monthBorn || (currMonth === monthBorn && currDay >= dayBorn),
  );

  return currYear - yearBorn - 1 + birthdayReached;
}

function birthdayToday() {
  const d = new Date();
  const currMonth = d.getMonth();
  const currDay = d.getDate();

  return currMonth === monthBorn && currDay === dayBorn;
}

const cryptoInfo = Object.entries(details.crypto);

function CryptoRow({ coin, address }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="crypto-row">
      <div className="crypto-asset">
        <span className="crypto-symbol">{coin.toUpperCase()}</span>
      </div>
      <code className="crypto-addr" title={address}>
        {address}
      </code>
      <CopyToClipboard text={address} onCopy={handleCopy}>
        <button
          type="button"
          className="copy-btn"
          aria-label={`Copy ${coin} address`}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </CopyToClipboard>
    </div>
  );
}

export default function About() {
  const { width, height } = useWindowSize();
  const isBirthday = birthdayToday();
  const age = getAge();

  return (
    <div className="about-page-container">
      {isBirthday && (
        <div className="birthday-banner">
          <Confetti width={width} height={height} recycle={true} />
          <p className="birthday-note">
            Giving thanks for another year — I'm +1 today 😊
          </p>
        </div>
      )}

      {/* Manifest & Bio */}
      <section className="about-bio-section">
        <h1 className="about-heading">About Me</h1>

        <blockquote className="vocation-quote">
          <p className="quote-line primary">
            &ldquo;A King and a Priest of the Most High God —
          </p>
          <p className="quote-line secondary">
            a Scientist in pursuit of truth, an Engineer in service of creation,
            and a Priest in devotion to the eternal.&rdquo;
          </p>
        </blockquote>

        <div className="bio-body-text">
          <p className="lead-paragraph">
            Hello, my name is <strong>Sochima</strong>. I build technology, and
            architect foundational solutions bringing{" "}
            <strong>light and order</strong> to hard problems through with
            heavenly inspiration and precision.
          </p>
          <p>
            I hold a National Diploma in Electrical Engineering from{" "}
            <strong>Yaba College of Technology</strong>, and I am currently
            pursuing a B.Sc in Computer Science at{" "}
            <strong>Oregon State University</strong>. My trajectory is fueled by
            a constant drive to deepen my understanding of mathematical
            abstractions, physical limits, and scalable systems.
          </p>
          <p>
            Beyond formal study, my work is dedicated to pursuing truth,
            pioneering new technologies, and sharing insights that bring light
            to both technology and faith.
          </p>
        </div>
      </section>

      {/* Publications & Systems */}
      <section className="about-works-section mt-5">
        <Projects />
      </section>

      {/* Support / Patronage */}
      <section className="about-support-section mt-5">
        <div className="support-card">
          <div className="support-header">
            <h3 className="support-title">Private Notes &amp; Patronage</h3>
            {/* <p className="support-desc">
              Patreon members receive private research dispatches, working
              notes, and early ideas not published on the open web. You can also
              buy me a coffee or send a one-off tip via crypto below.
            </p> */}
          </div>

          <div className="patreon-support-box">
            <div className="patreon-info">
              <span className="patreon-name">Patreon Membership</span>
              <span className="patreon-meta">
                Exclusive behind-the-scenes research &amp; private essays
              </span>
            </div>
            <a
              href="https://patreon.com/sochima_b"
              target="_blank"
              rel="noreferrer"
              className="patreon-btn"
            >
              Join on Patreon &rarr;
            </a>
          </div>

          <div className="coffee-section">
            <span className="coffee-label">
              Buy me a coffee / tip (Crypto):
            </span>
            <div className="crypto-addresses-list">
              {cryptoInfo.map(([coin, address]) => (
                <CryptoRow key={coin} coin={coin} address={address} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
