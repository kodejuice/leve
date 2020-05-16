import {useState} from "react";
import Link from 'next/link';


import { CommentCount } from 'disqus-react'
import Pagination from "react-js-pagination"

import {scrollToTop, deleteDBPost} from '../../utils';
import { site_details as details } from '../../site_config.js';


function List(props) {
	const [activePage, setActivePage] = useState(1);	// pagination state
	const {is_published, posts} = props;

	// pagination data
	let {post_per_page} = details.site;

	let start = (activePage-1) * post_per_page,
		length = start + post_per_page,
		posts_len = posts.length;
	// ...

	return (
		<div className='table-responsive'>
			<table className="table table-striped table-bordered post-listing">
				<thead>
					<tr>
						<td scope="col">Title</td>
						<td scope="col">Category</td>

						{/*comments/revisions*/}
						<td scope="col" title={is_published?"Comments":"Revisions"}> <span className={'glyphicon glyphicon-'+(is_published?'comment':'edit')}></span> </td>

						{/*publication/creation date*/}
						<td scope="col" title={is_published?"Publication Date":"Creation Date"}> <span className='glyphicon glyphicon-time'></span> </td>
					</tr>
				</thead>

				<tbody>
					{posts.slice(start, length).map(post => (
						<tr key={post._id}>
							<td>
								{/*Post title*/}
								<Link href={`edit?slug=${post.slug}`}>
									<a className='p-link' title={post.excerpt}> {post.title} </a>
								</Link>

								{/*View post link*/}
								<Link href="/[...id].js" as={`/${post.slug}`}>
									<a className='btn btn-link btn-sm' title="View"> <span className="glyphicon glyphicon-eye-open" aria-hidden="true"></span> </a>
								</Link>

								{/*Delete post (drafts only) */}
								{!is_published?
									<button className="btn-link btn pl-0 ml-0 mb-0 pb-0"
										onClick={async _=>{deletePost(post.slug)}}>
										<a className='btn btn-link btn-sm' title="Delete"> <span className="glyphicon glyphicon-trash" aria-hidden="true"></span> </a>
									</button>
								: ""}
							</td>

							{/*Post category*/}
							<td> {post.topic.join(', ') || 'Uncategorized'} </td>

							{/*Comment_count || Revisions_count*/}
							{is_published ?
								<td className="comment-count">
									<CommentCount config={{
										url: `http://${process.env.HOST}/${post.slug}`,
										identifier: post.slug,
										title: post.title,
										}}> </CommentCount>
								</td>
								: <td>{post.draft_revisions | 0}</td> }

							 {/*Publication/Creation date*/}
							<td>{is_published ? post.pub_date: post.creation_date}</td>
						</tr>
					))}
				</tbody>
			</table>


			<div className='mt-4'>
				{posts_len > post_per_page && <Pagination
					activePage={activePage}
					pageRangeDisplayed={4}

					itemsCountPerPage={post_per_page}
					totalItemsCount={posts_len}

					onChange={p => scrollToTop(_=>setActivePage(p), 400, 0)}

					itemClass="page-item"
					linkClass="page-link"

					hideDisabled={true}
				/>}
			</div>
		</div>
);

}



// delete post button click
async function deletePost(slug) {
	if (confirm("Delete ?")) {
		let res = await deleteDBPost(slug);
		if (res.success != true) {
			return alert(JSON.stringify(res));
		}
		window.location = "list";
	}
}


export default function Posts(props) {
	const [list_published, setState] = useState(!props.show_draft_on_load);
	const {drafts, published} = props.posts;

	const l_pub = list_published;
	return 	(
		<>
			<div className="mt-4">
				<div className='toggle-btn'>
					{published.length && <a onClick={_=>setState(true)} className={`link-btn btn btn-link bold-${l_pub}`}> Published ({published.length}) </a> || ""}
					{published.length && drafts.length && <b>|</b> || ""}
					{drafts.length && <a onClick={_=>setState(false)} className={`link-btn btn btn-link bold-${!l_pub}`}> Draft ({drafts.length}) </a> || ""}
				</div>
			</div>

			<div className="list ml-3 mt-3">
				<List posts={list_published ? published : drafts} is_published={list_published} />
			</div>
		</>
	);
}
