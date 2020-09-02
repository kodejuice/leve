import {useEffect, useState} from 'react'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import Head from 'next/head'
import fetch from 'node-fetch'
import {useRouter} from 'next/router'

import _ from 'underscore'
import {format} from 'date-fns'
import { parseCookies, setCookie } from 'nookies'
import Toggle from '../components/home/Toggle';

import { DiscussionEmbed } from 'disqus-react'
import MarkdownIt from 'markdown-it'
import tm from 'markdown-it-texmath'
import hljs from 'highlight.js'
import 'react-markdown-editor-lite/lib/index.css'
import 'highlight.js/styles/github.css'

import PageNotFound from '../components/PageNotFound'
import PageError from '../components/PageError'

import {setTheme} from '../utils';
import {getBestMatch} from '../utils/string-similarity';
import {getPost, getPosts} from '../utils/fetch-post';

import { site_details as details } from '../site_config.js';


// Initialize a markdown parser
const mdParser = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>'+hljs.highlight(lang, str, true).value+'</code></pre>';
      } catch (__) {return '<pre><code>'+mdParser.utils.escapeHtml(str)+'</code></pre>'}
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


// DEBUG
global.log = (...x) => console.log(...x)
global.str = JSON.stringify;

function PostView(props) {    
    const router = useRouter();

    let {id, host, scheme, post, corrections} = props;

    // page not yet generated
    // display an incomplete loading page
    // until getStaticProps() finish running
    if (router.isFallback) {
        post = getPlaceholder();
    }
    else if (!post) {
        // no post data
        // implies invalid post id, render 404 page
        return <PageNotFound id={id} corrections={corrections} />;
    }


    useEffect(_=>{
        update_views(props.id, scheme).then(yes => {
            if (yes) {
                // store cookie so the 'views' field of this post gets updated once
                setCookie(null, post.slug, '1', {
                    path: '/',
                    maxAge: 86400 * 31 /* 31 days */
                });
            }
        });
    });

    return (
        <>
            <Head>
                <title> {post.title} </title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <meta name="description" content={`${post.excerpt}, By: ${post.author}`}/>
                <meta name="keywords" content={(post.topic || [post.excerpt]).join(', ')} />
                <link rel="canonical" href="https://www.zainrizvi.io/blog/whats-it-like-as-a-senior-engineer/" />   
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt} />
                <meta property="og:url" content={`https://${host}/${post.slug}`} />
                <meta property="article:published_time" content={post.pub_date} />
                <meta property="article:modified_time" content={post.last_modified} />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={post.excerpt} />
                <meta name="twitter:url" content={`https://${host}/${post.slug}`} />
                <meta property="og:type" content="article" />
                <meta name="twitter:label1" content="Written by" />
                <meta name="twitter:data1" content={post.author} />
                <meta name="twitter:site" content="@kodejuice" />
                <meta name="twitter:creator" content="@kodejuice" />

                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css"/>
                <link rel="alternate" type="application/rss+xml" href={`${scheme}://${host}/api/rss.xml`} />
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markdown-it-texmath/css/texmath.min.css"/>
                <script src="./js/benchmarkemail-signupform.js"/>
                <script dangerouslySetInnerHTML={{__html:`
                    // Disqus config
                    var disqus_config = function () {
                        this.page.url = "https://${host}/${post.slug}";
                        this.page.identifier = "${details.name}:${post.slug}";
                        this.page.title = "${post.title}";
                    };
                    (function() { // DON'T EDIT BELOW THIS LINE
                        var d=document, s=d.createElement('script');
                        s.src="https://${props.disqus_host}/embed.js";
                        s.setAttribute('data-timestamp', +new Date());
                        (d.head||d.body).appendChild(s);
                    })();
                `}} />
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${props.ga_track_code}`}/>
                <script dangerouslySetInnerHTML={{__html:`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${props.ga_track_code}');
                `}} />
            </Head>

            <div className='container'>
                <div className='position-fixed action-btn'>
                    <div className='toggler'>
                        <Toggle
                        	onSwitch={_=>reloadDisqusThread()}
                        />
                    </div>

                    <div className='hide-on-mobile'>
                        <p style={{position:'fixed',top:0,left:2,fontFamily:'Fira'}}>
                            <small style={{fontSize: "14px"}}>{details.name}</small>
                        </p>
                        <Link href="/">
                            <div title="Go Home">
                                <a className="btn btn-link"><span className='glyphicon glyphicon-chevron-left'></span></a>
                            </div>
                        </Link>
                        {
                            parseCookies(null).__token ?
                            (
                                <div className="mt-4">
                                    <div title="Edit post">
                                        <Link href={"admin/edit?slug="+post.slug}>
                                            <a className="btn btn-link"><span className='glyphicon glyphicon-pencil'></span></a>
                                        </Link>
                                    </div>

                                    <div title="Add new post">
                                        <Link href="admin/edit">
                                            <a className="btn btn-link"> <span className='glyphicon glyphicon-plus'></span> </a>
                                        </Link>
                                    </div>

                                    <div>
                                        - <small><em title="This post isnt published yet" className="mt-1"> {post.views} views </em></small>
                                    </div>

                                    <div>
                                        - {post.draft?
                                        <small><em title="This post isnt published yet" className="mt-1"> {post.draft ? "draft" : ""} </em></small>
                                        :""}
                                    </div>
                                </div>
                            )
                            : ""
                        }
                    </div>
                </div>

                <section>
                    <div className='home-main mt-5 post-view'>
                        <header>
                            <h1 className='post-title'> {post.title} </h1>
                            <p className='info ml-3'>
                                <Link href='/'><a title='author' className='no-underline'>{post.author}</a></Link>,
                                 <span>&lt;</span><a target='_blank' href={`mailto:${post.author_email}`}>{post.author_email}</a><span>/&gt;</span>
                            </p>
                        </header>

                        <div className='article'>
                            <article>
                                <em className='pub_date'> {post.pub_date} </em>

                                {/* quote */}
                                {post.post_quote != null ?
                                    (<blockquote className="blockquote text-right mt-4">
                                        <p className="mb-0 post-quote">{post.post_quote.quote}</p>
                                        <footer className="blockquote-footer p-quote"><cite title="Author">{post.post_quote.author}</cite></footer>
                                    </blockquote>)
                                : "" }

                                {/* post content */}
                                <div className='post-content mt-4 visible-text' dangerouslySetInnerHTML={{__html: mdParser.render(post.content || "")}}/>
                                <p className='pt-1 text-right updated-time'> {post.last_modified!=post.pub_date && `Updated ${post.last_modified}`} </p>
                            </article>

                            <footer>
                                <div className='row mb-5 _post_footer'>
                                    {/* subsribe to newsletter */}
                                    <div className='col'>
                                        <legend id='subscribe' className='visible-text'>Get an email whenever theres a new article</legend>
                                          <div className="form-row">
                                            <div className="col" dangerouslySetInnerHTML={{__html:`
                                                <div id="signupFormContainer_YPLMC">
                                                <div id="signupFormContent_YPLMC">
                                                <div class="formbox-editor_YPLMC"><div id="formbox_screen_subscribe_YPLMC" style="display:block;" name="frmLB_YPLMC">
                                                <input type=hidden name=token_YPLMC id=token_YPLMC value="mFcQnoBFKMREm%2FBVsa6KJrJ25jqXIyRIGAsuYxzAV7Knxdbvm8OfpQ%3D%3D" />
                                                <input type=hidden name=successurl_YPLMC id=successurl_YPLMC value="https://lb.benchmarkemail.com/Code/ThankYouOptin" />
                                                <input type=hidden name=errorurl_YPLMC id=errorurl_YPLMC value="http://lb.benchmarkemail.com//Code/Error" />
                                                <input type=text placeholder="Email Address" class="formbox-field_YPLMC text-placeholder" onfocus="javascript:focusPlaceHolder(this);" onblur="javascript:blurPlaceHolder(this);" id="fldemail_YPLMC" name="fldemail_YPLMC" maxlength=100 />
                                                <button id="btnSubmit_YPLMC" onClick="javascript:return submit_YPLMCClick();" class="formbox-button_YPLMC btn-link btn submit visible-text">subscribe</button>
                                                </div>
                                                </div>
                                                </div>
                                                </div>
                                            `}} />
                                          </div>
                                    </div>

                                    {/* next post >> */}
                                    {!_.isEmpty(post.next_post)?
                                        <div className='col-12 col-sm-6 text-right next-post-link'>
                                            <Link href="[...id].js" as={`/${post.next_post.slug}`}>
                                                <a className='next-post-link'>{post.next_post.title} <span className='glyphicon glyphicon-chevron-right'></span></a>
                                            </Link>
                                        </div>
                                    : ""}
                                </div>
                            </footer>

                            {/*<!-- DISQUS HERE -->*/}
                            <div className='comments' id='comments'>
                                {
                                    (!post.allow_comments) ?
                                        ((post.is_loading) ? "" : <b> <em> Comments Disabled </em> </b>)
                                        : (
                                            <DiscussionEmbed
                                                shortname={details.name+":"+post.slug}
                                                config={{
                                                    url: `https://${host}/${post.slug}`,
                                                    identifier: details.name+":"+post.slug,
                                                    title: post.title,
                                                }}
                                            />
                                        )
                                }
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </>
    );
}



// reload disqus thread
function reloadDisqusThread() {
    // DISQUS is a global variable,
    // which comes with the embed.js script
    try {
        DISQUS.reset();
    } catch (e) {
        return;
    }
}


// this update the `views` property of a post
// in the database
async function update_views(slug, scheme) {
    if (!slug) return;
    const url = `${scheme}://${location.host}/api/post/${slug}`;
    await fetch(url, {
        headers: { cookie: parseCookies(null) }
    });
    return true;
}

// placeholder data
// this will be used if the page isFallback
function getPlaceholder() {
    return {
        is_loading: true,
        topic: [],
        slug: "/",
        views: 1,
        draft: 0,
        content: "![Loading...](icons/spinner.svg)",
        title: "Loading...",
        author: details.name,
        author_email: details.email,
        pub_date: null,
        last_modified: null,
        allow_comments: false,
        post_quote: null, // {}
        next_post: null,  // {}
    };
}


/////////////////////
// pre-render util //
////////////////////

// get routes that should be pre-rendered
export async function getStaticPaths() {
    const data = await getPosts(['slug'], process.env.MONGODB_URI);

    return {
        paths: data.map(post => ({
            params: {id: [post.slug]}
        })),

        fallback: true
    }
};


// fetch Post information from database
export async function getStaticProps(ctx) {
    const post_id = ctx.params.id[0]; // `/{slug}`
    const [host, scheme, mongo_uri] = [process.env.HOST, process.env.SCHEME, process.env.MONGODB_URI];

    const data = await getPost(post_id, mongo_uri);

    const props = {
        host,
        scheme,
        id: ctx.params.id,
        ga_track_code: process.env.GA_TRACK_CODE,
        disqus_host: process.env.DISQUS_HOST,
    };

    if (data.error) {
        // no post with slug '${post_id}'
        return {
            props: _.extend(props, {
                corrections: await getBestMatch(ctx.params.id.join('/'), mongo_uri)
            }),
            revalidate: 60
        }
    }

    // format date in post
    let {pub_date, last_modified} = data;
    data.pub_date = (data.pub_date && format(new Date(pub_date), "MMMM dd, yyyy")) || null;
    data.last_modified = (data.last_modified && format(new Date(last_modified), "MMMM dd, yyyy")) || null;
    // ...

    return {
        props: _.extend(props, {
            post: data
        }),
        revalidate: 60
    }
}


export default PostView;
