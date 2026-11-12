window.__ModuleLoader__.load({
  id: 'dsh-session-trash',
  factory(require) {
    const React = require('react');
    const { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } = React;
    const h = React.createElement;

    const NS = 'session-trash';
    const PANEL_ID = 'session-trash';
    const STYLE_ID = 'dsh-session-trash/css';
    const TRASH_STORE_KEY = 'dsh.session-trash.v1';
    const AUTO_DELETE_MS = 5 * 24 * 60 * 60 * 1000;
    /** Document-relative form of the host route registered by ./index.js. */
    const DELETE_ROUTE = 'api/session-trash/delete';

    const CSS = `
.dshTr_page,.dshTr_page *{box-sizing:border-box}
.dshTr_page{position:relative;display:flex;flex-direction:column;width:100%;height:100%;min-width:0;min-height:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font-size:14px;line-height:1.6}
.dshTr_scroll{flex:1;min-height:0;overflow:auto;scrollbar-gutter:stable;--dsh-scrollbar-width:9px;--dsh-scrollbar-thumb-border:2px}
.dshTr_content{max-width:860px;margin:0 auto;padding:0 clamp(20px,4vw,44px) 56px;width:100%}
.dshTr_heading{padding-top:28px;margin-bottom:18px}
[data-platform=darwin] .dshTr_heading{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
.dshTr_heading h1{margin:0;font-size:20px;font-weight:500;line-height:28px}
.dshTr_subtitle{margin:4px 0 0;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.dshTr_dropzone{margin:0 0 22px;padding:18px 16px;border:1.5px dashed var(--dsw-alias-border-l2);border-radius:14px;background:var(--dsw-alias-bg-layer-1);text-align:center;transition:border-color .15s,background-color .15s}
.dshTr_dropzoneActive{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-bg-subtle)}
.dshTr_dropzoneTitle{margin:0;font-size:14px;font-weight:500;line-height:22px;color:var(--dsw-alias-label-secondary)}
.dshTr_dropzoneActive .dshTr_dropzoneTitle{color:var(--dsw-alias-label-primary)}
.dshTr_dropzoneHint{margin:4px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.dshTr_section{margin:22px 0 0}
.dshTr_sectionHead{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.dshTr_sectionTitle{margin:0;font-size:14px;font-weight:500;line-height:22px;color:var(--dsw-alias-label-secondary)}
.dshTr_count{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.dshTr_actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.dshTr_btn{height:30px;padding:0 12px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;cursor:pointer;transition:background-color .15s,border-color .15s}
@media (hover:hover){.dshTr_btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.dshTr_btn:disabled{opacity:.4;cursor:default}
.dshTr_btnPrimary{border-color:transparent;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font-weight:500}
@media (hover:hover){.dshTr_btnPrimary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}}
.dshTr_btnDanger{border-color:transparent;background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-foreground)}
@media (hover:hover){.dshTr_btnDanger:hover:not(:disabled){background:var(--dsw-alias-state-error-secondary,var(--dsw-alias-state-error-primary))}}
.dshTr_checkbox{flex:none;width:16px;height:16px;margin:0;accent-color:var(--dsw-alias-state-business-primary);cursor:pointer}
.dshTr_selectAll{display:inline-flex;align-items:center;gap:8px;cursor:pointer;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;user-select:none}
.dshTr_list{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
.dshTr_row{display:flex;align-items:center;gap:12px;padding:11px 13px;border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);transition:border-color .15s}
@media (hover:hover){.dshTr_row:hover{border-color:var(--dsw-alias-border-l1)}}
.dshTr_rowMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.dshTr_rowTitle{margin:0;font-size:14px;line-height:20px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshTr_rowMeta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.dshTr_rowMeta time{font-variant-numeric:tabular-nums}
.dshTr_badge{display:inline-flex;align-items:center;gap:4px;padding:0 8px;border-radius:9px;background:var(--dsw-alias-state-warn-tertiary,var(--dsw-alias-interactive-bg-hover));color:var(--dsw-alias-state-warn-label,var(--dsw-alias-label-secondary));font-size:11px;line-height:18px;white-space:nowrap}
.dshTr_badgeDanger{background:var(--dsw-alias-interactive-bg-hover-danger,var(--dsw-alias-interactive-bg-hover));color:var(--dsw-alias-state-error-primary)}
.dshTr_rowActions{display:flex;flex:none;gap:6px}
.dshTr_empty{margin:0;padding:22px 16px;border:.5px dashed var(--dsw-alias-border-l2);border-radius:12px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.dshTr_rowAction{display:inline-flex;flex:none;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm,6px);background:0 0;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background-color .15s,color .15s}
@media (hover:hover){.dshTr_rowAction:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.dshTr_rowAction:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.dshTr_toast{position:fixed;left:50%;bottom:28px;z-index:60;transform:translateX(-50%);display:flex;align-items:center;gap:10px;max-width:min(560px,calc(100vw - 48px));padding:9px 14px;border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);box-shadow:0 8px 24px var(--dsw-alias-shadow-1,rgba(0,0,0,.18));font-size:13px;line-height:20px}
.dshTr_toastError{border-color:var(--dsw-alias-state-error-primary)}
.dshTr_confirm{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--dsw-alias-overlay-1,rgba(0,0,0,.35))}
.dshTr_confirmBox{width:min(440px,100%);padding:20px;border-radius:16px;background:var(--dsw-alias-bg-layer-1);box-shadow:0 16px 48px var(--dsw-alias-shadow-2,rgba(0,0,0,.28))}
.dshTr_confirmTitle{margin:0 0 8px;font-size:16px;font-weight:500;line-height:24px}
.dshTr_confirmText{margin:0;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.dshTr_confirmActions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}
.dshTr_loading{margin:0;padding:28px 16px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:13px}
@media (width<=600px){.dshTr_rowActions .dshTr_btn{padding:0 9px}.dshTr_content{padding:0 14px 40px}}
`;

    const zh = {
      panel: '会话清理',
      rowTrash: '移入回收站',
      title: '会话清理',
      subtitle: '把不需要的会话拖入回收站。回收站中的会话会从侧边栏隐藏，{days} 天后自动删除，期间可以随时恢复。',
      loading: '正在读取会话…',
      sessionsTitle: '全部会话',
      sessionsCount: '共 {count} 个',
      trashTitle: '回收站',
      trashCount: '{count} 个会话',
      selectAll: '全选',
      selectedCount: '已选 {count} 个',
      toTrash: '移入回收站',
      toTrashSelected: '移入回收站',
      toTrashAll: '将所有会话移入回收站',
      dropzoneTitle: '把会话拖到这里',
      dropzoneHint: '松开鼠标即移入回收站；也可以在下方列表中勾选后点击「移入回收站」。',
      dropzoneActive: '松开即可移入回收站',
      trashEmptyTitle: '回收站是空的',
      trashEmptyHint: '被移入回收站的会话会出现在这里，并在 {days} 天后自动删除。',
      sessionUntitled: '未命名会话',
      runningBadge: '正在运行',
      nativeArchiveBadge: 'DSH 归档',
      archivedAt: '移入时间 {time}',
      remaining: '剩余 {days} 天 {hours} 小时',
      remainingHours: '剩余 {hours} 小时',
      restore: '恢复',
      restoreSelected: '恢复所选',
      deleteForever: '永久删除',
      clearTrash: '清空回收站',
      confirmDeleteTitle: '永久删除所选会话？',
      confirmDeleteText: '会话记录会从本机彻底删除，且无法恢复。',
      confirmClearTrashTitle: '清空回收站？',
      confirmClearTrashText: '回收站中的 {count} 个会话将被永久删除，且无法恢复。',
      cancel: '取消',
      confirm: '确定',
      archivedToast: '会话已移入回收站',
      unarchivedToast: '会话已恢复',
      deletedToast: '已永久删除',
      autoDeletedToast: '已自动删除 {count} 个过期会话',
      alreadyTrashedToast: '这个会话已在回收站中',
      sessionActiveToast: '会话仍在运行：请先停止它，再移入回收站',
      archiveFailedToast: '无法移入回收站：{message}',
      unarchiveFailedToast: '无法恢复会话：{message}',
      deleteFailedToast: '无法删除会话：{message}',
      deleteUnavailableToast: '永久删除不可用：插件的主机端没有加载',
      storageFailedToast: '浏览器存储不可用，倒计时将在重新载入后重置',
    };

    const en = {
      panel: 'Session cleaner',
      rowTrash: 'Move to trash',
      title: 'Session cleaner',
      subtitle: 'Move unneeded sessions to the trash. Trashed sessions are hidden from the sidebar and deleted automatically after {days} days; restore them any time before that.',
      loading: 'Reading sessions…',
      sessionsTitle: 'All sessions',
      sessionsCount: '{count} total',
      trashTitle: 'Trash',
      trashCount: '{count} sessions',
      selectAll: 'Select all',
      selectedCount: '{count} selected',
      toTrash: 'Move to trash',
      toTrashSelected: 'Move to trash',
      toTrashAll: 'Move all sessions to trash',
      dropzoneTitle: 'Drop sessions here',
      dropzoneHint: 'Release to move a session to the trash, or tick sessions in the list below and use “Move to trash”.',
      dropzoneActive: 'Release to move to trash',
      trashEmptyTitle: 'The trash is empty',
      trashEmptyHint: 'Sessions moved to the trash show up here and are deleted automatically after {days} days.',
      sessionUntitled: 'Untitled session',
      runningBadge: 'Running',
      nativeArchiveBadge: 'DSH archive',
      archivedAt: 'Trashed {time}',
      remaining: '{days} d {hours} h left',
      remainingHours: '{hours} h left',
      restore: 'Restore',
      restoreSelected: 'Restore selected',
      deleteForever: 'Delete permanently',
      clearTrash: 'Empty trash',
      confirmDeleteTitle: 'Permanently delete the selected sessions?',
      confirmDeleteText: 'The session logs are erased from this machine and cannot be recovered.',
      confirmClearTrashTitle: 'Empty the trash?',
      confirmClearTrashText: 'The {count} trashed sessions will be permanently deleted and cannot be recovered.',
      cancel: 'Cancel',
      confirm: 'Confirm',
      archivedToast: 'Session moved to the trash',
      unarchivedToast: 'Session restored',
      deletedToast: 'Permanently deleted',
      autoDeletedToast: '{count} expired sessions deleted automatically',
      alreadyTrashedToast: 'This session is already in the trash',
      sessionActiveToast: 'The session is still running: stop it before moving it to the trash',
      archiveFailedToast: 'Could not move to the trash: {message}',
      unarchiveFailedToast: 'Could not restore the session: {message}',
      deleteFailedToast: 'Could not delete the session: {message}',
      deleteUnavailableToast: 'Permanent deletion is unavailable: the plugin host half is not loaded',
      storageFailedToast: 'Browser storage is unavailable; countdowns reset on reload',
    };

    const ru = {
      panel: 'Корзина сессий',
      rowTrash: 'Убрать в корзину',
      title: 'Корзина сессий',
      subtitle: 'Перетащите ненужные сессии в корзину. Сессии из корзины скрываются из боковой панели, удаляются автоматически через {days} дней и до этого момента их можно восстановить.',
      loading: 'Загружаем сессии…',
      sessionsTitle: 'Все сессии',
      sessionsCount: 'Всего: {count}',
      trashTitle: 'Корзина',
      trashCount: 'Сессий: {count}',
      selectAll: 'Выбрать все',
      selectedCount: 'Выбрано: {count}',
      toTrash: 'В корзину',
      toTrashSelected: 'Удалить выбранные',
      toTrashAll: 'Удалить все чаты',
      dropzoneTitle: 'Перетащите сессию сюда',
      dropzoneHint: 'Отпустите, чтобы убрать её в корзину. Или отметьте сессии в списке ниже и нажмите «Удалить выбранные».',
      dropzoneActive: 'Отпустите, чтобы убрать в корзину',
      trashEmptyTitle: 'Корзина пуста',
      trashEmptyHint: 'Сессии, убранные в корзину, появятся здесь и будут удалены автоматически через {days} дней.',
      sessionUntitled: 'Сессия без названия',
      runningBadge: 'Выполняется',
      nativeArchiveBadge: 'Архив DSH',
      archivedAt: 'В корзине с {time}',
      remaining: 'Осталось {days} дн. {hours} ч.',
      remainingHours: 'Осталось {hours} ч.',
      restore: 'Восстановить',
      restoreSelected: 'Восстановить выбранные',
      deleteForever: 'Удалить навсегда',
      clearTrash: 'Очистить корзину',
      confirmDeleteTitle: 'Удалить выбранные сессии навсегда?',
      confirmDeleteText: 'Журналы сессий будут стёрты с этого компьютера без возможности восстановления.',
      confirmClearTrashTitle: 'Очистить корзину?',
      confirmClearTrashText: 'Все сессии в корзине ({count}) будут удалены навсегда без возможности восстановления.',
      cancel: 'Отмена',
      confirm: 'Подтвердить',
      archivedToast: 'Сессия убрана в корзину',
      unarchivedToast: 'Сессия восстановлена',
      deletedToast: 'Удалено навсегда',
      autoDeletedToast: 'Автоматически удалено просроченных сессий: {count}',
      alreadyTrashedToast: 'Эта сессия уже в корзине',
      sessionActiveToast: 'Сессия ещё выполняется: остановите её, чтобы убрать в корзину',
      archiveFailedToast: 'Не удалось убрать в корзину: {message}',
      unarchiveFailedToast: 'Не удалось восстановить сессию: {message}',
      deleteFailedToast: 'Не удалось удалить сессию: {message}',
      deleteUnavailableToast: 'Постоянное удаление недоступно: хост-часть плагина не загружена',
      storageFailedToast: 'Хранилище браузера недоступно, отсчёт сбросится после перезагрузки',
    };

    /** Render a timestamp the way the surrounding UI does. */
    function formatWhen(timestamp) {
      try {
        return new Intl.DateTimeFormat(undefined, {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(timestamp));
      } catch {
        try {
          return new Date(timestamp).toLocaleString();
        } catch {
          return '';
        }
      }
    }

    /** A message from an unknown thrown value. */
    function messageOf(error) {
      return error instanceof Error ? error.message : String(error);
    }

    function TrashGlyph({ size = 22 }) {
      return h('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      }, [
        h('path', { key: 'lid', d: 'M3 6h18' }),
        h('path', { key: 'body', d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' }),
        h('path', { key: 'handle', d: 'M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2' }),
        h('path', { key: 'bar', d: 'M10 11v6M14 11v6' }),
      ]);
    }

    function apply(ctx) {
      const t = ctx.locale.bind(NS);
      const workspaces = ctx.get('workspaces');
      const sessions = ctx.get('sessions');

      if (workspaces === undefined || sessions === undefined) {
        ctx.effect(() => {
          console.warn('[session-trash] required client services are missing; the panel will not mount');
        }, 'session-trash: missing services');
        return;
      }

      const workspaceStore = workspaces.list;
      const sessionStore = sessions.list;

      const readTimestamps = () => {
        try {
          const raw = window.localStorage.getItem(TRASH_STORE_KEY);
          if (raw === null) return {};
          const parsed = JSON.parse(raw);
          if (parsed === null || typeof parsed !== 'object') return {};
          const result = {};
          for (const [id, value] of Object.entries(parsed)) {
            if (typeof value === 'number' && Number.isFinite(value)) result[id] = value;
          }
          return result;
        } catch {
          return {};
        }
      };

      const writeTimestamps = (map) => {
        try {
          window.localStorage.setItem(TRASH_STORE_KEY, JSON.stringify(map));
          return true;
        } catch {
          return false;
        }
      };

      /** Remember that this panel's trash owns these ids (and their countdown). */
      const stampTrash = (ids) => {
        const current = readTimestamps();
        const stamped = Date.now();
        let changed = false;
        for (const id of ids) {
          if (current[id] === undefined) {
            current[id] = stamped;
            changed = true;
          }
        }
        if (!changed) return true;
        return writeTimestamps(current);
      };

      // One toast surface shared by the panel and the Session-row button: the
      // `shell.overlay` entry below renders whatever this store holds.
      let toastState = null;
      let toastTimer = null;
      const toastListeners = new Set();
      const toastStore = {
        getSnapshot: () => toastState,
        subscribe: (listener) => {
          toastListeners.add(listener);
          return () => {
            toastListeners.delete(listener);
          };
        },
      };
      const publishToast = () => {
        for (const listener of toastListeners) listener();
      };
      const notify = (text, tone = 'info') => {
        toastState = { text, tone, seq: (toastState?.seq ?? 0) + 1 };
        publishToast();
        if (toastTimer !== null) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          toastTimer = null;
          toastState = null;
          publishToast();
        }, 4000);
      };
      ctx.effect(() => () => {
        if (toastTimer !== null) {
          clearTimeout(toastTimer);
          toastTimer = null;
        }
        toastListeners.clear();
      }, 'session-trash: toast lifetime');

      const requestDelete = async (sessionId) => {
        let response;
        try {
          response = await fetch(new URL(DELETE_ROUTE, document.baseURI), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
        } catch (error) {
          return { ok: false, error: 'network', message: messageOf(error) };
        }
        let payload = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }
        if (payload !== null && payload.ok === true) return { ok: true };
        if (payload !== null && typeof payload.error === 'string') {
          // A log that is already gone needs no further deletion: dropping the
          // archive entry is all that remains.
          if (payload.error === 'session-not-found') {
            try {
              await workspaces.unarchiveSession(sessionId);
            } catch {
              // The entry is stale either way; the next feed frame settles it.
            }
            return { ok: true, alreadyGone: true };
          }
          return { ok: false, error: payload.error, message: payload.message };
        }
        // No JSON body means this Harness has no delete route registered yet.
        return { ok: false, error: 'route-unavailable' };
      };

      const archiveSessions = async (ids) => {
        const results = [];
        for (const id of ids) {
          try {
            await workspaces.archiveSession(id);
            results.push({ id, ok: true });
          } catch (error) {
            // A Session still running refuses the archive: the native UI asks to
            // stop it first. The panel has no confirmation dialog here any more,
            // so the refusal is reported instead of silently stopping the work.
            const active = error?.rpcError?.code === 'workspace/session-active';
            results.push({ id, ok: false, active, message: messageOf(error) });
          }
        }
        return results;
      };

      const unarchiveSessions = async (ids) => {
        const results = [];
        for (const id of ids) {
          try {
            await workspaces.unarchiveSession(id);
            results.push({ id, ok: true });
          } catch (error) {
            results.push({ id, ok: false, message: messageOf(error) });
          }
        }
        return results;
      };

      /** One-click trash from the Session row's hover actions. */
      const trashFromRow = (sessionId) => {
        void (async () => {
          try {
            await workspaces.archiveSession(sessionId);
          } catch (error) {
            const active = error?.rpcError?.code === 'workspace/session-active';
            notify(active ? t('sessionActiveToast') : t('archiveFailedToast', { message: messageOf(error) }), 'error');
            return;
          }
          const stamped = stampTrash([sessionId]);
          notify(stamped ? t('archivedToast') : t('storageFailedToast'), stamped ? 'success' : 'error');
        })();
      };

      /** `sidebar.workspaces.session.row.action` occupant: trash icon between the menu and Archive. */
      function TrashRowButton({ sessionId, useArchived, useSessionAccess, trashSession, t }) {
        // Injected and standard Hooks run unconditionally so hook order never
        // depends on the row's current state.
        const archived = useArchived((ids) => Array.isArray(ids) && ids.includes(sessionId));
        const allowed = typeof useSessionAccess === 'function' ? useSessionAccess(sessionId, 'workspace/archiveSession') : true;
        if (archived || !allowed) return null;
        return h('button', {
          type: 'button',
          className: 'dshTr_rowAction',
          'aria-label': t('rowTrash'),
          title: t('rowTrash'),
          onClick: (event) => {
            event.stopPropagation();
            trashSession(sessionId);
          },
        }, h(TrashGlyph, { size: 14 }));
      }

      /** `shell.overlay` occupant: the single toast surface for panel and row actions. */
      function ToastOverlay({ useRowToast }) {
        const toast = useRowToast((state) => state);
        if (toast === null) return null;
        return h('div', {
          className: `dshTr_toast${toast.tone === 'error' ? ' dshTr_toastError' : ''}`,
          role: 'status',
        }, toast.text);
      }

      function SessionCleanerPanel() {
        const subscribeWorkspaces = useCallback((listener) => workspaceStore.subscribe(listener), []);
        const getWorkspaceSnapshot = useCallback(() => workspaceStore.getSnapshot(), []);
        const workspaceSnapshot = useSyncExternalStore(subscribeWorkspaces, getWorkspaceSnapshot, getWorkspaceSnapshot);

        const subscribeSessions = useCallback((listener) => sessionStore.subscribe(listener), []);
        const getSessionSnapshot = useCallback(() => sessionStore.getSnapshot(), []);
        const sessionSnapshot = useSyncExternalStore(subscribeSessions, getSessionSnapshot, getSessionSnapshot);

        const archivedIds = workspaceSnapshot.archivedSessionIds;
        const archivedSet = useMemo(() => new Set(archivedIds), [archivedIds]);
        const byId = sessionSnapshot.byId;
        const orderedIds = sessionSnapshot.ids;

        const [selected, setSelected] = useState(() => new Set());
        const [trashSelected, setTrashSelected] = useState(() => new Set());
        const [timestamps, setTimestamps] = useState(readTimestamps);
        const [now, setNow] = useState(() => Date.now());
        const [dragging, setDragging] = useState(false);
        const [busy, setBusy] = useState(false);
        const [confirm, setConfirm] = useState(null);
        const sweeping = useRef(new Set());
        const unavailableNotified = useRef(false);

        const reportDeleteFailure = useCallback((result) => {
          if (result.error === 'route-unavailable') {
            if (unavailableNotified.current) return;
            unavailableNotified.current = true;
            notify(t('deleteUnavailableToast'), 'error');
            return;
          }
          notify(t('deleteFailedToast', { message: result.message ?? result.error }), 'error');
        }, [t]);

        useEffect(() => {
          const timer = setInterval(() => setNow(Date.now()), 30000);
          return () => clearInterval(timer);
        }, []);

        // Only sessions this panel trashed carry a countdown. A session archived
        // through the native DSH menu is shown in the trash but never expires on
        // its own — this plugin must not shorten the native archive lifetime.
        useEffect(() => {
          const current = readTimestamps();
          const archived = new Set(archivedIds);
          let changed = false;
          for (const id of Object.keys(current)) {
            if (!archived.has(id)) {
              delete current[id];
              changed = true;
            }
          }
          if (changed) writeTimestamps(current);
          setTimestamps(current);
        }, [archivedIds]);

        useEffect(() => {
          const due = archivedIds.filter((id) => {
            const at = timestamps[id];
            return at !== undefined && at + AUTO_DELETE_MS <= now && !sweeping.current.has(id);
          });
          if (due.length === 0) return undefined;
          let cancelled = false;
          const run = async () => {
            let deleted = 0;
            for (const id of due) {
              if (cancelled) return;
              sweeping.current.add(id);
              try {
                const result = await requestDelete(id);
                if (result.ok) deleted += 1;
                else if (!cancelled) reportDeleteFailure(result);
              } finally {
                sweeping.current.delete(id);
              }
            }
            if (!cancelled && deleted > 0) notify(t('autoDeletedToast', { count: deleted }), 'success');
          };
          void run();
          return () => {
            cancelled = true;
          };
        }, [archivedIds, timestamps, now, notify, reportDeleteFailure, t]);

        const summaries = orderedIds.filter((id) => byId[id] !== undefined && byId[id].origin !== 'subagent' && byId[id].blank !== true);
        const visibleIds = summaries.filter((id) => !archivedSet.has(id));
        const trashRows = archivedIds.map((id) => ({ id, summary: byId[id] }));
        const trashCount = trashRows.length;

        const summaryOf = (id) => byId[id];
        const titleOf = (id) => {
          const summary = summaryOf(id);
          return summary?.displayTitle !== undefined && summary.displayTitle !== '' ? summary.displayTitle : summary?.title !== undefined && summary.title !== '' ? summary.title : t('sessionUntitled');
        };
        const timeOf = (id) => {
          const summary = summaryOf(id);
          const value = summary?.updatedAt ?? 0;
          return value > 0 ? value : undefined;
        };

        const remainingOf = (id) => {
          const at = timestamps[id];
          if (at === undefined) return null;
          const left = at + AUTO_DELETE_MS - now;
          if (left <= 0) return { expired: true, days: 0, hours: 0 };
          const days = Math.floor(left / (24 * 60 * 60 * 1000));
          const hours = Math.floor((left % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
          return { expired: false, days, hours };
        };

        const remainingLabel = (id) => {
          const remaining = remainingOf(id);
          if (remaining === null || remaining.expired) return null;
          if (remaining.days > 0) return t('remaining', { days: remaining.days, hours: remaining.hours });
          return t('remainingHours', { hours: Math.max(remaining.hours, 1) });
        };

        const archiveIds = async (ids, doneMessage) => {
          if (ids.length === 0) return;
          setBusy(true);
          try {
            const results = await archiveSessions(ids);
            const failed = results.filter((result) => !result.ok);
            const succeeded = results.filter((result) => result.ok).map((result) => result.id);
            if (succeeded.length > 0) {
              if (!stampTrash(succeeded)) notify(t('storageFailedToast'), 'error');
              setTimestamps(readTimestamps());
            }
            if (failed.length === 0) {
              notify(doneMessage ?? t('archivedToast'), 'success');
            } else if (failed.every((result) => result.active === true)) {
              notify(t('sessionActiveToast'), 'error');
            } else {
              notify(t('archiveFailedToast', { message: failed[0].message ?? '' }), 'error');
            }
            setSelected(new Set());
          } finally {
            setBusy(false);
          }
        };

        const handleArchiveOne = (id) => {
          if (archivedSet.has(id)) {
            notify(t('alreadyTrashedToast'));
            return;
          }
          void archiveIds([id], t('archivedToast'));
        };

        const handleArchiveSelected = () => {
          const ids = [...selected].filter((id) => !archivedSet.has(id));
          if (ids.length === 0) return;
          void archiveIds(ids, t('archivedToast'));
        };

        const handleArchiveAll = () => {
          if (visibleIds.length === 0) return;
          void archiveIds(visibleIds, t('archivedToast'));
        };

        const handleRestore = async (ids) => {
          if (ids.length === 0) return;
          setBusy(true);
          try {
            const results = await unarchiveSessions(ids);
            const failed = results.filter((result) => !result.ok);
            if (failed.length === 0) notify(t('unarchivedToast'), 'success');
            else notify(t('unarchiveFailedToast', { message: failed[0].message ?? '' }), 'error');
            setTrashSelected(new Set());
          } finally {
            setBusy(false);
          }
        };

        const deleteIds = async (ids) => {
          if (ids.length === 0) return;
          setBusy(true);
          try {
            let deleted = 0;
            for (const id of ids) {
              const result = await requestDelete(id);
              if (result.ok) {
                deleted += 1;
                continue;
              }
              reportDeleteFailure(result);
              return;
            }
            if (deleted > 0) notify(t('deletedToast'), 'success');
            setTrashSelected(new Set());
          } finally {
            setBusy(false);
          }
        };

        const handleDeleteSelected = () => {
          const ids = [...trashSelected];
          if (ids.length === 0) return;
          setConfirm({
            title: t('confirmDeleteTitle'),
            text: t('confirmDeleteText'),
            confirmLabel: t('confirm'),
            danger: true,
            action: () => void deleteIds(ids),
          });
        };

        const handleClearTrash = () => {
          if (trashCount === 0) return;
          setConfirm({
            title: t('confirmClearTrashTitle'),
            text: t('confirmClearTrashText', { count: trashCount }),
            confirmLabel: t('confirm'),
            danger: true,
            action: () => void deleteIds(archivedIds.slice()),
          });
        };

        const handleDragOver = (event) => {
          event.preventDefault();
          if (event.dataTransfer !== null) event.dataTransfer.dropEffect = 'move';
          if (!dragging) setDragging(true);
        };

        const handleDragLeave = (event) => {
          const next = event.relatedTarget;
          if (next === null || !(event.currentTarget instanceof Node) || !event.currentTarget.contains(next)) setDragging(false);
        };

        const handleDrop = (event) => {
          event.preventDefault();
          setDragging(false);
          const transfer = event.dataTransfer;
          if (transfer === null) return;
          const id = transfer.getData('text/plain') || transfer.getData('text/session-id');
          if (id === '' || byId[id] === undefined) return;
          handleArchiveOne(id);
        };

        const toggleSelected = (id) => {
          setSelected((previous) => {
            const next = new Set(previous);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
        };

        const toggleTrashSelected = (id) => {
          setTrashSelected((previous) => {
            const next = new Set(previous);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
        };

        const toggleSelectAll = () => {
          setSelected((previous) => (previous.size === visibleIds.length ? new Set() : new Set(visibleIds)));
        };

        const toggleTrashSelectAll = () => {
          setTrashSelected((previous) => (previous.size === trashCount ? new Set() : new Set(archivedIds)));
        };

        const phase = sessionSnapshot.phase;
        const allSelected = visibleIds.length > 0 && selected.size === visibleIds.length;
        const allTrashSelected = trashCount > 0 && trashSelected.size === trashCount;

        const renderRow = (id) => {
          const summary = summaryOf(id);
          const checked = selected.has(id);
          const running = summary?.running === true;
          const updatedAt = timeOf(id);
          return h('li', { key: id, className: 'dshTr_row' }, [
            h('input', {
              key: 'check',
              type: 'checkbox',
              className: 'dshTr_checkbox',
              checked,
              'aria-label': titleOf(id),
              onChange: () => toggleSelected(id),
            }),
            h('div', { key: 'main', className: 'dshTr_rowMain' }, [
              h('p', { key: 'title', className: 'dshTr_rowTitle', title: titleOf(id) }, titleOf(id)),
              h('div', { key: 'meta', className: 'dshTr_rowMeta' }, [
                updatedAt === undefined ? null : h('time', {
                  key: 'time',
                  dateTime: new Date(updatedAt).toISOString(),
                }, formatWhen(updatedAt)),
                running ? h('span', { key: 'running', className: 'dshTr_badge' }, t('runningBadge')) : null,
              ]),
            ]),
            h('div', { key: 'actions', className: 'dshTr_rowActions' }, [
              h('button', {
                key: 'trash',
                type: 'button',
                className: 'dshTr_btn',
                onClick: () => handleArchiveOne(id),
              }, t('toTrash')),
            ]),
          ]);
        };

        const renderTrashRow = ({ id, summary }) => {
          const checked = trashSelected.has(id);
          const remaining = remainingLabel(id);
          const archivedAt = timestamps[id];
          return h('li', { key: id, className: 'dshTr_row' }, [
            h('input', {
              key: 'check',
              type: 'checkbox',
              className: 'dshTr_checkbox',
              checked,
              'aria-label': titleOf(id),
              onChange: () => toggleTrashSelected(id),
            }),
            h('div', { key: 'main', className: 'dshTr_rowMain' }, [
              h('p', { key: 'title', className: 'dshTr_rowTitle', title: titleOf(id) }, titleOf(id)),
              h('div', { key: 'meta', className: 'dshTr_rowMeta' }, [
                archivedAt === undefined
                  ? h('span', { key: 'native', className: 'dshTr_badge' }, t('nativeArchiveBadge'))
                  : h('span', { key: 'at' }, t('archivedAt', { time: formatWhen(archivedAt) })),
                remaining === null ? null : h('span', { key: 'left', className: 'dshTr_badge dshTr_badgeDanger' }, remaining),
              ]),
            ]),
            h('div', { key: 'actions', className: 'dshTr_rowActions' }, [
              h('button', {
                key: 'restore',
                type: 'button',
                className: 'dshTr_btn',
                onClick: () => void handleRestore([id]),
              }, t('restore')),
              h('button', {
                key: 'delete',
                type: 'button',
                className: 'dshTr_btn dshTr_btnDanger',
                onClick: () => {
                  setConfirm({
                    title: t('confirmDeleteTitle'),
                    text: t('confirmDeleteText'),
                    confirmLabel: t('confirm'),
                    danger: true,
                    action: () => void deleteIds([id]),
                  });
                },
              }, t('deleteForever')),
            ]),
          ]);
        };

        try {
          return h('div', { className: 'dshTr_page' }, [
          h('div', { key: 'scroll', className: 'dshTr_scroll' }, [
            h('div', { key: 'content', className: 'dshTr_content' }, [
              h('header', { key: 'heading', className: 'dshTr_heading' }, [
                h('h1', { key: 'title' }, t('title')),
                h('p', { key: 'subtitle', className: 'dshTr_subtitle' }, t('subtitle', { days: 5 })),
              ]),

              h('div', {
                key: 'dropzone',
                className: `dshTr_dropzone${dragging ? ' dshTr_dropzoneActive' : ''}`,
                onDragOver: handleDragOver,
                onDragEnter: handleDragOver,
                onDragLeave: handleDragLeave,
                onDrop: handleDrop,
              }, [
                h('p', { key: 'title', className: 'dshTr_dropzoneTitle' }, dragging ? t('dropzoneActive') : t('dropzoneTitle')),
                h('p', { key: 'hint', className: 'dshTr_dropzoneHint' }, t('dropzoneHint')),
              ]),

              h('section', { key: 'trash', className: 'dshTr_section' }, [
                h('div', { key: 'head', className: 'dshTr_sectionHead' }, [
                  h('div', { key: 'left', className: 'dshTr_actions' }, [
                    h('h2', { key: 'title', className: 'dshTr_sectionTitle' }, t('trashTitle')),
                    h('span', { key: 'count', className: 'dshTr_count' }, t('trashCount', { count: trashCount })),
                  ]),
                  h('div', { key: 'right', className: 'dshTr_actions' }, [
                    h('label', { key: 'select', className: 'dshTr_selectAll' }, [
                      h('input', {
                        key: 'check',
                        type: 'checkbox',
                        className: 'dshTr_checkbox',
                        checked: allTrashSelected,
                        disabled: trashCount === 0,
                        onChange: toggleTrashSelectAll,
                      }),
                      trashSelected.size === 0 ? t('selectAll') : t('selectedCount', { count: trashSelected.size }),
                    ]),
                    h('button', {
                      key: 'restore-selected',
                      type: 'button',
                      className: 'dshTr_btn',
                      disabled: trashSelected.size === 0 || busy,
                      onClick: () => void handleRestore([...trashSelected]),
                    }, t('restoreSelected')),
                    h('button', {
                      key: 'delete-selected',
                      type: 'button',
                      className: 'dshTr_btn dshTr_btnDanger',
                      disabled: trashSelected.size === 0 || busy,
                      onClick: handleDeleteSelected,
                    }, t('deleteForever')),
                    h('button', {
                      key: 'clear',
                      type: 'button',
                      className: 'dshTr_btn',
                      disabled: trashCount === 0 || busy,
                      onClick: handleClearTrash,
                    }, t('clearTrash')),
                  ]),
                ]),
                trashCount === 0
                  ? h('p', { key: 'empty', className: 'dshTr_empty' }, [
                      h('strong', { key: 'strong' }, t('trashEmptyTitle')),
                      h('br', { key: 'br' }),
                      t('trashEmptyHint', { days: 5 }),
                    ])
                  : h('ul', { key: 'list', className: 'dshTr_list' }, trashRows.map(renderTrashRow)),
              ]),

              h('section', { key: 'sessions', className: 'dshTr_section' }, [
                h('div', { key: 'head', className: 'dshTr_sectionHead' }, [
                  h('div', { key: 'left', className: 'dshTr_actions' }, [
                    h('h2', { key: 'title', className: 'dshTr_sectionTitle' }, t('sessionsTitle')),
                    h('span', { key: 'count', className: 'dshTr_count' }, t('sessionsCount', { count: visibleIds.length })),
                  ]),
                  h('div', { key: 'right', className: 'dshTr_actions' }, [
                    h('label', { key: 'select', className: 'dshTr_selectAll' }, [
                      h('input', {
                        key: 'check',
                        type: 'checkbox',
                        className: 'dshTr_checkbox',
                        checked: allSelected,
                        disabled: visibleIds.length === 0,
                        onChange: toggleSelectAll,
                      }),
                      selected.size === 0 ? t('selectAll') : t('selectedCount', { count: selected.size }),
                    ]),
                    h('button', {
                      key: 'archive-selected',
                      type: 'button',
                      className: 'dshTr_btn dshTr_btnPrimary',
                      disabled: selected.size === 0 || busy,
                      onClick: handleArchiveSelected,
                    }, t('toTrashSelected')),
                    h('button', {
                      key: 'archive-all',
                      type: 'button',
                      className: 'dshTr_btn',
                      disabled: visibleIds.length === 0 || busy,
                      onClick: handleArchiveAll,
                    }, t('toTrashAll')),
                  ]),
                ]),
                phase === 'pending' && visibleIds.length === 0
                  ? h('p', { key: 'loading', className: 'dshTr_loading' }, t('loading'))
                  : visibleIds.length === 0
                    ? h('p', { key: 'empty', className: 'dshTr_empty' }, t('sessionsTitle'))
                    : h('ul', { key: 'list', className: 'dshTr_list' }, visibleIds.map(renderRow)),
              ]),
            ]),
          ]),

          confirm === null ? null : h('div', {
            key: 'confirm',
            className: 'dshTr_confirm',
            role: 'dialog',
            'aria-modal': 'true',
            onClick: (event) => {
              if (event.target === event.currentTarget) setConfirm(null);
            },
          }, [
            h('div', { key: 'box', className: 'dshTr_confirmBox' }, [
              h('h3', { key: 'title', className: 'dshTr_confirmTitle' }, confirm.title),
              h('p', { key: 'text', className: 'dshTr_confirmText' }, confirm.text),
              h('div', { key: 'actions', className: 'dshTr_confirmActions' }, [
                h('button', {
                  key: 'cancel',
                  type: 'button',
                  className: 'dshTr_btn',
                  onClick: () => setConfirm(null),
                }, t('cancel')),
                h('button', {
                  key: 'ok',
                  type: 'button',
                  className: `dshTr_btn ${confirm.danger === true ? 'dshTr_btnDanger' : 'dshTr_btnPrimary'}`,
                  onClick: () => {
                    const action = confirm.action;
                    setConfirm(null);
                    action();
                  },
                }, confirm.confirmLabel ?? t('confirm')),
              ]),
            ]),
          ]),
        ]);
        } catch (error) {
          return h('div', { className: 'dshTr_page' },
            h('p', { className: 'dshTr_loading' }, `Session cleaner failed: ${messageOf(error)}`));
        }
      }

      ctx.effect(() => {
        if (typeof document === 'undefined') return undefined;
        if (document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`) !== null) return undefined;
        const tag = document.createElement('style');
        tag.dataset.plugin = 'dsh-session-trash';
        tag.dataset.pluginCss = STYLE_ID;
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return () => {
          tag.remove();
        };
      }, 'session-trash: styles');

      ctx.effect(() => ctx.locale.register(NS, { zh, en, ru }), 'session-trash: dictionaries');

      ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
        locale: NS,
      }, SessionCleanerPanel));

      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 7,
        locale: NS,
        label: () => t('panel'),
      }, TrashGlyph));

      // Session-row hover strip: order 50 puts this between the "…" menu trigger
      // and the shipped Archive button (order 100).
      ctx.slots.inject('sidebar.workspaces.session.row.action', () => ctx.slots.register({
        name: 'sidebar.workspaces.session.row.action',
        id: 'session-trash.row-action',
        order: 50,
        locale: NS,
        inject: () => ({
          hooks: {
            archived: {
              getSnapshot: () => workspaceStore.getSnapshot().archivedSessionIds,
              subscribe: (listener) => workspaceStore.subscribe(listener),
            },
          },
          trashSession: trashFromRow,
        }),
      }, TrashRowButton));

      // One toast surface shared by the panel and the row button.
      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'session-trash.toast',
        locale: NS,
        inject: () => ({ hooks: { rowToast: toastStore } }),
      }, ToastOverlay));
    }

    return {
      inject: ['slots', 'locale', 'sessions', 'workspaces'],
      apply,
    };
  },
});
