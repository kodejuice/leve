import {Fragment} from 'react';
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'

const yearBorn  = 2000,
      monthBorn = 2 /*March*/,
      dayBorn   = 5;

function getAge() {
    const d = new Date(),
        currYear = d.getFullYear(),
        currMonth = d.getMonth(),
        currDay = d.getDate();

    const birthdayReached = Number(
        (currMonth > monthBorn)
        ||
        (currMonth == monthBorn && currDay >= dayBorn)
    );

    return (currYear - yearBorn - 1) + birthdayReached;
}

function birthdayToday() {
    const d = new Date(),
        currMonth = d.getMonth(),
        currDay = d.getDate();

    return (currMonth == monthBorn && currDay == dayBorn);
}



export default function About() {
    const { width, height } = useWindowSize()

    return (
        <div>
            <h2 className='section-title'> About Me </h2>

            {birthdayToday() && (
                <Fragment>
                    <Confetti
                        width={width}
                        height={height}
                    />
                    <p>I'm +1 today ☺ </p>
                </Fragment>
            )}

            <p>
                <span title={`${getAge()}yo`}>Hi, i'm Sochima.</span>
                <p> I'm a Software Engineer and a decorated problem solver. </p>
                <p>
                    I love solving problems (i once met Apollo in a dream, he was nice ☺), i also love coming up with new stuff.
                    I created this site specially for the purpose of documenting some of the stuff i've created || designed.
                    I'll as well write about some of the stuff that goes through my crooked mind.
                </p>
                <pre> {`{name: "Biereagu Sochima Everton"}`} </pre>
                <pre> {`{skill: "Google-fu", rank: "9dan"}`} </pre>
            </p>

        </div>
    );
}

