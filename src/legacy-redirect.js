// Keep competition bookmarks working after the Campus Common hostname change.
// The separate CDS Worker is not a redirect target and must not be deployed here.
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.hostname = 'campus-common.campus-companion.workers.dev';
    url.port = '';
    return new Response(null, {
      status: 307,
      headers: {Location: url.href, 'Cache-Control': 'no-store'},
    });
  },
};
