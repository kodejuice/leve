import Link from 'next/link'
import Head from 'next/head'
import fetch from 'node-fetch'
import {useEffect} from 'react'
import { parseCookies, setCookie } from 'nookies'

import Posts from '../components/home/Posts'
import Header from '../components/home/Header'

import { site_details as details } from '../site_config.js';


function Home(props) {
	useEffect(_=>{
		window.onbeforeunload = ()=>null;
		if (location.search=="?dark")
			document.querySelector("body").classList.add('dark');
	});

	let {posts} = props;

	// get recent posts from data,
	// sorts them in descending order of their publication date, and gets the first few ${post_per_page}
	let post_per_page = details.site.post_per_page;
	let recent_posts = posts.slice().sort((x,y) => new Date(y.pub_date) - new Date(x.pub_date)).slice(0,post_per_page)

	return (
		<>
  		<Head>
				<title> {details.name} </title>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
				<meta name="description" content={details.description}/>
			</Head>

			<div className='container'>
				<div className='position-fixed back-btn'>
					{
						parseCookies(null).__token ?
						(
							<div className="mt-4">
								<div title="Dashboard">
									<Link href={"admin/list"}>
										<a className="btn btn-link"><span className='glyphicon glyphicon-dashboard'></span></a>
									</Link>
								</div>

								<div title="Add new post">
									<Link href="admin/edit">
										<a className="btn btn-link"> <span className='glyphicon glyphicon-plus'></span> </a>
									</Link>
								</div>
							</div>
						)
						: ""
					}
				</div>

				<div className='home-main mb-5'>
					<Header details={details} />
					<Posts recent_posts={recent_posts} all_posts={posts} />

					<div className='mt-5 pl-0 ml-0' title='Get an email whenever theres new content'>
						<a href="https://lb.benchmarkemail.com//listbuilder/signupnew?UOpPXfYpHY5FgmNYouPUxP5pwVnAjsSIHDOR9QrPhDftO5iNRn8gS049TyW7spdJ"> <em> Subscribe to newsletter ! </em> </a>
					</div>
				</div>
			</div>
		</>
	);
}





// This gets called on every request
export async function getServerSideProps(ctx) {
	// Fetch data from API
	const baseUrl = `http://${process.env.HOST}`;

	const res = await fetch(`${baseUrl}/api/post/list`);
	const data = await res.json();

	// Pass data to the page via props
	return {
		props: {
			posts: data
		}
	};
}


export default Home;
