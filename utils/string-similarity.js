import fetch from 'node-fetch'
import dice from 'fast-dice-coefficient'

import {getPosts} from './fetch-post';


// TODO: implement improved algorithm


/**
 * Get all post from DB and select the ones that their slug best match `str`,
 *  using the Sørensen-Dice similarity coefficient
 * 
 * @param  {string}    str   string to match
 * @return {Object[]}        [description]
 */
export async function getBestMatch(str, mongo_uri){
    const data = await getPosts(['title', 'slug', 'excerpt'], mongo_uri);

    if (!data.length)
        return [];

    let posts = [];
    for (let post of data) {
        posts.push({
            sdc: dice(str, post.slug),
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
        });
    }

    // sort in descending order of similarity,
    //  best match to least match
    posts.sort((x,y) => y.sdc - x.sdc);

    // select results with at least 30% match
    posts = posts.filter(x => x.sdc > 0.3);

    return posts.slice(0, 5); // the top 5 result
}

