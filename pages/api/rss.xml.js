import {format} from 'date-fns';

import connectDB from '../../backend/database/connection.js';
import {site_details as details} from '../../site_config.js';

export default connectDB((req, res, DB_Models) => {
    const {Article} = DB_Models;

    return new Promise((resolve, reject) => {
        let db_query = Article
                .where('draft', false)
                .sort({views: 'desc'});

        // execute query
        db_query.exec();

            let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
    <title> ${details.name} </title>
    <link> ${process.env.SCHEME}://${req.headers.host} </link>
    <description> ${details.description} </description>
`;

        db_query.then(posts => {
            posts.forEach(post => {
                xml += `
    <item>
        <title> ${post.title} </title>
        <link> ${process.env.SCHEME}://${req.headers.host}/${post.slug} </link>
        <description> ${post.excerpt} </description>
        <pubDate> ${format(new Date(post.pub_date), "MMM d, yyyy HH:mm a")} </pubDate>
        <author> ${post.author_email} </author>
        <comments> http://${req.headers.host}/${post.slug}#comments </comments>
        <category> ${post.topic.join(", ")} </category>
        <language> en-us </language>
        <guid> ${post.slug} </guid>
    </item>
`;
            });
xml += `
</channel>
</rss>
`;

            res.send(xml);
            resolve();
        })
        .catch(err => {
            res.send(xml+"</channel></rss>");
            resolve();
        });
    });

});
