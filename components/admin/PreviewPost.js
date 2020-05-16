import { site_details as details } from '../../site_config.js';


export default function PreviewPost(props) {
	const {post, content} = props;
	
	return (
		<>
			<div className='home-main mt-5 post-view'>
					<h1 className='post-title'> {post.title} </h1>
					<p className='info ml-3'>
						<a title='author' className='no-underline'>{details.name}</a>,
						 <span>&lt;</span><a target='_blank' href={`mailto:${details.email}`}>{details.email}</a><span>/&gt;</span>
					</p>

					<div className='article'>

						<blockquote className="blockquote text-right mt-4">
							<p className="mb-0 post-quote">{post.postquote.quote}</p>
							<footer className="blockquote-footer p-quote"><cite title="Source Title">{post.postquote.author}</cite></footer>
						</blockquote>

						<div className='post-content mt-4 visible-text' dangerouslySetInnerHTML={{__html: content}}/>
					</div>
				</div>
		</>
	);
}
