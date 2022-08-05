import Link from "next/link";
import useSWR from "../../../utils/swr";

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
  const { data, isError } = useSWR("./projects.json");
  const loading = !data && !isError;
  const projects = data || [];

  if (isError) {
    return (
      <p>
        <em>Failed to load projects, refresh page</em>
      </p>
    );
  }

  return (
    <div>
      <div>
        {loading ? (
          <p className="pt-4"> Loading ... </p>
        ) : (
          <>
            {projects.map((v) => (
              <Item key={v.title} info={v} />
            ))}

            <p className="pt-4">
              <a
                href="https://github.com/kodejuice"
                title="kodejuice"
                target="_blank"
                rel="noreferrer"
              >
                More on Github
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
