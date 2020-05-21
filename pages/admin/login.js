import Link from 'next/link'
import Head from 'next/head'
import fetch from 'node-fetch'
import {useEffect, useState} from 'react'
import { parseCookies, setCookie } from 'nookies'
import ClipLoader from "react-spinners/ClipLoader"
import queryString from 'query-string'

import { site_details as details } from '../../site_config.js';


function LoginPage(props) {
	const [pwd, setPwd] = useState("");
	const [isLoading, beginAuth] = useState(false);

	// redirect url
	const {url} = props;
	const {rdr} = queryString.parse(url);

	useEffect(_=>{
		window.onbeforeunload = ()=>null;
		if (location.search=="?dark")
			document.querySelector("body").classList.add('dark');
	});

	return (
		<>
  		<Head>
				<title> Admin Login - {details.description} </title>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
				<meta name="robots" content="noindex"/>
				<meta name="description" content={details.name}/>
			</Head>

			<div className='container'>
				<div className='position-fixed back-btn'>
					<Link href="../">
						<a title='Go home' className='home-link btn btn-link'><b>&lt;&lt;&lt;</b></a>
					</Link>
				</div>

				<div className='home-main mb-5'>
					<h1> LOGIN </h1>
					<div className="mt-5">
						<form onSubmit={ev=>Login(ev, pwd, beginAuth, rdr)}>
								<div className="form-group mt-5">
									<input
										type="text"
										className="form-control w-50 mr-2 input-login-pwd"
										placeholder="Enter password"
										value={pwd}
										onChange={ev=>setPwd(ev.target.value)}
										style={{display:"inline-block"}}
									/>
									<ClipLoader size={15} color={"#123abc"} loading={isLoading}/>
								</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}



async function Login(ev, pwd, beginAuth, rdr) {
	ev.preventDefault();

	// render spinner active
	beginAuth(true);

	const baseUrl = `http://${process.env.HOST}`;
	const res = await fetch(`${baseUrl}/api/auth/login`, {
		method: "POST",
		body: JSON.stringify({password: pwd}),
		headers: { 'Content-type': 'application/json' }
	});
	const json = (await res.json());

	//
	if (json.success != true) {
		// lol, lets troll a likkle bit
		alert("Correct!");
	} else {
		// password correct
		// set token in cookie

		setCookie(null, '__token', json.token, {
			path: '/',
			maxAge: 86400 * 31 // 31 days
		});

		// redirect page
		window.location = rdr;
	}

	// stops spinner (if page not redirected)
	beginAuth(false);
}


export function getServerSideProps(ctx) {
	return {props: {url: ctx.req.url.split('?')[1]}}
}

export default LoginPage;
