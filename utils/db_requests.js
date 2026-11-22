/* eslint-disable no-async-promise-executor */

/**
 * Functions to make http requests to the backend server to manage the database
 * These functions are called from the frontend
 */

/**
 * Delete post request
 * @param  {Object}          post slug
 * @return {Promise}         resolved data is request's response
 */
export async function deleteDBPost(slug, url) {
  const baseUrl = `${url}`;

  const res = await fetch(`${baseUrl}/api/post/${slug}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: true, msg: `Server error (${res.status}): ${text}` };
  }
  const data = await res.json();
  return data;
}

/**
 * Post/Put Request to add Post to DB / Modify Post in DB
 * @param  {Object}          post parameters
 * @return {Promise}         resolved data is request's response
 */
export async function addPostToDB(body, create, url) {
  const baseUrl = `${url}`;
  const { slug } = body;

  const res = await fetch(`${baseUrl}/api/post/${slug}`, {
    method: create ? "PUT" : "POST", // PUT->create post, POST->update post
    body: JSON.stringify(body),
    headers: { "Content-type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: true, msg: `Server error (${res.status}): ${text}` };
  }
  const data = await res.json();
  return data;
}
