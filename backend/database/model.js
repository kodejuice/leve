import { Schema, model } from 'mongoose';

// Article Schema
const ArticleSchema = new Schema({
	author: String,
	author_email: String,

	title: String,
	slug: String,
	excerpt: String,
	post_quote: {author: String, quote: String},

	pub_date: Date,
	creation_date: Date,
	last_modified: Date,

	content: String,
	topic: [String],

	next_post: {
		slug: String,
		title: String
	},

	views: {type: Number, default: 0},
	draft: {type: Boolean, default: true},	
	draft_revisions: {type: Number, default: 0},

	allow_comments: {type: Boolean, default: true}
});


// TODO: Remove this
const AdminSchema = new Schema({
	username: String,
	user_id: String,

	name: String,
	email: String,
});



module.exports = {
	Admin(){return model('admin', AdminSchema)},
	Article(){return model('article', ArticleSchema)}
};
