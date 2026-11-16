const hostname = 'campus-common.pages.dev';

export default {
  fetch(request, env) {
    if (new URL(request.url).hostname !== hostname) {
      return new Response('Use the Campus Common production address.', { status: 404 });
    }
    if (!env.CAMPUS_APP) {
      return new Response('Campus Common is being configured.', { status: 503 });
    }
    return env.CAMPUS_APP.fetch(request);
  },
};
