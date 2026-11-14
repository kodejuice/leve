import staticProjects from "../../public/projects.json";
import useSWR from "../../utils/swr";

function PaperCard({ item }) {
  const { title, excerpt, href } = item;
  // Extract arXiv ID if present in href
  const arxivMatch = href.match(/abs\/([0-9.]+)/);
  const arxivId = arxivMatch ? arxivMatch[1] : null;

  return (
    <article className="academic-card paper-card">
      <div className="card-meta">
        <span className="badge-academic">arXiv Preprint</span>
        {arxivId && <span className="arxiv-id">arXiv:{arxivId} [cs.IT]</span>}
      </div>
      <h4 className="card-title">
        <a href={href} target="_blank" rel="noreferrer">
          {title}
        </a>
      </h4>
      <p className="card-excerpt">{excerpt}</p>
      <div className="card-action">
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="external-link-btn"
        >
          View on arXiv &rarr;
        </a>
      </div>
    </article>
  );
}

function ProjectCard({ item }) {
  const { title, excerpt, href } = item;

  return (
    <article className="academic-card project-card">
      <div className="card-meta">
        <span className="badge-system">Software &amp; Algorithms</span>
      </div>
      <h4 className="card-title">
        <a href={href} target="_blank" rel="noreferrer">
          {title}
        </a>
      </h4>
      <p className="card-excerpt">{excerpt}</p>
      <div className="card-action">
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="external-link-btn"
        >
          Source Code on GitHub &rarr;
        </a>
      </div>
    </article>
  );
}

export default function Projects() {
  const { data } = useSWR("/projects.json");
  const works = data || staticProjects;

  const papers = works.papers || [];
  const projects = works.projects || [];

  return (
    <div className="projects-showcase">
      {papers.length > 0 && (
        <section className="works-category">
          <div className="category-header">
            <h3 className="category-title">Research Papers</h3>
            <span className="category-subtitle">
              Preprints, mathematical foundations, and computational theory
            </span>
          </div>
          <div className="cards-grid">
            {papers.map((p) => (
              <PaperCard key={p.title} item={p} />
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="works-category mt-5">
          <div className="category-header">
            <h3 className="category-title">
              Systems &amp; Algorithmic Engines
            </h3>
            <span className="category-subtitle">
              Compressors, AI engines, search, and emulation
            </span>
          </div>
          <div className="cards-grid">
            {projects.map((p) => (
              <ProjectCard key={p.title} item={p} />
            ))}
          </div>
          <div className="more-github-row">
            <a
              href="https://github.com/kodejuice"
              target="_blank"
              rel="noreferrer"
              className="github-profile-link"
            >
              View additional repositories &amp; open source on GitHub &rarr;
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
