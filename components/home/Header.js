const Icon = (props) => {
    const iconURL = {
        // github: "https://img.icons8.com/dusk/21/000000/github.png",
        github: "/icons/github.png",
        twitter: "/icons/twitter.png",
        linkedin: "/icons/linkedin.png",
        "résumé": "/icons/resume.png",
        "rss feed": "/icons/rss.png",
    };
    const size = 30;
    return (
        <a className='no-bg-color profile-link' title={props.name} href={props.url} rel="noreferrer" target={props.blank && "_blank"}>
            <img style={{width:`${size}px`, height: `${size}px`}} src={iconURL[props.name]} alt={props.name} />
        </a>
    );
}


const Header = (props) => {
    const p = props.details;
    const {links} = p;

    return (
        <div className='home-header mb-5'>
            <h1 className='site-name mb-2'> {p.name} </h1>
            <div className='ml-2'>
                <table className='mb-2' cellPadding='3'>
                    <tbody>
                        <tr>
                            <td> <Icon url={links.github} name='github' blank={true}/> </td>
                            <td> <Icon url={links.twitter} name='twitter' blank={true}/> </td>
                            <td> <Icon url={links.linkedin} name='linkedin'/> </td>
                            <td> <Icon url={links.resume} name='résumé'/> </td>
                            <td className='hidden'></td>
                            <td className='hidden'></td>
                            <td className='hidden'></td>
                            <td><Icon url={links.rss_url} name='rss feed'/> </td>
                        </tr>
                    </tbody>
                </table>
                <span className='site-email'> <a href={"mailto:"+p.email} target='_blank'> {p.email} </a> </span>
            </div>
        </div>
    );

}

export default Header;