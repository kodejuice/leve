const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {ssr: false});

import {useEffect, useState} from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Head from 'next/head'
import fetch from 'node-fetch'
import _ from 'underscore'
import {format} from 'date-fns'

import { CommentCount } from 'disqus-react'
import Modal from 'react-modal'
import ClipLoader from "react-spinners/ClipLoader"
import { setCookie } from 'nookies'
import { HotKeys } from "react-hotkeys"

import MarkdownIt from 'markdown-it'
import tm from 'markdown-it-texmath'
import hljs from 'highlight.js'
import 'react-markdown-editor-lite/lib/index.css'
import 'highlight.js/styles/github.css'

import Header from '../../components/admin/Header';
import PreviewPost from '../../components/admin/PreviewPost';
import QuoteSelect from '../../components/admin/QuoteSelect';
import { WordCount, LineCount, addPostToDB, deleteDBPost, getKeywords } from '../../utils';
import { site_details as details } from '../../site_config.js';


// Initialize a markdown parser
const mdParser = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(lang, str, true).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + mdParser.utils.escapeHtml(str) + '</code></pre>';
  }
});

// MarkdownIt plugin
//  for math text processing
mdParser.use(tm, {
	engine: require('katex'),
	delimiters:'dollars',
	katexOptions: { macros: {"\\RR": "\\mathbb{R}"} }
});



export default function Edit(props) {
	let {post, all_posts} = props;
	const isNew = (post.slug == null);

	// modal states
	const [previewOpen, openPreview] = useState(false);
	const [quotesOpen, openQuotes] = useState(false);

	// post states
	let post_topic = (post.topic || []).join(",");
	const [title, setTitle] = useState(post.title);
	const [excerpt, setExcerpt] = useState(post.excerpt);
	const [content, setContent] = useState(post.content);
	const [slug, setSlug] = useState(post.slug);
	const [postquote, setQuote] = useState(post.post_quote);
	const [topic, setTopic] = useState(post_topic);
	const [draft, setVisibility] = useState(post.draft);
	const [allow_comments, allowComment] = useState(Boolean(post.allow_comments));
	const [isSaving, setSaveState] = useState(false);

	const post_data = {slug, title, excerpt, content, postquote, topic, draft, allow_comments, isNew};
	//...


	useEffect(_=>{
		document.querySelector("body").classList.remove('dark');

		// store cookie so the 'views' field of this post gets updated only once
		setCookie(null, post.slug, '1', {
			path: '/',
			maxAge: 86400 * 86400 /* 86400 days, 236 years(LoL) */
		});

		// before unload event
		window.onbeforeunload = function (e) {
				// Saving? or New Post?, no need to prompt
				if (isSaving || !slug) return null;

				e = e || window.event;

				// For IE and Firefox prior to version 4
				if (e) {
					e.returnValue = 'Leave page ?';
				}
				// For Safari
				return 'Leave page ?';
		};
	});

	const highlight = (post.slug!=null) ? {border: "1px solid orange"} : {};
	return (
		<>
			<HotKeys keyMap={{SAVE: "ctrl+s", PREVIEW: "ctrl+b"}}>
			<HotKeys handlers={{
				SAVE: ev=>{ev.preventDefault(); savePost(post_data, all_posts, setSaveState)},
				PREVIEW: ev=>{ev.preventDefault(); if(!quotesOpen) openPreview(!previewOpen)}
			}}>

			<Head>
				<title> Edit Post &lsaquo; {details.description} - Admin </title>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
				<meta name="robots" content="noindex"/>
				<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css"/>
				<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markdown-it-texmath/css/texmath.min.css"/>
				<script id="dsq-count-scr" src="//kodejuice.disqus.com/count.js" async></script>
			</Head>

			<div className='admin'>
				<Modal
					ariaHideApp={false}
					isOpen={previewOpen || quotesOpen}
					contentLabel="Modal">
						{previewOpen ? 
							(<>
								<button className="btn btn-danger close-modal" onClick={_=>openPreview(false)}><b>X</b></button>
								<PreviewPost post={post_data} content={mdParser.render(content)} />
							</>):
							(<>
								<button className="btn btn-danger close-modal" onClick={_=>openQuotes(false)}><b>X</b></button>
								<QuoteSelect selected={postquote} keywords={getKeywords((content||"")+" "+(excerpt||"")).join(", ")} setQuote={setQuote} />
							</>)
						}
				</Modal>


				<Header dark={false} quick_draft={false} page='edit'>
					<div className='row'>
						<div className='col-12 col-sm-9 border-right'>

							<form className='post_create'>
								<div className="form-group">
									<label htmlFor="Post title" style={{fontSize: "18px"}}>Post title</label>
									<input
										type="text"
										className="form-control w-50 in"
										placeholder="Post title"
										value={title}
										disabled={isSaving==true}
										onChange={v=>setTitle(v.target.value)}
										style={post.title!=title?highlight:{}}
									/>
								</div>
								<div className="form-group">
									<label htmlFor="Post excerpt" style={{fontSize: "18px"}}>Post excerpt</label>
									<input
										type="text"
										className="form-control w-50 in"
										placeholder="Post Excerpt"
										value={excerpt}
										disabled={isSaving==true}
										onChange={v=>setExcerpt(v.target.value)}
										style={post.excerpt!=excerpt?highlight:{}}
									/>
								</div>
							</form>


							{/* markdown editor */}
							<div className="mt-5">
								<MdEditor
									value={content}
									html={false}
									style={{ height: "500px" }}
									renderHTML={(text) => {
										if (!isSaving){
											setContent(text);
											return mdParser.render(text)
										}
										setContent(content);
										return mdParser.render(content);
									}}
								/>
							</div>
						</div>


						{/* Second column */}
						<div className='col-12 col-sm-3 visible-text'>
							{/*1st block (action block)*/}
							<div className='block-1 border-bottom pb-2 mt-3'>

								{/* view post link */}
								<button
									disabled={isSaving==true}
									className='btn btn-link'
									onClick={_=> confirm("Save ?") && savePost(post_data, all_posts, setSaveState, `//${process.env.HOST}/${slug}`)}>
									<a> View Post Page </a>
								</button>

								<div className="btn btn-group">
									{/* Preview post */}
									<button
										onClick={_ => openPreview(true)}
										title="Ctrl-b to preview"
										disabled={isSaving==true}
										className='btn btn-outline-secondary'>
										Preview <span className="glyphicon glyphicon-eye-open" aria-hidden="true"></span>
									</button>
		
									{/* Save Post */}
									<button
										onClick={_ => {savePost(post_data, all_posts, setSaveState);}}
										title="Ctrl-s to save"
										disabled={isSaving == true}
										className='btn btn-outline-primary'>
											<ClipLoader size={14} color={"#123abc"} loading={isSaving}/>
											Save <span className="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span>
									</button>
								</div>
							</div>


							{/*2nd block (readonly info)*/}
							<div className='block-2 border-bottom' style={{fontSize: '14px'}}>
								{/*views|comments|revisions*/}
								{!post.draft?
									<>
										<div className='row'><div className='col-4'>Views: </div> <div className='col'>{post.views|0}</div> </div>
										<div className='row'><div className='col-4'>Comments: </div>
											<div className='col comment-div'>
												{/* disqus commentcount */}
												<CommentCount shortname={slug} config={{
														url: `http://${process.env.HOST}/${slug}`,
														identifier: slug,
														title,
													}}>
												</CommentCount>
											</div>
										</div>
									</>
								: <div className='row'> <div className='col-4'>Revisions:</div> <div className='col'>{post.draft_revisions|0} </div>
								</div>}

								{/*publication date*/}
								{(!post.draft && post.pub_date)?
									<div className='row mt-2'><div className='col-4'>Published: </div>
										<div className='col-8'>{format(new Date(post.pub_date), "MMM d, yyyy HH:mm a")}</div>
									</div>
								: ""}

								{/*last modified date*/}
								{(!post.draft && post.last_modified)?
									<div className='row mt-2'><div className='col-4'>Last Modified: </div>
										<div className='col-8'>{format(new Date(post.last_modified), "MMM d, yyyy HH:mm a")}</div>
									</div>
								: ""}
							</div>


							{/*3rd block (post-info settings) */}
							<div className='block-3 mt-1 border-bottom'>

								{/*slug*/}
								<div className='sub-block'>
									<label htmlFor="Post slug">URL slug</label>
									{isNew ?
										<input
											style={post.slug!=slug?highlight:{}}
											type='text'
											disabled={isSaving==true}
											title={`http://${process.env.HOST}/[post_slug]`}
											className='form-control' value={slug||""} placeholder="post slug" onChange={e=>setSlug(e.target.value)}/>
									: <input type='text' className='form-control' value={post.slug||""} readOnly={true}/> }
								</div>

								{/*topic*/}
								<div className='sub-block'>
									<label htmlFor="Post topic">Post keywords</label>
									<input
										style={post_topic!=topic?highlight:{}}
										name='topic'
										type='text' title="used for search engines"
										disabled={isSaving==true}
										className='form-control' value={topic||""} onChange={e=>setTopic(e.target.value)} placeholder="separate by commas (, )"/>
								</div>

								{/* post quote*/}
								<div className='sub-block'>
									<label htmlFor="Post Quote">Post Quote</label>

									{ postquote.quote ?
										<blockquote style={post.post_quote.quote != postquote.quote ? highlight : {}}>
											<p className="mb-0 post-quote">{postquote.quote}.</p>
											<footer className="blockquote-footer p-quote text-right"><cite>{postquote.author}</cite></footer>
										</blockquote>	
									: <div>Not set</div>}

									<button
										disabled={isSaving==true}
										className='btn btn-outline-secondary'
										onClick={_=>openQuotes(true)}>
										Change Quote <span className="glyphicon glyphicon-eye-edit" aria-hidden="true"></span>
									</button>
								</div>

								{/* draft*/}
								<div className='sub-block'>
									<label htmlFor="Visibility">Visibility</label>
									<select
										disabled={isSaving==true}
										style={post.draft != draft ? highlight : {}}
										className='custom-select' defaultValue={draft} onChange={e=>setVisibility(e.target.value=="true")}>
										<option value={false}> Public </option>
										<option value={true}> Private </option>
									</select>
								</div>

								{/* allow comments*/}
								<div className='sub-block'>
									<label htmlFor="Visibility">Allow comments</label>
									<select
										disabled={isSaving==true}
										style={post.allow_comments!=Boolean(allow_comments)?highlight:{}}
										className='custom-select' defaultValue={allow_comments} onChange={e=>allowComment(e.target.value=="true")}>
										<option value={true}> Yes </option>
										<option value={false}> No </option>
									</select>
								</div>
							</div>


							{/*4th block (text stats) */}
							<div className='block-3 mt-1'>
								<div className='block-1 border-bottom pb-2 mt-3'>
										<div className='row'><div className='col-4'>Words: </div> <div className='col'>{WordCount(content)}</div> </div>
										<div className='row'><div className='col-4'>Lines: </div> <div className='col comment-div'>{LineCount(content)}</div> </div>
								</div>
							</div>


							{/*5th block (delete) */}
							{!isNew?
								<div className='block-3 mt-1'>
									<div className='block-1 pb-2 mt-3'>
										<button onClick={_=>slug && deletePost(slug)} disabled={isSaving==true} className='btn btn-danger'>
											Delete <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
										</button>
									</div>
								</div>
							: "" }
						</div>
					</div>

					<br/>
				</Header>
			</div>

			</HotKeys>
			</HotKeys>
		</>
	);
}




// TODO:
//~  do auth
//~   require auth for (viewing draft post (page), admin #board, creating post, listing drafts, quick draft, import/export)
//~		  delete post, edit post
//~  add "Edit post" link to (posts page) if auth()ed



/**
 * Saves Post to DB
 */
async function savePost(params, all_posts, setSaveState, redirect_url=null) {
	const {slug, title, excerpt, content, postquote, topic, draft, allow_comments, isNew} = params;
	if (!slug) {
		alert("Invalid Slug!");
		return setSaveState(false), false;
	}
	// saveState
	// renders button disabled,
	// dispays a spinner in Save-Button
	setSaveState(true);

	// extract params
	const data = {
		slug,
		title,
		excerpt,
		content,
		allow_comments,
		post_quote: postquote,
		draft: draft,
		topic: topic.split(","),
		author: details.name,
		author_email: details.email
	};

	let res;
	try {
		// create/update post
		res = await addPostToDB(data, isNew);
	} catch(e) {
		alert(e);
		return setSaveState(false), false;
	}

	// didnt go well ?
	if (res.success != true) {
		alert(JSON.stringify(res));
		setSaveState(false);
		return false;
	}
	
	// no need for this, the page gets reloaded anyways
	// and we also need to check if the reload was caused by a Save action
	// so we dont ask the user if they want to leave
	// setSaveState(false);

	if (redirect_url) location.href = redirect_url;
	else location.search = '?slug=' + slug;
}



/**
 * Delete Post from DB
 */
async function deletePost(slug) {
	if (confirm("Delete ?")) {
		let res = await deleteDBPost(slug);
		if (res.success != true) {
			return alert(JSON.stringify(res));
		}
		window.location = "list";
	}
}


export async function getServerSideProps(ctx) {
	const host = process.env.HOST;
	const baseUrl = `http://${host}`;

	const post_id = ctx.query.slug;
	const res = await fetch(`${baseUrl}/api/post/${post_id}?include=draft_revisions allow_comments views topic`, {
		headers: { cookie: ctx.req.headers.cookie }
	});
	const data = await res.json()

	// fetch all posts, (used for the "next post" <select>)
	let all_posts = await fetch(`${baseUrl}/api/post/list?fields=title slug`);
	all_posts = (await all_posts.json()).map(post => {
		return post;
	});
	// ...

	if (data.error) {
		// no post with slug '${post_id}'
		return {
			props: {
				post_id: post_id || null,

				all_posts,

				// blank template, (new post)
				post: {
					title: "",
					slug: null,
					excerpt: "",
					draft: true,
					allow_comments: true,
					next_post: {},
					post_quote: {quote: null}
				}
			}
		}
	}

	return {
		props: {
			all_posts,
			post_id,
			post: data
		}
	};
}

