/**
 * Host half of the DSH Session Cleaner bundle.
 *
 * The browser half (`./client`) owns the sidebar entry, the trash panel, and
 * the archive bookkeeping: moving a Session to the trash archives it through
 * the public Workspace API, and restoring it unarchives it. This host half
 * provides the one operation the browser API does not expose — erasing an
 * archived Session's stored log once its retention window has passed.
 *
 * The route is registered through the Connection service (the same seam the
 * official Session export plugin uses), so the browser addresses it with a
 * document-relative URL and inherits the desktop session's authentication.
 */
import { rm } from 'node:fs/promises';
import { basename, dirname } from 'node:path';

/** Absolute registration path; the browser uses the document-relative form. */
const DELETE_ROUTE = '/api/session-trash/delete';

/** Session ids are opaque tokens; refuse anything path-shaped. */
const SESSION_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

/**
 * Wire the permanent-delete route once a Connection service exists.
 * @param ctx - host context of this plugin's Loader entry.
 */
export function apply(ctx) {
  // A private bundle must never break the profile: registration failures are
  // reported and the rest of the Host keeps starting.
  try {
    ctx.inject(['connection'], (scope) => {
      try {
        scope.effect(
          () => scope.connection.fetch.register({
            path: DELETE_ROUTE,
            methods: ['POST'],
            requestBody: 'buffered',
            fetch: (request) => deleteStoredSession(scope, request),
          }),
          'session-trash: permanent delete route',
        );
      } catch (error) {
        console.warn('[session-trash] could not register the delete route:', error);
      }
    });
  } catch (error) {
    console.warn('[session-trash] host half did not register:', error);
  }
}

/**
 * Erase one archived Session's stored log directory.
 *
 * The Session must be archived and must not be live: the archive gate is what
 * makes the deletion safe, because an archived Session cannot be resumed or
 * advanced. Registry bookkeeping is dropped afterwards so no stale entry
 * outlives the log.
 *
 * @param ctx - host context carrying the Session store, persistence, and registry.
 * @param request - authenticated buffered request with a JSON `sessionId` body.
 * @returns JSON acknowledgement, or a sanitized failure status.
 */
async function deleteStoredSession(ctx, request) {
  let sessionId = '';
  try {
    const body = await request.json();
    if (body !== null && typeof body === 'object' && typeof body.sessionId === 'string') sessionId = body.sessionId;
  } catch {
    return respond({ ok: false, error: 'invalid-request' }, 400);
  }
  if (!SESSION_ID_PATTERN.test(sessionId)) return respond({ ok: false, error: 'invalid-session-id' }, 400);

  const sessions = ctx.get('sessions');
  if (sessions !== undefined && sessions.get(sessionId) !== undefined) return respond({ ok: false, error: 'session-live' }, 409);

  const registry = ctx.get('workspaceRegistry');
  if (registry === undefined) return respond({ ok: false, error: 'registry-unavailable' }, 503);
  if (!registry.archivedSessionIds.includes(sessionId)) return respond({ ok: false, error: 'session-not-archived' }, 409);

  const persistence = ctx.get('sessionPersistence');
  if (persistence === undefined) return respond({ ok: false, error: 'persistence-unavailable' }, 503);

  let directory;
  try {
    const metadata = await persistence.stat(sessionId, { signal: request.signal });
    const location = metadata?.location?.path;
    if (typeof location === 'string' && location !== '') directory = dirname(location);
  } catch (error) {
    return respond({ ok: false, error: 'session-not-found', message: messageOf(error) }, 404);
  }
  if (directory === undefined || basename(directory) !== sessionId) {
    return respond({ ok: false, error: 'unexpected-location' }, 409);
  }

  try {
    await rm(directory, { recursive: true, force: true });
  } catch (error) {
    return respond({ ok: false, error: 'delete-failed', message: messageOf(error) }, 500);
  }

  try {
    await registry.unarchiveSession(sessionId);
    await registry.unpinSession(sessionId);
  } catch {
    // Best-effort: the stored log is the authoritative data; stale registry ids
    // are inert and are dropped on the next successful call.
  }

  return respond({ ok: true, sessionId });
}

/**
 * Build a small JSON response.
 * @param body - JSON-serializable payload.
 * @param status - HTTP status code.
 * @returns the response.
 */
function respond(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

/**
 * Render an error message without trusting its shape.
 * @param error - unknown thrown value.
 * @returns a displayable message.
 */
function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}
