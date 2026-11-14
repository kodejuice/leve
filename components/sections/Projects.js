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

function VentureCard({ item }) {
  const { title, excerpt, href, badge } = item;

  return (
    <article className="academic-card venture-card">
      <div className="card-meta">
        <span className="badge-venture">{badge || "Commercial Venture"}</span>
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
          Visit Platform &rarr;
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
  const ventures = works.ventures || [];

  return (
    <div className="projects-showcase">
      {papers.length > 0 && (
        <section className="works-category">
          <div className="category-header">
            <h3 className="category-title">Research Papers</h3>
            <span className="category-subtitle">
              Preprints, mathematical foundations, and computing systems
            </span>
          </div>
          <div className="cards-grid">
            {papers.map((p) => (
              <PaperCard key={p.title} item={p} />
            ))}
          </div>
          <div className="more-publications-row">
            <a
              href="https://scholar.google.com/citations?user=6mI5FV0AAAAJ&hl=en"
              target="_blank"
              rel="noreferrer"
              className="scholar-profile-link"
            >
              View all papers on Google Scholar &rarr;
            </a>
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
              Computational systems, algorithmic architectures, and open-source
              tooling
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

      {ventures.length > 0 && (
        <section className="works-category mt-5">
          <div className="category-header">
            <h3 className="category-title">Ventures &amp; Applied Products</h3>
            <span className="category-subtitle">
              Production software and applied consumer platforms
            </span>
          </div>
          <div className="cards-grid">
            {ventures.map((v) => (
              <VentureCard key={v.title} item={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
