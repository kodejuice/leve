import _ from 'underscore'
import { parseCookies, setCookie, destroyCookie } from 'nookies'

import connectDB from '../../../backend/database/connection.js';

const handlers = {};
const handle = (method, fn) => handlers[method.toUpperCase()] = fn;



/* handle API calls to manage posts, create/update/delete */


// get post content
handle('get', (req, res, slug /*post_id*/ , { Article }) => {
    let db_query = Article
        .findOne({ 'slug': slug })
        .exec();

    let cookies = parseCookies({ req });

    return new Promise(resolve => {
        db_query.then(async post => {
                if (!post) return res.json({ error: true, msg: "Not found" }), resolve();

                // update 'views' count
                if (!(post.slug in cookies)) {
                    post.views += 1;
                    setCookie({ res }, post.slug, '1', {
                        path: '/',
                        maxAge: 86400 * 31 // 31 days
                    });
                    post.save();
                }

                let fields = ("author author_email title content post_quote pub_date last_modified next_post slug draft excerpt " + (req.query.include || "")).split(" ");
                post = _.pick(post, fields);

                // get "next post >>" suggestion
                try {
                    let nxt_doc = await Article.findOne({ 'pub_date': { $gt: post.pub_date }, 'draft': false })

                    if (!nxt_doc)
                        nxt_doc = (await Article.find({ 'pub_date': { $lt: post.pub_date }, 'draft': false }).sort({ pub_date: 'asc' }))[0];

                    if (nxt_doc) {
                        post.next_post = {
                            slug: nxt_doc.slug,
                            title: nxt_doc.title
                        };
                    }
                } catch (e) {
                    console.log(e);
                }
                // ...

                if (post.draft == true && !req.isAuthenticated) {
                    return res.json({ error: true, msg: "Not found" }), resolve();
                }
                return res.json(post), resolve();
            })
            .catch(err => {
                return res.json({ error: true, msg: err }), resolve();
            });
    });
});


// create new post
handle('put', (req, res, post_id, { Article }) => {
    return new Promise(resolve => {

        if (!req.isAuthenticated) {
            return res.json({ error: true, msg: "Authentication required" }), resolve();
        }

        const { title } = req.body;
        if (!title || !title.length) {
            res.json({ error: true, msg: "empty title!" });
            return resolve();
        }
        if (!post_id || !post_id.length) {
            res.json({ error: true, msg: "invalid slug!" });
            return resolve();
        }

        let fields = ['author', 'author_email', 'title', 'excerpt', 'content', 'draft', 'topic', 'post_quote'];
        let newItem = _.pick(req.body, ...fields);

        const now = new Date;

        newItem['slug'] = post_id;
        newItem['creation_date'] = now;
        newItem['last_modified'] = now;

        // create post if slug isn't in use already
        Article.findOne({ slug: post_id }, (err, doc) => {
            if (err || doc) {
                if (err) res.json({ error: true, msg: err });
                else if (doc) res.json({ error: true, msg: "slug not available!" });
                return resolve();
            }

            Article.create(newItem, (err, doc) => {
                if (err) res.json({ error: true, msg: err });
                else res.json({ success: true, doc });
                resolve();
            });
        });
    });

});



// update post content
handle('post', (req, res, post_id, { Article }) => {
    // let { title, excerpt, content, draft, topic, post_quote, next_post } = req.body;
    return new Promise(resolve => {

        if (!req.isAuthenticated) {
            return res.json({ error: true, msg: "Authentication required" }), resolve();
        }

        let { title } = req.body;
        if (title != undefined && !title.length) return res.json({ error: true, msg: "empty title!" }), resolve();

        let writable = ['title', 'excerpt', 'content', 'draft', 'topic', 'post_quote', 'allow_comments'];
        let updates = _.pick(req.body, ...writable);

        // find post to update
        Article.findOne({ slug: post_id }, (err, doc) => {
            if (err) return res.json({ error: true, msg: err }), resolve();
            if (!doc) return res.json({ error: true, msg: "that post doesnt exist!" }), resolve();

            // increment revisions and update `Last modified` date
            // if content was modified
            if ('content' in updates && updates.content != doc.content) {
                doc.draft_revisions += 1;
                doc.last_modified = new Date;
            }

            // is it beign published ?, update publication date
            if (!updates.draft && !doc.pub_date) { // if (no_longer_a_draft AND not_published)
                doc.pub_date = new Date;
            }

            _
                .extend(doc, updates)
                .save();

            res.json({ success: true });
            resolve();
        });
    });
});



// delete post
handle('delete', (req, res, post_id, { Article }) => {
    return new Promise(resolve => {

        if (!req.isAuthenticated) {
            return res.json({ error: true, msg: "Authentication required" }), resolve();
        }

        Article.findOneAndDelete({ slug: post_id }, (err, doc) => {
            if (err) res.json({ error: true, msg: err });
            else res.json({ success: true });
            return resolve();
        });
    });
});



export default connectDB((req, res, DB_Models) => {
    const { query: { post_id } } = req;

    const method = req.method;
    if (!(method in handlers))
        return res.json({ msg: "You can't do that" });

    return handlers[method](req, res, post_id, DB_Models);
});