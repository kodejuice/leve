import { site_details as details } from "../../site_config";

export default function HomeHead(props) {
  const { scheme, host } = props;
  const page_url = `${scheme}://${host}/`;

  return (
    <>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="description" content={details.description} />

      {/*<!-- Facebook Meta Tags -->*/}
      <meta property="og:type" content="website" />
      <meta property="og:image" content={`${scheme}://${host}/sb.png`} />
      <meta property="og:title" content={details.name} />
      <meta property="og:url" content={page_url} />
      <meta property="og:description" content={details.description} />
      <meta property="og:site_name" content="Sochima Biereagu" />

      {/*<!-- Twitter Meta Tags -->*/}
      <meta name="twitter:creator" content="@kodejuice" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content={host} />
      <meta property="twitter:url" content={page_url} />
    </>
  );
}
