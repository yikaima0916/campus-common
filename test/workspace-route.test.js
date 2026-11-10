import test from 'node:test';
import assert from 'node:assert/strict';
import {WORKSPACE_VIEWS, workspaceRoute, workspaceUrl} from '../public/workspace-route.js';

test('all supported workspace links survive a sign-in reload', () => {
  for (const view of WORKSPACE_VIEWS) {
    const original = workspaceRoute('?view=' + view);
    assert.deepEqual(workspaceRoute(new URL(workspaceUrl(original), 'https://campus.example').search), {view});
  }
});

test('mail and task notification IDs survive encoding and take their own view', () => {
  for (const route of [
    {view: 'mail', message: 'mail+1 & a/b'},
    {view: 'tasks', task: 'task+1 & a/b'},
  ]) assert.deepEqual(workspaceRoute(new URL(workspaceUrl(route), 'https://campus.example').search), route);
  assert.deepEqual(workspaceRoute('?view=settings&task=task-1'), {view:'tasks', task:'task-1'});
  assert.deepEqual(workspaceRoute('?message=mail-1'), {view:'mail', message:'mail-1'});
});

test('unknown destinations cannot redirect sign-in to another site', () => {
  for (const search of ['', '?view=https://example.com', '?view=//example.com', '?next=https://example.com', '?task=&message=']) {
    assert.equal(workspaceRoute(search), null);
  }
});
