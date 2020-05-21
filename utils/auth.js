import jwt from 'jsonwebtoken'
import { parseCookies } from 'nookies'

export default async function verifyAuth(ctx) {
	let {req} = ctx;
	
	let cookies = parseCookies({req});
	let token = cookies.__token;

  try {
		let decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
		// Error occured (invalid/expired token)
    // redirect to login
		ctx.res.writeHead(302, { Location: 'login' });
		ctx.res.end();
  }
}
