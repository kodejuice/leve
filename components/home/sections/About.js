import {Fragment} from 'react';
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'

const yearBorn  = 2000,
      monthBorn = 2 /*March*/,
      dayBorn   = 5;


function birthdayToday() {
    const d = new Date(),
        currMonth = d.getMonth(),
        currDay = d.getDate();

    return (currMonth == monthBorn && currDay == dayBorn);
}


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
                    <p>Today is my birthday ☺ </p>
                </Fragment>
            )}

            <p>
                Hi, my name is Sochima Biereagu, i'm {getAge()}yrs old and i'm a <b>Software Engineer</b>. I ...
                <br/>
                <b> TODO: complete this </b>
                
            </p>

        </div>
    );
}
