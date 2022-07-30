import dice from "fast-dice-coefficient";

import { getPosts } from "../database/functions";

/**
 * Get all post from DB and select the ones that their slug best match `str`,
 *  using the Sørensen-Dice similarity coefficient
 *
 * @param  {string}    str   string to match
 * @return {Promise<Object[]>}        [description]
 */
export async function getBestMatch(str) {
  const data = await getPosts(["title", "slug", "excerpt"]);

  if (!data.length) return [];

  let posts = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const post of data) {
    posts.push({
      sdc: dice(str, post.slug),
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
    });
  }

  // sort in descending order of similarity,
  //  best match to least match
  posts.sort((x, y) => y.sdc - x.sdc);

  // select results with at least 30% match
  posts = posts.filter((x) => x.sdc > 0.3);

  return JSON.parse(
    JSON.stringify(
      posts.slice(0, 5) // the top 5 result
    )
  );
}
