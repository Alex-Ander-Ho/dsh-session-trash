# dsh-session-trash

A **trash / recycle bin for sessions** in DeepSeek Harness (DSH).

Sessions pile up in the sidebar. This plugin gives you a trash can: move a
session out of the way with one click (or a drag), keep it restorable for a
while, and let the expired trash clean itself up after **5 days**.

The UI is localized for **Russian, English, and Simplified Chinese** and follows
the active DSH locale.

## Features

- **Trash button right on the row.** Hovering a session row in the sidebar shows
  a trash icon between the “…” menu and the built-in Archive button (slot
  `sidebar.workspaces.session.row.action`, `order: 50`). One click moves the
  session to the trash — no confirmation, as expected for a reversible action.
- **Drag and drop.** Drag any session row from the sidebar onto the panel’s
  “Drop a session here” zone to move it to the trash.
- **Hidden from the sidebar.** The trash is backed by DSH’s native archive
  (`workspaces.archiveSession`), so trashed sessions disappear from the default
  sidebar view. Restoring unarchives them (`workspaces.unarchiveSession`) and
  returns them to their original position.
- **Bulk actions.** Tick sessions (or “select all”) and move them to the trash;
  the “Move all chats to trash” button clears the whole list.
- **5-day countdown.** Every session trashed from this panel shows when it was
  moved and how much of its retention window is left. Once the window expires
  the session is deleted permanently: its stored log directory is removed.
- **Confirmations where they matter.** Permanent deletion (“Delete forever”,
  “Delete selected”, “Empty trash”) always asks for confirmation. Moving to the
  trash does not — it is reversible.
- **Safety guards.** Running sessions are never stopped silently: DSH refuses to
  archive a session with active work, and the panel tells you to stop it first.
  Sessions archived through DSH’s own menu are shown in the trash too, but are
  marked “DSH archive” and never auto-delete.

## How it works

The bundle has two halves:

| File | Side | Purpose |
| --- | --- | --- |
| `index.js` | host (Node) | Registers a private `POST /api/session-trash/delete` route through the Connection service and erases a session’s stored log directory (`rm`). The route only accepts sessions that are archived and not live. |
| `client.js` | browser | The panel, the sidebar entry, the row trash button, and a shared toast. Reads `sessions.list` (titles, last activity) and `workspaces.list` (`archivedSessionIds`); archive/restore go through the public `ctx.get('workspaces')` methods. Trash timestamps live in `localStorage` under `dsh.session-trash.v1`. |

The host half registers its route through `ctx.inject(['connection'], …)` and
never blocks the profile: any registration failure is only logged.

Permanent deletion uses public host services only: `sessionPersistence.stat`
(the log directory), `workspaceRegistry.archivedSessionIds` (refuses live
sessions), and `workspaceRegistry.unarchiveSession` / `unpinSession` (drops the
stale bookkeeping after the files are gone).

## Installation

The plugin is a DSH bundle: `package.json` → `dsh.bundle.patch` →
`cordis.patch.yml` inserts the `session-trash` row, and `dsh.client` attaches
the browser half.

Copy the bundle into your DSH profile and add it to the profile manifest:

```jsonc
// <profile>/package.json
{
  "dependencies": {
    "dsh-session-trash": "file:/absolute/path/to/dsh-session-trash"
  },
  "dsh": {
    "profile": {
      "bundles": ["dsh-session-trash"] // append to your existing bundle list
    }
  }
}
```

Then install the dependency with the profile’s package manager (pnpm) and
restart DeepSeek Harness. The browser half reloads with a window refresh; the
host half (the delete route) loads only on application start.

## Limitations

- Permanent deletion requires the host half. If it did not load, the panel shows
  a warning and archived sessions stay hidden but not erased.
- The countdown is stored in browser `localStorage`: clearing site data resets
  the remaining time for already-trashed sessions.
- The countdown and auto-deletion apply only to sessions trashed **from this
  panel**. Sessions archived through DSH’s own menu stay restorable indefinitely
  and are never removed automatically.

## Development

- `client.js` is loaded by the DSH client module loader
  (`window.__ModuleLoader__.load`), so it is plain browser JavaScript: React via
  `require('react')`, no build step.
- `index.js` is a normal ESM host plugin that exports `apply(ctx)`.

## License

MIT — see [LICENSE](LICENSE).
