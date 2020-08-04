import { readFileSync } from 'fs'
import _ from 'underscore'
import fetch from 'node-fetch'

import { IncomingForm } from 'formidable'

import connectDB from '../../../backend/database/connection.js';
import { bytesToSize } from '../../../utils';

const handlers = {};
const handle = (method, fn) => handlers[method.toUpperCase()] = fn;


export const config = {
    api: {
        bodyParser: false,
    },
};

/** Import data into site via JSON / Export site data as json **/



// export
function Export(req, res, Article) {
    return new Promise(resolve => {
        let size_only = req.query.size_only == 'true';
        let db_query = Article
            .find()
            .exec();

        db_query.then(posts => {
                const str = JSON.stringify(posts);

                if (size_only) {
                    // report size data file size
                    res.json({ size: bytesToSize(str.length) });
                } else {
                    // send site data as attachment
                    res.setHeader('Content-disposition', 'attachment; filename=site_data.json');
                    res.setHeader('Content-type', 'text/plain');
                    res.send(str);
                }
                resolve();
            })
            .catch(err => {
                res.json({ size: null, err: "Failed to fetch data" });
                resolve();
            });
    });
}



// import
function Import(req, res, Article) {
    return new Promise(async resolve => {
        const cnt = req.body;

        const data = await new Promise(function(resolve, reject) {
            const form = new IncomingForm();

            form.parse(req, function(err, fields, files) {
                if (err) return reject(err);
                resolve({ fields, files });
            });
        });

        let { path } = data.files.data, content;

        // json file uploaded
        // read file from the folder its uploaded to
        try {
            content = readFileSync(path);
        } catch (e) {
            res.send("Error: " + e);
            return resolve();
        }

        // Parse JSON
        let json;
        try {
            json = JSON.parse(content);
            if (!_.isArray(json)) throw "JSON object not iterable";
        } catch (e) {
            res.json("Invalid JSON: (" + e + ")");
            return resolve();
        }

        let responses = [],
            response, added_count = 0;

        // insert posts into DB
        let required_fields = ['author', 'author_email', 'title', 'content', 'pub_date', 'slug'];
        for (var post of json) {
            // make sure its a post
            if (required_fields.every(k => k in post)) {
                // this post has all the required fields
                // add it to DB
                response = await addPostToDB(req, post);

                if (response.success == true)
                    added_count += 1;

                responses.push(post.slug + ' -> ' + JSON.stringify(response));
            }
        }

        if (responses.length == 0) {
            res.send("JSON object doesn't match the required Schema!");
            return resolve();
        }

        // bubble successful inserts to the top
        responses.sort((a, _) => a.success == true ? -1 : 1);

        let res_string = `Added ${added_count} posts\n` + (('_').repeat(56)) + '\n\n';
        res.json(res_string + responses.join('\n\n'));
        resolve();
    });
}


// adds post to DB
// takes the post object and makes PUT request
// to the '/api/post/[post_id]' endpoint
async function addPostToDB(req, post) {
    const baseUrl = `${process.env.SCHEME}://${req.headers.host}`;
    const { slug } = post; // post_id

    return new Promise(async (yes, no) => {
        const res = await fetch(`${baseUrl}/api/post/${slug}`, {
            method: "PUT",
            body: JSON.stringify(post),
            headers: {
                'Content-type': 'application/json',
                cookie: req.headers.cookie
            }
        });
        const data = await res.json()
        yes(data);
    })
}



/////////////////
// GET exports //
/////////////////
handle('get', async (req, res, { Article }) => {
    return Export(req, res, Article);
});


//////////////////
// POST imports //
//////////////////
handle('post', async (req, res, { Article }) => {
    return Import(req, res, Article);
});



export default connectDB((req, res, DB_Models) => {
    let method = req.method;

    if (!(req.isAuthenticated && method in handlers))
        return res.json({ msg: "You can't do that" });

    return handlers[method](req, res, DB_Models);
});