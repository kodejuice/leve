import { site_details as details } from "../../site_config";

export default function HomeHead(props) {
  const { scheme, host } = props;
  const page_url = `${scheme}://${host}/`;
  const og_image_url = `${scheme}://${host}/og-image.png`;
  const page_title = `${details.name} | Computer Science, Information Theory & Engineering`;
  const page_description =
    "Engineer and research scientist turning first-principles discovery into real-world technology. Essays, research notes, projects, and reading logs.";

  return (
    <>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="description" content={page_description} />

      {/*<!-- Open Graph / Facebook Meta Tags -->*/}
      <meta property="og:type" content="website" />
      <meta property="og:image" content={og_image_url} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:alt" content={page_title} />
      <meta property="og:title" content={page_title} />
      <meta property="og:url" content={page_url} />
      <meta property="og:description" content={page_description} />
      <meta property="og:site_name" content={details.name} />

      {/*<!-- Twitter Meta Tags -->*/}
      <meta name="twitter:creator" content={`@${details.handle.twitter}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content={host} />
      <meta property="twitter:url" content={page_url} />
      <meta name="twitter:title" content={page_title} />
      <meta name="twitter:description" content={page_description} />
      <meta name="twitter:image" content={og_image_url} />
    </>
  );
}
