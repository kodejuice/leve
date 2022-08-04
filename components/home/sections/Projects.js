import { useState, useEffect, Fragment } from "react";
import Link from "next/link";

function Item(props) {
  const { title, excerpt, href } = props.info;

  return (
    <div className="mt-3">
      <Link href={href} as={href}>
        <a className="post-title" rel="noreferrer" target="_blank">
          {title}
        </a>
      </Link>
      <div className="post-excerpt ml-3"> {excerpt} </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const req = await fetch("/projects.json");
      const data = await req.json();

      if (Array.isArray(data)) {
        setProjects(data);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <div>
        {(projects && (
          <>
            {projects.map((v) => (
              <Item key={v.title} info={v} />
            ))}

            <p className="pt-4">
              <a
                href="https://github.com/kodejuice"
                title="Kodejuice"
                target="_blank"
                rel="noreferrer"
              >
                More on Github
              </a>
            </p>
          </>
        )) || <p className="pt-4"> Loading ... </p>}
      </div>
    </div>
  );
}
