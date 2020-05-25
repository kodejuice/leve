import {useEffect, useState} from 'react'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import Head from 'next/head'
import fetch from 'node-fetch'

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


import {setTheme} from '../utils';
import {getBestMatch} from '../utils/string-similarity';
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


function PostView(props) {
    // props passed from getServerSideProps()
    const {id, post, corrections, host, scheme} = props;
    
    // invalid post id, render 404 page
    if (!post) {
        return <PageNotFound id={id} corrections={corrections} />;
    }

    useEffect(_=>{
        if (parseCookies(null).__dark == "1")
            document.querySelector("body").classList.add('dark');

        window.onbeforeunload = ()=>null;

        // store cookie so the 'views' field of this post gets updated once
        setCookie(null, post.slug, '1', {
            path: '/',
            maxAge: 86400 * 31 /* 31 days */
        });
    });

    return (
        <>
        <Head>
            <title> {post.title} </title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            <meta name="description" content={`${post.excerpt}, By: ${post.author}`}/>
            <meta name="keywords" content={(post.topic || [post.excerpt]).join(', ')} />
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css"/>
            <link rel="alternate" type="application/rss+xml" href={`${scheme}://${host}/api/rss.xml`} />
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markdown-it-texmath/css/texmath.min.css"/>
            <script src="./js/benchmarkemail-signupform.js"/>
            <script dangerouslySetInnerHTML={{__html:`
                // Disqus config
                var disqus_config = function () {
                    this.page.url = "https://${host}/${props.post.slug}";
                    this.page.identifier = "${details.name}:${props.post.slug}";
                    this.page.title = "${props.post.title}";
                };
                (function() { // DON'T EDIT BELOW THIS LINE
                    var d=document, s=d.createElement('script');
                    s.src="https://${process.env.DISQUS_HOST}/embed.js";
                    s.setAttribute('data-timestamp', +new Date());
                    (d.head||d.body).appendChild(s);
                })();
            `}} />
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA_TRACK_CODE}`}/>
            <script dangerouslySetInnerHTML={{__html:`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.GA_TRACK_CODE}');
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

                <div className='home-main mt-5 post-view'>
                    <h1 className='post-title'> {post.title} </h1>
                    <p className='info ml-3'>
                        <Link href='/'><a title='author' className='no-underline'>{post.author}</a></Link>,
                         <span>&lt;</span><a target='_blank' href={`mailto:${post.author_email}`}>{post.author_email}</a><span>/&gt;</span>
                    </p>

                    <div className='article'>
                        <em className='pub_date'> {post.pub_date} </em>

                        {/* quote */}
                        <blockquote className="blockquote text-right mt-4">
                            <p className="mb-0 post-quote">{post.post_quote.quote}</p>
                            <footer className="blockquote-footer p-quote"><cite title="Author">{post.post_quote.author}</cite></footer>
                        </blockquote>

                        {/* post content */}
                        <div className='post-content mt-4 visible-text' dangerouslySetInnerHTML={{__html: mdParser.render(post.content || "")}}/>
                        <p className='pt-1 text-right updated-time'> {post.last_modified!=post.pub_date && `Updated ${post.last_modified}`} </p>

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
<input type=text placeholder="Email Address" class="formbox-field_YPLMC text-placeholder" onfocus="javascript:focusPlaceHolder(this);" onblur="javascript:blurPlaceHolder(this);" id="fldemail_YPLMC" name="fldemail_YPLMC" maxlength=100 /></fieldset>
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

                        {/*<!-- DISQUS HERE -->*/}
                        <div className='comments' id='comments'>
                            {
                                (!post.allow_comments) ?
                                    <b> <em> Comments Disabled </em> </b>
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


// fetch Article information from database
export async function getServerSideProps(ctx) {
    const host = ctx.req.headers.host;
    const baseUrl = `${process.env.SCHEME}://${ctx.req.headers.host}`;

    const post_id = ctx.query.id[0];
    const res = await fetch(`${baseUrl}/api/post/${post_id}?include=allow_comments views`, {
        headers: { cookie: ctx.req.headers.cookie }
    });
    const data = await res.json()

    const props = {
        post: null,
        id: ctx.query.id
    };

    if (data.error) {
        // no post with slug '${post_id}'
        return {
            props: _.extend(props, {
                host,
                scheme: process.env.SCHEME,
                corrections: await getBestMatch(props.id.join('/'), host)
            })
        }
    }

    // formate date in post
    let {pub_date, last_modified} = data;
    data.pub_date = (data.pub_date && format(new Date(pub_date), "MMMM dd, yyyy")) || null;
    data.last_modified = (data.last_modified && format(new Date(last_modified), "MMMM dd, yyyy")) || null;
    // ...

    return {
        props: _.extend(props, {
            host,
            scheme: process.env.SCHEME,
            post: data
        })
    }
}

export default PostView;
