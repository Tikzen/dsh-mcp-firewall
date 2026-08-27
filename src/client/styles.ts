export const FIREWALL_CSS = String.raw`
:root {
  --fw-bg: #f5f7f8;
  --fw-surface: #ffffff;
  --fw-surface-2: #eef2f3;
  --fw-text: #172126;
  --fw-muted: #69777e;
  --fw-border: #d8dfe2;
  --fw-green: #147d64;
  --fw-green-soft: #e5f4ef;
  --fw-amber: #a85d00;
  --fw-amber-soft: #fff0d5;
  --fw-red: #bd2c38;
  --fw-red-soft: #fde9ea;
  --fw-blue: #2764ad;
  --fw-blue-soft: #e8f0fb;
}
@media (prefers-color-scheme: dark) {
  :root {
    --fw-bg: #111719;
    --fw-surface: #171f22;
    --fw-surface-2: #20292d;
    --fw-text: #edf2f3;
    --fw-muted: #9caaaf;
    --fw-border: #344045;
    --fw-green: #5cc4a3;
    --fw-green-soft: #173c33;
    --fw-amber: #efae4b;
    --fw-amber-soft: #3b2a15;
    --fw-red: #ff7a82;
    --fw-red-soft: #3d2024;
    --fw-blue: #80ade5;
    --fw-blue-soft: #1e3048;
  }
}
* { box-sizing: border-box; }
.fw-launch-row { display: flex; justify-content: flex-end; padding: 3px 0; }
.fw-launch {
  display: inline-flex; align-items: center; gap: 8px; min-height: 32px; padding: 0 11px;
  border: 1px solid var(--fw-border); border-radius: 6px; background: var(--fw-surface); color: var(--fw-text);
  font: 600 12px/1 system-ui, sans-serif; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,.06);
}
.fw-launch:hover { border-color: var(--fw-green); }
.fw-launch-alert { width: 7px; height: 7px; border-radius: 50%; background: var(--fw-green); box-shadow: 0 0 0 3px var(--fw-green-soft); }
.fw-launch[data-pending="true"] { border-color: var(--fw-amber); background: var(--fw-amber-soft); color: var(--fw-amber); }
.fw-launch[data-pending="true"] .fw-launch-alert { background: var(--fw-red); box-shadow: 0 0 0 3px var(--fw-red-soft); }
.fw-launch-count { display: grid; place-items: center; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: var(--fw-red); color: #fff; font-size: 9px; font-weight: 800; }
.fw-overlay { position: fixed; inset: 0; z-index: 1200; pointer-events: none; background: rgba(8, 13, 15, .36); backdrop-filter: blur(2px); }
.fw-overlay > .fw-app {
  pointer-events: auto; position: absolute; top: 18px; left: 18px; width: calc(100vw - 36px); height: calc(100vh - 36px);
  min-width: 680px; min-height: 460px; max-width: calc(100vw - 18px); max-height: calc(100vh - 18px);
  resize: both; box-shadow: 0 22px 70px rgba(0,0,0,.27);
}
.fw-app {
  display: grid; grid-template-columns: 214px minmax(0, 1fr); min-height: 0; height: 100%; overflow: hidden;
  color: var(--fw-text); background: var(--fw-bg); border: 1px solid var(--fw-border); border-radius: 8px;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; letter-spacing: 0;
}
.fw-app button, .fw-app input, .fw-app select { font: inherit; letter-spacing: 0; }
.fw-sidebar { display: flex; flex-direction: column; min-width: 0; padding: 18px 12px 14px; background: #172226; color: #edf4f2; }
.fw-brand { display: flex; align-items: center; gap: 10px; padding: 1px 7px 19px; }
.fw-mark { display: grid; place-items: center; width: 30px; height: 34px; flex: 0 0 auto; color: #12201d; background: #62d2ac; border-radius: 8px 8px 11px 11px; font-size: 13px; font-weight: 900; }
.fw-brand strong { display: block; font-size: 13px; }
.fw-brand small { display: block; margin-top: 3px; color: #9eb0b4; font-size: 10px; }
.fw-nav { display: grid; gap: 3px; }
.fw-nav button { display: grid; grid-template-columns: 23px 1fr auto; align-items: center; min-height: 38px; padding: 0 10px; border: 0; border-radius: 5px; color: #b9c8cb; background: transparent; text-align: left; cursor: pointer; }
.fw-nav button:hover { color: #fff; background: rgba(255,255,255,.06); }
.fw-nav button[data-active="true"] { color: #fff; background: rgba(98,210,172,.15); box-shadow: inset 2px 0 #62d2ac; }
.fw-nav-icon { font-size: 14px; text-align: center; }
.fw-nav-count { min-width: 19px; padding: 2px 5px; border-radius: 8px; color: #fff; background: #b93640; font-size: 10px; text-align: center; }
.fw-health { margin-top: auto; padding: 13px 9px 0; border-top: 1px solid rgba(255,255,255,.1); }
.fw-health-line { display: flex; align-items: center; gap: 7px; font-size: 11px; color: #c7d4d6; }
.fw-health-dot { width: 7px; height: 7px; border-radius: 50%; background: #62d2ac; }
.fw-health-dot[data-off="true"] { background: #ff7a82; }
.fw-health small { display: block; margin-top: 5px; color: #819399; font-size: 9px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fw-main { display: grid; grid-template-rows: 58px minmax(0,1fr); min-width: 0; min-height: 0; }
.fw-topbar { display: flex; align-items: center; gap: 12px; padding: 0 22px; border-bottom: 1px solid var(--fw-border); background: var(--fw-surface); }
.fw-title { min-width: 0; }
.fw-title h1 { margin: 0; font-size: 16px; line-height: 1.2; }
.fw-title p { margin: 3px 0 0; color: var(--fw-muted); font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fw-top-actions { display: flex; gap: 7px; margin-left: auto; }
.fw-button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 32px; padding: 0 11px; border: 1px solid var(--fw-border); border-radius: 5px; background: var(--fw-surface); color: var(--fw-text); font-size: 11px; font-weight: 650; cursor: pointer; }
.fw-button:hover { border-color: var(--fw-green); }
.fw-button:disabled { opacity: .55; cursor: wait; }
.fw-button-primary { border-color: var(--fw-green); background: var(--fw-green); color: white; }
.fw-button-danger { border-color: var(--fw-red); color: var(--fw-red); }
.fw-button-danger:hover { border-color: var(--fw-red); background: var(--fw-red-soft); }
.fw-icon-button { width: 32px; padding: 0; font-size: 19px; font-weight: 400; }
.fw-content { min-height: 0; overflow: auto; padding: 20px 22px 28px; }
.fw-section-head { display: flex; align-items: flex-end; gap: 14px; margin-bottom: 12px; }
.fw-section-head h2 { margin: 0; font-size: 14px; }
.fw-section-head p { margin: 0; color: var(--fw-muted); font-size: 10px; }
.fw-section-head .fw-spacer { margin-left: auto; }
.fw-stats { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); border: 1px solid var(--fw-border); border-radius: 6px; background: var(--fw-surface); overflow: hidden; }
.fw-stat { min-width: 0; padding: 15px 17px; border-right: 1px solid var(--fw-border); }
.fw-stat:last-child { border-right: 0; }
.fw-stat-label { color: var(--fw-muted); font-size: 10px; }
.fw-stat strong { display: block; margin-top: 5px; font-size: 23px; line-height: 1; }
.fw-stat small { display: block; margin-top: 6px; color: var(--fw-muted); font-size: 9px; }
.fw-stat[data-tone="danger"] strong { color: var(--fw-red); }
.fw-stat[data-tone="warn"] strong { color: var(--fw-amber); }
.fw-stat[data-tone="good"] strong { color: var(--fw-green); }
.fw-band { margin-top: 16px; border: 1px solid var(--fw-border); border-radius: 6px; background: var(--fw-surface); overflow: hidden; }
.fw-band-header { display: flex; align-items: center; min-height: 43px; padding: 0 15px; border-bottom: 1px solid var(--fw-border); }
.fw-band-header h3 { margin: 0; font-size: 12px; }
.fw-band-header p { margin: 0 0 0 9px; color: var(--fw-muted); font-size: 9px; }
.fw-band-header .fw-spacer { margin-left: auto; }
.fw-alert-row { display: grid; grid-template-columns: 80px minmax(0,1fr) auto; align-items: center; gap: 14px; padding: 14px 15px; }
.fw-alert-target { min-width: 0; }
.fw-alert-target strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 650 12px/1.3 ui-monospace, SFMono-Regular, Consolas, monospace; }
.fw-alert-target p { margin: 5px 0 0; color: var(--fw-muted); font-size: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fw-pill { display: inline-flex; align-items: center; justify-content: center; min-width: 56px; height: 23px; padding: 0 7px; border-radius: 11px; font-size: 9px; font-weight: 750; text-transform: uppercase; }
.fw-pill[data-kind="allow"] { color: var(--fw-green); background: var(--fw-green-soft); }
.fw-pill[data-kind="ask"] { color: var(--fw-amber); background: var(--fw-amber-soft); }
.fw-pill[data-kind="deny"] { color: var(--fw-red); background: var(--fw-red-soft); }
.fw-pill[data-kind="inactive"] { color: var(--fw-muted); background: var(--fw-surface-2); }
.fw-inventory { width: 100%; border-collapse: collapse; table-layout: fixed; }
.fw-inventory th { height: 32px; padding: 0 12px; color: var(--fw-muted); background: var(--fw-surface-2); font-size: 9px; font-weight: 650; text-align: left; }
.fw-inventory td { height: 48px; padding: 7px 12px; border-top: 1px solid var(--fw-border); font-size: 10px; vertical-align: middle; }
.fw-inventory tbody tr:hover { background: color-mix(in srgb, var(--fw-green-soft) 32%, transparent); }
.fw-inventory .fw-tool-cell { width: 35%; }
.fw-tool-name { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 650 10px/1.35 ui-monospace, SFMono-Regular, Consolas, monospace; }
.fw-offline { margin-left: 6px; padding: 2px 4px; border-radius: 3px; background: var(--fw-surface-2); color: var(--fw-muted); font: 700 7px/1 system-ui, sans-serif; }
.fw-tool-desc { display: block; margin-top: 2px; color: var(--fw-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 9px; }
.fw-server-row td { height: 31px; padding: 0 12px; background: var(--fw-surface-2); color: var(--fw-muted); font-weight: 750; }
.fw-cap-list { display: flex; flex-wrap: wrap; gap: 4px; }
.fw-cap { padding: 3px 5px; border: 1px solid var(--fw-border); border-radius: 3px; color: var(--fw-muted); background: var(--fw-bg); font-size: 8px; text-transform: uppercase; }
.fw-cap[data-cap="write"], .fw-cap[data-cap="execute"], .fw-cap[data-cap="delete"] { color: var(--fw-red); border-color: color-mix(in srgb, var(--fw-red) 35%, var(--fw-border)); }
.fw-cap[data-cap="network"] { color: var(--fw-amber); border-color: color-mix(in srgb, var(--fw-amber) 35%, var(--fw-border)); }
.fw-segment { display: inline-grid; grid-auto-flow: column; grid-auto-columns: minmax(38px, auto); max-width: 100%; padding: 2px; border: 1px solid var(--fw-border); border-radius: 5px; background: var(--fw-surface-2); }
.fw-segment button { min-height: 25px; padding: 0 7px; border: 0; border-radius: 3px; color: var(--fw-muted); background: transparent; font-size: 9px; cursor: pointer; white-space: nowrap; }
.fw-segment button[data-selected="true"] { color: var(--fw-text); background: var(--fw-surface); box-shadow: 0 1px 2px rgba(0,0,0,.08); }
.fw-segment button[data-action="allow"][data-selected="true"] { color: var(--fw-green); }
.fw-segment button[data-action="ask"][data-selected="true"] { color: var(--fw-amber); }
.fw-segment button[data-action="deny"][data-selected="true"] { color: var(--fw-red); }
.fw-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 12px; }
.fw-bulk-action { margin-left: auto; }
.fw-search { min-width: 220px; flex: 1; height: 34px; padding: 0 10px; border: 1px solid var(--fw-border); border-radius: 5px; background: var(--fw-surface); color: var(--fw-text); font-size: 11px; outline: none; }
.fw-search:focus { border-color: var(--fw-green); box-shadow: 0 0 0 2px var(--fw-green-soft); }
.fw-session-select { min-width: 190px; max-width: 310px; height: 34px; padding: 0 9px; border: 1px solid var(--fw-border); border-radius: 5px; background: var(--fw-surface); color: var(--fw-text); font-size: 10px; }
.fw-review-grid { display: flex; min-height: 510px; height: min(68vh, 760px); border: 1px solid var(--fw-border); border-radius: 6px; background: var(--fw-surface); overflow: auto; }
.fw-event-list { width: 44%; min-width: 300px; max-width: 70%; flex: 0 0 auto; border-right: 1px solid var(--fw-border); overflow: auto; }
.fw-resizable-x { resize: horizontal; }
.fw-resizable-y { resize: vertical; }
.fw-event { display: grid; grid-template-columns: 67px minmax(0,1fr) 60px; gap: 10px; align-items: center; width: 100%; min-height: 65px; padding: 10px 13px; border: 0; border-bottom: 1px solid var(--fw-border); background: transparent; color: inherit; text-align: left; cursor: pointer; }
.fw-event:hover, .fw-event[data-selected="true"] { background: var(--fw-surface-2); }
.fw-event[data-selected="true"] { box-shadow: inset 3px 0 var(--fw-green); }
.fw-event[data-violation="true"] { box-shadow: inset 3px 0 var(--fw-red); }
.fw-event[data-selected="true"][data-violation="true"] { background: var(--fw-red-soft); }
.fw-event-main { min-width: 0; }
.fw-event-main small { display: block; margin-bottom: 3px; color: var(--fw-blue); font-size: 8px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fw-event-main strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 650 10px/1.35 ui-monospace, SFMono-Regular, Consolas, monospace; }
.fw-event-main span { display: block; margin-top: 4px; color: var(--fw-muted); font-size: 9px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fw-event time { color: var(--fw-muted); font-size: 9px; text-align: right; }
.fw-detail { min-width: 280px; flex: 1 1 auto; padding: 18px; overflow: auto; }
.fw-detail h3 { margin: 0; font-size: 13px; overflow-wrap: anywhere; }
.fw-conversation-context { margin-bottom: 16px; padding: 11px 12px; border: 1px solid var(--fw-border); border-left: 3px solid var(--fw-blue); border-radius: 4px; background: var(--fw-blue-soft); }
.fw-conversation-context[data-risk="true"] { border-left-color: var(--fw-red); background: var(--fw-red-soft); }
.fw-conversation-context > strong { display: block; font-size: 12px; }
.fw-conversation-context > div { display: flex; flex-wrap: wrap; gap: 6px 12px; margin-top: 7px; color: var(--fw-muted); font-size: 9px; }
.fw-conversation-context code { display: block; margin-top: 6px; color: var(--fw-muted); font: 8px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fw-detail-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 9px; }
.fw-detail-block { margin-top: 17px; }
.fw-detail-label { display: block; margin-bottom: 6px; color: var(--fw-muted); font-size: 9px; font-weight: 700; text-transform: uppercase; }
.fw-target { padding: 10px; border-left: 3px solid var(--fw-red); background: var(--fw-red-soft); color: var(--fw-red); font: 650 10px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace; overflow-wrap: anywhere; }
.fw-target[data-safe="true"] { border-left-color: var(--fw-green); background: var(--fw-green-soft); color: var(--fw-green); }
.fw-reason { margin: 0; color: var(--fw-text); font-size: 11px; line-height: 1.65; }
.fw-policy-source { display: inline-block; margin: 0 0 6px; padding: 3px 6px; border-radius: 3px; background: var(--fw-blue-soft); color: var(--fw-blue); font-size: 8px; font-weight: 700; }
.fw-code { max-height: 150px; margin: 0; padding: 10px; overflow: auto; border: 1px solid var(--fw-border); border-radius: 4px; background: var(--fw-bg); color: var(--fw-muted); font: 9px/1.55 ui-monospace, SFMono-Regular, Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; }
.fw-approval-panel { margin-top: 17px; padding: 13px; border: 1px solid color-mix(in srgb, var(--fw-amber) 60%, var(--fw-border)); border-left: 3px solid var(--fw-amber); border-radius: 5px; background: var(--fw-amber-soft); }
.fw-approval-panel header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
.fw-approval-panel header strong { display: block; font-size: 11px; line-height: 1.45; }
.fw-approval-panel p { margin: 10px 0 0; color: var(--fw-text); font-size: 10px; line-height: 1.65; }
.fw-approval-expiry { flex: 0 0 auto; color: var(--fw-amber); font-size: 9px; font-weight: 700; white-space: nowrap; }
.fw-approval-actions { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 12px; }
.fw-approval-stale { margin-top: 17px; padding: 11px 12px; border-left: 3px solid var(--fw-muted); background: var(--fw-surface-2); }
.fw-approval-stale strong { display: block; font-size: 10px; }
.fw-approval-stale p { margin: 5px 0 0; color: var(--fw-muted); font-size: 9px; line-height: 1.55; }
.fw-detail-actions { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 18px; }
.fw-action-feedback { margin-top: 10px; padding: 8px 10px; border-left: 3px solid var(--fw-green); background: var(--fw-green-soft); color: var(--fw-green); font-size: 10px; line-height: 1.5; }
.fw-timeline { position: relative; display: grid; gap: 0; border: 1px solid var(--fw-border); border-radius: 4px; overflow: hidden; }
.fw-timeline-node { display: grid; grid-template-columns: 16px minmax(0,1fr); gap: 8px; align-items: center; min-height: 38px; padding: 7px 10px; border-bottom: 1px solid var(--fw-border); background: var(--fw-surface); }
.fw-timeline-node:last-child { border-bottom: 0; }
.fw-timeline-node i { width: 8px; height: 8px; border: 2px solid var(--fw-muted); border-radius: 50%; }
.fw-timeline-node[data-status="allow"] i { border-color: var(--fw-green); background: var(--fw-green); }
.fw-timeline-node[data-status="ask"] i { border-color: var(--fw-amber); background: var(--fw-amber); }
.fw-timeline-node[data-status="deny"] i { border-color: var(--fw-red); background: var(--fw-red); }
.fw-timeline-node strong { display: block; font-size: 9px; }
.fw-timeline-node time { display: block; margin-top: 2px; color: var(--fw-muted); font-size: 8px; }
.fw-analysis { min-height: 200px; max-height: 620px; margin-top: 14px; padding: 13px; overflow: auto; border: 1px solid var(--fw-blue); border-radius: 5px; background: var(--fw-blue-soft); }
.fw-analysis header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.fw-analysis header strong { font-size: 11px; color: var(--fw-blue); }
.fw-analysis header span { color: var(--fw-muted); font-size: 8px; }
.fw-analysis h4 { margin: 12px 0; font-size: 12px; line-height: 1.5; }
.fw-analysis dl { display: grid; grid-template-columns: 88px minmax(0,1fr); gap: 7px 10px; margin: 0; }
.fw-analysis dt { color: var(--fw-muted); font-size: 9px; font-weight: 700; }
.fw-analysis dd { margin: 0; font-size: 10px; line-height: 1.55; }
.fw-analysis ol { margin: 12px 0 0; padding-left: 20px; font-size: 10px; line-height: 1.65; }
.fw-analysis-note { margin: 10px 0 0; padding-top: 8px; border-top: 1px solid color-mix(in srgb, var(--fw-blue) 25%, transparent); color: var(--fw-muted); font-size: 8px; }
.fw-session-chain { min-height: 240px; max-height: 720px; margin-top: 14px; overflow: auto; border: 1px solid var(--fw-border); border-radius: 5px; background: var(--fw-surface); }
.fw-session-chain > header { display: flex; align-items: center; justify-content: space-between; gap: 14px; min-height: 54px; padding: 10px 12px; border-bottom: 1px solid var(--fw-border); background: var(--fw-surface-2); }
.fw-session-chain > header strong { display: block; font-size: 11px; }
.fw-session-chain > header > span { color: var(--fw-muted); font-size: 8px; text-align: right; }
.fw-chain-call { display: grid; grid-template-columns: 24px minmax(0,1fr) 56px; align-items: start; gap: 9px; width: 100%; min-height: 76px; padding: 11px; border: 0; border-bottom: 1px solid var(--fw-border); background: transparent; color: var(--fw-text); text-align: left; cursor: pointer; }
.fw-chain-call:last-child { border-bottom: 0; }
.fw-chain-call:hover, .fw-chain-call[data-selected="true"] { background: var(--fw-surface-2); }
.fw-chain-call[data-violation="true"] { box-shadow: inset 3px 0 var(--fw-red); }
.fw-chain-call[data-selected="true"][data-violation="true"] { background: var(--fw-red-soft); }
.fw-chain-index { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--fw-surface-2); color: var(--fw-muted); font-size: 9px; }
.fw-chain-main { min-width: 0; }
.fw-chain-main > div { display: flex; align-items: center; gap: 7px; }
.fw-chain-main strong { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 650 9px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace; }
.fw-chain-main p { margin: 5px 0 0; color: var(--fw-text); font-size: 9px; overflow-wrap: anywhere; }
.fw-chain-main small { display: block; margin-top: 5px; color: var(--fw-muted); font-size: 8px; line-height: 1.45; }
.fw-chain-call > time { color: var(--fw-muted); font-size: 8px; text-align: right; }
.fw-inventory tr[data-violation="true"] { box-shadow: inset 3px 0 var(--fw-red); background: color-mix(in srgb, var(--fw-red-soft) 45%, transparent); }
.fw-policy-grid { display: grid; grid-template-columns: minmax(0,1fr) minmax(330px,.7fr); gap: 16px; }
.fw-policy-health { margin-bottom: 16px; border: 1px solid var(--fw-border); border-left: 3px solid var(--fw-green); border-radius: 6px; background: var(--fw-surface); }
.fw-policy-health[data-issues="true"] { border-left-color: var(--fw-amber); }
.fw-policy-health > header, .fw-grants > header, .fw-simulator > header { display: flex; align-items: center; justify-content: space-between; gap: 14px; min-height: 55px; padding: 10px 13px; }
.fw-policy-health > header strong, .fw-grants > header strong, .fw-simulator > header strong { display: block; font-size: 11px; }
.fw-policy-issues { min-height: 72px; max-height: 280px; overflow: auto; border-top: 1px solid var(--fw-border); }
.fw-policy-issue { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 12px; padding: 10px 13px; border-bottom: 1px solid var(--fw-border); }
.fw-policy-issue:last-child { border-bottom: 0; }
.fw-policy-issue strong { font-size: 10px; }
.fw-policy-issue p { margin: 4px 0 0; color: var(--fw-muted); font-size: 9px; line-height: 1.55; }
.fw-policy-issue > span { align-self: start; color: var(--fw-amber); font-size: 8px; font-weight: 700; }
.fw-policy-issue[data-severity="high"] > span { color: var(--fw-red); }
.fw-grants { margin-bottom: 16px; border: 1px solid var(--fw-blue); border-radius: 6px; background: var(--fw-blue-soft); }
.fw-grants > header > span, .fw-simulator > header > span { color: var(--fw-muted); font-size: 8px; }
.fw-grant-list { border-top: 1px solid color-mix(in srgb, var(--fw-blue) 30%, var(--fw-border)); }
.fw-grant { display: grid; grid-template-columns: minmax(0,1fr) auto 27px; align-items: center; gap: 10px; min-height: 49px; padding: 8px 12px; border-bottom: 1px solid color-mix(in srgb, var(--fw-blue) 20%, var(--fw-border)); }
.fw-grant:last-child { border-bottom: 0; }
.fw-grant strong { display: block; font: 650 9px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace; overflow-wrap: anywhere; }
.fw-grant p { margin: 3px 0 0; color: var(--fw-muted); font-size: 8px; overflow-wrap: anywhere; }
.fw-grant time { color: var(--fw-muted); font-size: 8px; white-space: nowrap; }
.fw-grant button { width: 27px; height: 27px; border: 0; border-radius: 4px; background: transparent; color: var(--fw-muted); font-size: 16px; cursor: pointer; }
.fw-grant button:hover { color: var(--fw-red); background: var(--fw-red-soft); }
.fw-settings { border: 1px solid var(--fw-border); border-radius: 6px; background: var(--fw-surface); }
.fw-setting { display: grid; grid-template-columns: minmax(150px,1fr) auto; align-items: center; gap: 20px; min-height: 62px; padding: 11px 15px; border-bottom: 1px solid var(--fw-border); }
.fw-setting:last-child { border-bottom: 0; }
.fw-setting strong { display: block; font-size: 11px; }
.fw-setting p { margin: 4px 0 0; color: var(--fw-muted); font-size: 9px; }
.fw-toggle { position: relative; width: 38px; height: 22px; padding: 0; border: 0; border-radius: 11px; background: #b7c0c3; cursor: pointer; }
.fw-toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .16s ease; }
.fw-toggle[data-on="true"] { background: var(--fw-green); }
.fw-toggle[data-on="true"]::after { transform: translateX(16px); }
.fw-timeout-control { display: flex; align-items: center; justify-content: flex-end; gap: 7px; min-width: 230px; }
.fw-timeout-control label { display: flex; align-items: center; height: 32px; border: 1px solid var(--fw-border); border-radius: 4px; background: var(--fw-bg); overflow: hidden; }
.fw-timeout-control input { width: 76px; height: 30px; padding: 0 6px 0 9px; border: 0; outline: none; background: transparent; color: var(--fw-text); font-size: 10px; }
.fw-timeout-control label > span { padding: 0 8px 0 3px; color: var(--fw-muted); font-size: 9px; white-space: nowrap; }
.fw-timeout-status { min-width: 58px; color: var(--fw-muted); font-size: 8px; white-space: nowrap; }
.fw-timeout-status[data-error="true"] { color: var(--fw-red); }
.fw-rule-list { min-height: 160px; max-height: 680px; resize: vertical; border: 1px solid var(--fw-border); border-radius: 6px; background: var(--fw-surface); overflow: auto; }
.fw-rule { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 9px; padding: 11px 13px; border-bottom: 1px solid var(--fw-border); }
.fw-rule:last-child { border-bottom: 0; }
.fw-rule strong { display: block; font: 650 10px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace; overflow-wrap: anywhere; }
.fw-rule span { display: block; margin-top: 3px; color: var(--fw-muted); font-size: 9px; }
.fw-rule button { align-self: start; width: 25px; height: 25px; border: 0; border-radius: 4px; background: transparent; color: var(--fw-muted); font-size: 16px; cursor: pointer; }
.fw-rule button:hover { color: var(--fw-red); background: var(--fw-red-soft); }
.fw-rule-form { display: grid; grid-template-columns: minmax(105px,.8fr) minmax(140px,1.2fr); gap: 7px; padding: 11px; border-top: 1px solid var(--fw-border); }
.fw-rule-form .fw-button { width: 100%; }
.fw-rule-form input, .fw-rule-form select { min-width: 0; height: 32px; padding: 0 8px; border: 1px solid var(--fw-border); border-radius: 4px; background: var(--fw-surface); color: var(--fw-text); font-size: 10px; }
.fw-simulator { min-height: 250px; max-height: 720px; margin-top: 16px; overflow: auto; border: 1px solid var(--fw-border); border-radius: 6px; background: var(--fw-surface); }
.fw-simulator > header { border-bottom: 1px solid var(--fw-border); background: var(--fw-surface-2); }
.fw-simulator-grid { display: grid; grid-template-columns: minmax(220px,.8fr) minmax(280px,1.2fr) auto; align-items: end; gap: 10px; padding: 13px; }
.fw-simulator-grid label { min-width: 0; }
.fw-simulator-grid label > span { display: block; margin-bottom: 5px; color: var(--fw-muted); font-size: 8px; font-weight: 700; }
.fw-simulator-grid input, .fw-simulator-grid textarea { width: 100%; min-width: 0; border: 1px solid var(--fw-border); border-radius: 4px; background: var(--fw-bg); color: var(--fw-text); font: 9px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace; outline: none; }
.fw-simulator-grid input { height: 34px; padding: 0 9px; }
.fw-simulator-grid textarea { height: 76px; padding: 8px; resize: vertical; }
.fw-simulator-grid input:focus, .fw-simulator-grid textarea:focus { border-color: var(--fw-green); }
.fw-simulator .fw-error { margin: 0 13px 12px; }
.fw-simulation-result { display: grid; grid-template-columns: 70px minmax(0,1fr); align-items: start; gap: 12px; margin: 0 13px 13px; padding: 11px; border-left: 3px solid var(--fw-blue); background: var(--fw-blue-soft); }
.fw-simulation-result strong { display: block; font-size: 10px; }
.fw-simulation-result p { margin: 4px 0 0; font-size: 10px; line-height: 1.55; }
.fw-simulation-result small { display: block; margin-top: 5px; color: var(--fw-muted); font-size: 8px; }
.fw-empty { display: grid; place-items: center; min-height: 250px; padding: 34px; text-align: center; }
.fw-empty-mark { display: grid; place-items: center; width: 48px; height: 54px; margin: 0 auto 13px; border: 2px solid var(--fw-border); border-radius: 11px 11px 16px 16px; color: var(--fw-muted); font-weight: 900; }
.fw-empty h3 { margin: 0; font-size: 13px; }
.fw-empty p { max-width: 380px; margin: 7px auto 14px; color: var(--fw-muted); font-size: 10px; line-height: 1.6; }
.fw-error { margin-bottom: 12px; padding: 9px 11px; border: 1px solid var(--fw-red); border-radius: 5px; color: var(--fw-red); background: var(--fw-red-soft); font-size: 10px; }
.fw-loading { display: grid; place-items: center; height: 100%; color: var(--fw-muted); font-size: 11px; }
@media (max-width: 900px) {
  .fw-overlay > .fw-app { top: 0; left: 0; width: 100vw; height: 100vh; min-width: 0; min-height: 0; max-width: none; max-height: none; resize: none; border-radius: 0; }
  .fw-app { grid-template-columns: 1fr; grid-template-rows: auto minmax(0,1fr); border-radius: 0; }
  .fw-sidebar { padding: 9px 12px; }
  .fw-brand { padding: 0 2px 8px; }
  .fw-brand small, .fw-health { display: none; }
  .fw-mark { width: 25px; height: 28px; border-radius: 6px 6px 9px 9px; }
  .fw-nav { grid-template-columns: repeat(4, minmax(0,1fr)); }
  .fw-nav button { grid-template-columns: 18px minmax(0,auto) auto; justify-content: center; padding: 0 5px; }
  .fw-main { grid-template-rows: 52px minmax(0,1fr); }
  .fw-topbar { padding: 0 13px; }
  .fw-title p { display: none; }
  .fw-content { padding: 14px 12px 22px; }
  .fw-stats { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .fw-stat:nth-child(2) { border-right: 0; }
  .fw-stat:nth-child(-n+2) { border-bottom: 1px solid var(--fw-border); }
  .fw-alert-row { grid-template-columns: 62px minmax(0,1fr); }
  .fw-alert-row .fw-button { display: none; }
  .fw-review-grid { flex-direction: column; height: auto; min-height: 620px; }
  .fw-event-list { width: 100%; min-width: 0; max-width: none; max-height: 360px; resize: vertical; border-right: 0; border-bottom: 1px solid var(--fw-border); }
  .fw-detail { min-width: 0; }
  .fw-policy-grid { grid-template-columns: 1fr; }
  .fw-simulator-grid { grid-template-columns: 1fr; align-items: stretch; }
  .fw-rule-form { grid-template-columns: 1fr 1fr; }
  .fw-inventory th:nth-child(2), .fw-inventory td:nth-child(2) { display: none; }
  .fw-inventory .fw-tool-cell { width: 48%; }
}
@media (max-width: 560px) {
  .fw-nav button { display: flex; gap: 4px; font-size: 10px; }
  .fw-nav-icon { display: none; }
  .fw-top-actions .fw-report-button { display: none; }
  .fw-section-head { align-items: flex-start; flex-direction: column; gap: 4px; }
  .fw-section-head .fw-spacer { display: none; }
  .fw-inventory th:nth-child(3), .fw-inventory td:nth-child(3) { display: none; }
  .fw-segment { grid-auto-columns: minmax(30px,auto); }
  .fw-segment button { padding: 0 5px; }
  .fw-setting { grid-template-columns: 1fr; gap: 9px; }
  .fw-timeout-control { justify-content: flex-start; min-width: 0; flex-wrap: wrap; }
  .fw-policy-health > header, .fw-grants > header, .fw-simulator > header { align-items: flex-start; }
  .fw-grant { grid-template-columns: minmax(0,1fr) 27px; }
  .fw-grant time { grid-column: 1; grid-row: 2; }
  .fw-grant button { grid-column: 2; grid-row: 1 / span 2; }
}
`
