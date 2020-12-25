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
                I love solving problems and coming up with new stuff, i once met the god of problem solving in a dream (he was nice ☺).
            </p>

        </div>
    );
}
