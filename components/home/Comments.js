import { DiscussionEmbed } from "disqus-react";
import { site_details } from "../../site_config";

function Comments(title, identifier) {
  if (typeof window === "undefined") return null;

  const disqusShortname = site_details.name;

  const disqusConfig = {
    url: location.href,
    identifier,
    title,
  };

  return (
    <div>
      <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
    </div>
  );
}

export default Comments;
