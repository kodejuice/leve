import {useState, useEffect, Fragment} from 'react';
import Link from 'next/link'


function Item(props) {
    const {title, excerpt, href} = props.info;

    return (
        <div className='mt-3'>
            <Link href={href} as={href}>
                <a className='post-title' rel="noreferrer" target={"_blank"}> {title} </a>
            </Link>
            <div className='post-excerpt ml-3'> {excerpt} </div>
        </div>
    );
}


export default function Projects() {

    const [projects, setProjects] = useState(null);

    useEffect(()=>{
        async function fetchData() {
            const req = await fetch("/favorites.json");
            const data = await req.json();

            if (Array.isArray(data)) {
                setProjects(data);
            }
        }
        fetchData();
    }, []);

    return (
        <div>
            <h2 className='section-title'> Software Projects </h2>
            <em>some of my favorite projects</em>

            <div>{projects && (
                <Fragment>
                    { projects.map(v => <Item key={v.title} info={v} />) }

                    <p className="pt-4"> More on <a href="https://github.com/kodejuice" title="Kodejuice">Github</a> </p>
                </Fragment>
            ) || <p className="pt-4"> Loading ... </p>}</div>

        </div>
    );
}
