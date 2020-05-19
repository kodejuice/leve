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
	<link> ${process.env.HOST} </link>
	<description> ${details.description} </description>
`;

		db_query.then(posts => {
			posts.forEach(post => {
				xml += `
	<item>
		<title> ${post.title} </title>
		<link> http://${process.env.HOST}/${post.slug} </link>
		<description> ${post.excerpt} </description>
		<pubDate> ${post.pub_date} </pubDate>
		<author> ${post.author_email} </author>
		<comments> http://${process.env.HOST}/${post.slug}#comments </comments>
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
