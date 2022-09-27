import jwt from "jsonwebtoken";
import { parseCookies } from "nookies";

export default async function verifyAuth(ctx) {
  const { req } = ctx;

  const cookies = parseCookies({ req });
  const token = cookies.__token;

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Error occurred (invalid/expired token)
    // redirect to login
    // set redirect url `rdr` to this page
    ctx.res.writeHead(302, {
      Location: `login?rdr=${encodeURIComponent(ctx.req.url)}`,
    });
    ctx.res.end();
  }
}
