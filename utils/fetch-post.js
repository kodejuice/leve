import _ from 'underscore'
import mongoose from 'mongoose'
let DB_Models = require('../backend/database/model.js');


// This script would be used to get posts from the database
// without having to go through nextjs api routes

const toObject = payload => JSON.parse(JSON.stringify(payload));


/**
 * Fetch a single post from DB.
 *
 * @param      {string}   slug              The slug of the post (post identifier) `http://{host}/{slug}`
 * @param      {string}   mongo_uri         The mongodb connection URI
 * @param      {boolean}  [next_post=true]  Should we get the next post suggestion?
 * @return     {Promise}  The post.
 */
export async function getPost(slug, mongo_uri, next_post=true, draft=false) {
    const model = await db_model(mongo_uri);

    return new Promise(resolve => {
        let query = model
            .findOne({ 'slug': slug })
            .exec();

        query.then(post => {
            if (!post || (post.draft && draft==false)) {
                return resolve({ error: true, msg: "Not found" });
            }

            if (next_post) {
                getNextPosts(post, model).then(nxt => {
                    post.next_post = nxt;
                    resolve(toObject(post));
                }).catch(err => {
                    resolve(toObject(post));
                });
            } else {
                return resolve(toObject(post));
            }

        }).catch(err => {
            return resolve({error: true});
        });
    });
}


/**
 * Fetch all posts from DB.
 *
 * @param      {string[]}  fields     Fields to select in the database model
 * @param      {<type>}    mongo_uri  The mongodb connection URI
 * @return     {Promise}   The posts.
 */
export async function getPosts(fields, mongo_uri, draft=false) {
    const model = await db_model(mongo_uri);

    return new Promise(resolve => {
        let query = model
            .find()
            .select(fields.join(" "))
            .sort({ views: 'desc' })
            .where('draft', draft)
            .exec();

        query.then(posts => {
            resolve(toObject(posts));
        }).catch(err => {
            resolve([]);
        });
    });
}


// get "next post >>" suggestion
async function getNextPosts(post, model) {
    try {
        let nxt_doc = await model.findOne({ 'pub_date': { $gt: post.pub_date }, 'draft': false })

        if (!nxt_doc)
            nxt_doc = (await model.find({ 'pub_date': { $lt: post.pub_date }, 'draft': false }).sort({ pub_date: 'asc' }))[0];

        return nxt_doc;
    } catch (e) {
        console.log(e);
    }
}


////////////////
// DB Connect //
////////////////

/**
 * Connect to database
 *
 * @param      {string}   uri     The connection uri
 * @return     {Promise}  { The database Article model }
 */
async function db_model(uri) {
    // if we connected already then just return the model
    // we stored in the mongoose.connections[] array
    if (mongoose.connections[0].readyState)
        return mongoose.connections.DB_Models.Article;

    // else create new connection
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true,
        autoIndex: false
    });

    mongoose.connections.DB_Models = {
        Article: DB_Models.Article()
    };

    return mongoose.connections.DB_Models.Article;
}

