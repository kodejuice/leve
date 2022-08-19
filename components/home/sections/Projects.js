import Link from "next/link";
import useSWR from "../../../utils/swr";

function Item(props) {
  const { title, excerpt, href } = props.info;
  const { isPaper } = props;

  return (
    <div className="mb-2">
      {isPaper && (
        <img
          src="icons/pdf.png"
          alt="📰️"
          width="22"
          height="22"
          className="mr-2"
        />
      )}
      <Link href={href} as={href}>
        <a className="post-title" rel="noreferrer" target="_blank">
          {title}
        </a>
      </Link>
      <div className="post-excerpt ml-3"> {excerpt} </div>
    </div>
  );
}

function ListProjects({ type, projects, brief, paper }) {
  if (!projects?.length) return null;

  return (
    <div className="mb-4">
      <span className="project-title">{type}</span>
      {brief && <em className="small">{brief}</em>}
      <div className="mt-1">
        {projects.map((v) => (
          <Item key={v.title} info={v} isPaper={paper} />
        ))}
      </div>
    </div>
  );
}

export default function Projects() {
  const { data, isError } = useSWR("./projects.json");
  const loading = !data && !isError;
  const works = data || {};

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
            <ListProjects type="Papers" projects={works.papers} paper />
            <ListProjects
              type="Posts"
              projects={works.posts}
              brief="Blog posts featuring a notable project"
            />
            <ListProjects type="Software" projects={works.projects} />
            <p className="">
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
