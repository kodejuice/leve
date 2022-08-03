import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { site_details as details } from "../../../site_config";

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
        <span title={`${getAge()}yo`}>Hi, i&apos;m Sochima.</span>
        <p> I&apos;m a Software Engineer. </p>
        <p>
          I love solving problems, i also love coming up with new stuff. I
          created this site specially for the purpose of writting about some of
          the stuffs i&apos;ve created / some up with. I&apos;ll as well write
          about some of the stuff that goes through my mind.
        </p>
        <pre> {`{name: "Biereagu Sochima Everton"}`} </pre>
        <pre> {`{skill: "Google-fu", rank: "9dan"}`} </pre>
      </div>
    </div>
  );
}
