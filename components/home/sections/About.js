/* eslint-disable react/no-unescaped-entities */
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { site_details as details } from "../../../site_config";

import Projects from "./Projects";

const yearBorn = details.dob.year;
const monthBorn = details.dob.month - 1; /*March*/
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

export default function About() {
  const { width, height } = useWindowSize();

  return (
    <div>
      <h2 className="section-title"> About Me </h2>

      {birthdayToday() && (
        <>
          <Confetti width={width} height={height} />
          <p>I&apos;m +1 today ☺ </p>
        </>
      )}

      <div>
        <span title={`${getAge()}yo`}>Hello, my name is Sochima.</span>
        <div>
          I&apos;m a King and a Priest of the{" "}
          <span title="YHWH">Most High God</span>.
        </div>
        <div title="a craftsman"> I work as a Software Engineer. </div>
        <div title="😉️"> I&apos;m also an expert Googler. </div>
        <p className="mt-2">
          I enjoy problem solving as well as coming up with new ideas. I made
          this site specifically to write about some of the things I've created
          or come up with. I'll also write about some of the things that come to
          my mind.
        </p>
        <p>
          I have a <span title="ND">diploma</span> in Electrical Engineering
          from Yaba College of Technology and am currently enrolled at Oregon
          State University for a B.Sc in Computer Science.
        </p>
      </div>

      <div>
        <h3>
          <b>Projects</b>
        </h3>
        <p>As a craftsman here are some of the projects I&apos;ve worked on</p>

        <Projects />
      </div>
    </div>
  );
}
