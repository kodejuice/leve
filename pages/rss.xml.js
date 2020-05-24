
export default function() {
    return <></>;
}

export async function getServerSideProps(ctx) {
    ctx.res.writeHead(302, { Location: 'api/rss.xml' });
    ctx.res.end();
    return {props: {}};
}

