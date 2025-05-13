/* eslint-disable react/no-unescaped-entities */
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
    currMonth > monthBorn || (currMonth === monthBorn && currDay >= dayBorn)
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

export default function About() {
  const { width, height } = useWindowSize();

  return (
    <div>
      <h2 className="section-title"> About Me </h2>

      {birthdayToday() && (
        <>
          <Confetti width={width} height={height} />
          <p title={`${getAge()}yo`}>I&apos;m +1 today ☺ </p>
        </>
      )}

      <div>
        <span title={`${getAge()}yo`}>Hello, my name is Sochima</span>
        <div>
          I&apos;m a King and a Priest of the{" "}
          <span title="YHWH">Most High God, </span>
        </div>
        <div>
          a Scientist in pursuit of truth, an Engineer in service of creation,
          and a Priest in devotion to the eternal, forging words at the frontier
          of spirit and reason.
        </div>
        <p>
          I build technology, craft ideas, and solve complex problems with
          creative precision.
        </p>
        <p className="mt-2">
          I hold a <span title="ND">diploma</span> in Electrical Engineering
          from Yaba College of Technology, and I am currently pursuing a B.Sc in
          Computer Science at Oregon State University.
        </p>
        <p>
          An avid learner and explorer, I am always seeking new ways to expand
          my knowledge, deepen my understanding, and create solutions that make
          a meaningful difference.
        </p>
        <p>
          In my free time, I enjoy dreaming up new ideas, building projects, and
          sharing insights that bridge technology, faith, and human experience.
        </p>
        <p>Thank you for visiting this small corner of my world.</p>
      </div>

      <div className="crypto-info">
        <p className="mb-0">Buy me a coffee ☕</p>
        {cryptoInfo.map(([coin, address]) => (
          <div key={coin} title={coin.toUpperCase()} className="row mb-2 mt-2">
            <div className="col-3 img-col">
              <img
                alt={coin}
                width={24}
                height={24}
                className="coin-img"
                src={`/icons/${coin}.png`}
              />
            </div>
            <CopyToClipboard text={address}>
              <span className="crypto-address col-9">{address}</span>
            </CopyToClipboard>
          </div>
        ))}
        <div title="Patreon" className="row mb-2 mt-2">
          <div className="col-3 img-col">
            <img
              alt="patreon"
              width={24}
              height={24}
              className="coin-img"
              src="/icons/patreon.png"
            />
          </div>
          <span className="support-link col-9">
            <a
              href="https://patreon.com/sochima_b"
              target="_blank"
              rel="noreferrer"
            >
              Patreon
            </a>
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h3>
          <b>Projects</b>
        </h3>
        <p>As a craftsman here are some of the projects I&apos;ve worked on</p>

        <Projects />
      </div>
    </div>
  );
}
