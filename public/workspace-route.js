export const WORKSPACE_VIEWS = ['tasks', 'groups', 'mail', 'digests', 'settings'];

// Keep only known, same-origin workspace destinations across sign-in and reloads.
export function workspaceRoute(search) {
  const params = new URLSearchParams(search);
  const message = params.get('message');
  const task = params.get('task');
  if (message) return {view: 'mail', message};
  if (task) return {view: 'tasks', task};
  const view = params.get('view');
  return WORKSPACE_VIEWS.includes(view) ? {view} : null;
}

export function workspaceUrl(route) {
  const params = new URLSearchParams({view: route.view});
  if (route.message) params.set('message', route.message);
  else if (route.task) params.set('task', route.task);
  return '/?' + params;
}
