import {useState} from 'react'
import Link from 'next/link'
import ClipLoader from "react-spinners/ClipLoader"
import { parseCookies, destroyCookie } from 'nookies'

import {addPostToDB} from '../../utils';
import { site_details as details } from '../../site_config.js';


const sidebarLinks = [{
        icon: 'book',
        href: 'list',
        name: 'Posts'
    },{
        icon: 'floppy-disk',
        href: 'export',
        name: 'Export Data'
    },{
        icon: 'floppy-disk',
        href: 'import',
        name: 'Import Data'
}];

const Header = (props) => {
    const [saving, setSaving] = useState(false);
    const theme = (parseCookies(null).__dark=='1' || props.is_dark) ? 'bg-dark' : 'bg-light';
    const {page, host, url} = props;

    return (
        <>
            <div className="container-fluid">
                {/*navbar*/}
                <nav className={`navbar ${theme} fixed-top flex-md-nowrap p-0 shadow`} style={{zIndex:999}}>
                    <a title="Visit website" className="navbar-brand col-sm-3 col-md-2 mr-0" href={`http://${host}`}>{details.name}</a>
                    <ul className="navbar-nav px-3">
                        <li className="nav-item text-nowrap">
                            <a className="nav-link btn btn-link" onClick={ev => {
                                if (confirm("Sign out?")) {
                                    document.cookie = "__token=; path=/; maxAge=0;"
                                    location.reload();
                                }
                            }}> Sign Out </a>
                        </li>
                    </ul>
                </nav>

                <div className="row">
                    {/*sidebar*/}
                    <nav className="col-md-2 d-none d-md-block sidebar position-relative">
                        <div className="sidebar-sticky">
                            <ul className="nav flex-column mt-5">
                                {sidebarLinks.map(obj=>
                                    <li className="nav-item" key={obj.href}>
                                        <Link href={obj.href} key={obj.name}>
                                            <a className={"nav-link"+(page==obj.href?' active':'')}>
                                                <span className={'mr-2 glyphicon glyphicon-'+obj.icon}></span>
                                                {obj.name} <span className="sr-only">(current)</span>
                                            </a>
                                        </Link>
                                    </li>                                   
                                )}
                            </ul>
                        </div>
                    </nav>

                    <main style={{paddingTop:'60px'}} role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4 position-relative">
                        <div className="position-relative main mb-4">
                            {
                                props.quick_draft && 
                                    <div className="border-bottom quick-draft">
                                        <h4>Quick draft</h4>
                                        <form className="form-inline">
                                          <div className="form-row align-items-center">
                                            <div className="col-auto" title='post title'>
                                              <label className="sr-only" htmlFor="title">Title</label>
                                              <input type="text" name='qtitle' className="form-control mb-2" placeholder="post title"/>
                                            </div>
                                            <div className="col-auto" title='post slug'>
                                              <label className="sr-only" htmlFor="slug">Slug</label>
                                              <input type="text" name='qslug' className="form-control mb-2" placeholder='post slug'/>
                                            </div>
                                            <div className="col-auto">
                                              <button type="submit" className="mb-2 btn btn-outline-secondary" onClick={ev=>saveDraft(ev, setSaving, url)}>
                                                    <ClipLoader
                                                        size={14}
                                                        color={"#333"}
                                                        loading={saving}
                                                    /> Save Draft
                                              </button>
                                            </div>
                                          </div>
                                        </form>
                                    </div>
                            }
                        </div>


                        {/*page content */}
                        <div className="page-content">
                            {props.children}
                        </div>

                    </main>
                </div>
            </div>

        </>
    );
}



const saveDraft = async (ev, setSaving, url) => {
    ev.preventDefault();

    let title = document.querySelector('input[name=qtitle]').value,
            slug = document.querySelector('input[name=qslug]').value;

    if (!title.length || !slug.length)
        return;

    // set SavingState
    setSaving(true);

    let res = await addPostToDB({
        slug,
        title,
        author: details.name,
        author_email: details.email
    }, true, url);

    if (res.success == true) {
        location.search = "?draft=1";
    } else {
        alert(JSON.stringify(res));
    }
    setSaving(false);
}




export default Header;
