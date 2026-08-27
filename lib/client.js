window.__ModuleLoader__.load({
	id: "dsh-mcp-firewall",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/styles.ts
		const FIREWALL_CSS = String.raw`
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
`;
		//#endregion
		//#region src/client/index.tsx
		const API_ROOT = "/api/plugins/dsh-mcp-firewall";
		const OPEN_EVENT = "dsh-mcp-firewall:open";
		async function api(path, init) {
			const response = await fetch(`${API_ROOT}${path}`, {
				...init,
				headers: {
					"content-type": "application/json",
					...init?.headers || {}
				}
			});
			const body = await response.json().catch(() => ({}));
			if (!response.ok) throw new Error(body.error || `请求失败 (${response.status})`);
			return body;
		}
		function ActionControl({ value, includeInherit = false, onChange, disabled = false }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "fw-segment",
				children: [
					...includeInherit ? [{
						value: "inherit",
						label: "自动"
					}] : [],
					{
						value: "allow",
						label: "允许"
					},
					{
						value: "ask",
						label: "询问"
					},
					{
						value: "deny",
						label: "阻止"
					}
				].map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					"data-action": option.value,
					"data-selected": value === option.value,
					disabled,
					onClick: () => onChange(option.value),
					children: option.label
				}, option.value))
			});
		}
		function Pill({ kind, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "fw-pill",
				"data-kind": kind,
				children: children || {
					allow: "已允许",
					ask: "待审核",
					deny: "已阻止"
				}[kind] || kind
			});
		}
		function EventPill({ event }) {
			if (event.kind !== "ask") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, { kind: event.kind });
			if (event.approvalProcessing) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
				kind: "ask",
				children: "处理中"
			});
			if (event.approvalPending) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
				kind: "ask",
				children: "待审核"
			});
			if (event.approval === "allowed-once") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
				kind: "allow",
				children: "已批准"
			});
			if (event.approval) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
				kind: "deny",
				children: "已拒绝"
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
				kind: "inactive",
				children: "已失效"
			});
		}
		function formatTime(value) {
			const date = new Date(value);
			if (Number.isNaN(date.valueOf())) return value;
			return date.toLocaleTimeString("zh-CN", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit"
			});
		}
		function groupTools(tools) {
			const groups = /* @__PURE__ */ new Map();
			for (const tool of tools) groups.set(tool.server, [...groups.get(tool.server) || [], tool]);
			return [...groups.entries()];
		}
		function Overview({ state, mutate, onReview }) {
			const latest = state.events.find((event) => event.approvalPending) || state.events.find((event) => event.kind !== "allow");
			const groups = groupTools(state.tools);
			const setAction = (tool, action) => mutate(() => api(`/tools/${encodeURIComponent(tool.name)}`, {
				method: "PATCH",
				body: JSON.stringify({ action })
			}));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "fw-stats",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-stat",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "fw-stat-label",
									children: "工具资产"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: state.stats.tools }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [
									state.stats.connected,
									" 个在线 · ",
									state.stats.simulated,
									" 次演练"
								] })
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-stat",
							"data-tone": "good",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "fw-stat-label",
									children: "已放行"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: state.stats.allowed }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "最近 500 次调用" })
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-stat",
							"data-tone": "warn",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "fw-stat-label",
									children: "需要审核"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: state.stats.asked }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [state.stats.unresolved, " 条待处理"] })
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-stat",
							"data-tone": "danger",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "fw-stat-label",
									children: "越权阻止"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: state.stats.denied }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "策略已自动执行" })
							]
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: "fw-band",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: "fw-band-header",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "最近风险" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "最需要你注意的一次工具调用" })]
					}), latest ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "fw-alert-row",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EventPill, { event: latest }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "fw-alert-target",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: latest.target || latest.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
									latest.sessionTitle,
									" · ",
									latest.reason
								] })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: "fw-button",
								type: "button",
								onClick: () => onReview(latest),
								children: "定位越权"
							})
						]
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Empty, {
						title: "暂时没有风险事件",
						text: "真实 MCP 调用会在这里显示；也可以运行一次安全演练检查界面。"
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: "fw-band",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: "fw-band-header",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "权限地图" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "直接调整每个工具的执行策略" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "fw-spacer" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "fw-pill",
								"data-kind": state.config.enabled ? "allow" : "deny",
								children: state.config.enabled ? "防护中" : "已停用"
							})
						]
					}), groups.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
						className: "fw-inventory",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								className: "fw-tool-cell",
								children: "工具"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "能力范围" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "风险" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "策略" })
						] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: groups.map(([server, tools]) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FragmentGroup, {
							server,
							tools,
							setAction
						}, server)) })]
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Empty, {
						title: "还没有发现 MCP 工具",
						text: "连接 MCP Server 后会自动生成权限地图。当前可先运行安全演练体验越权定位。"
					})]
				})
			] });
		}
		function FragmentGroup({ server, tools, setAction }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", {
				className: "fw-server-row",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", {
					colSpan: 4,
					children: [
						server,
						" · ",
						tools.length,
						" 个工具"
					]
				})
			}), tools.map((tool) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", {
					className: "fw-tool-cell",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "fw-tool-name",
						children: [tool.tool, !tool.connected ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "fw-offline",
							children: "离线"
						}) : null]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "fw-tool-desc",
						children: tool.description || tool.name
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "fw-cap-list",
					children: tool.capabilities.map((cap) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "fw-cap",
						"data-cap": cap,
						children: cap
					}, cap))
				}) }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
					kind: tool.risk === "read" ? "allow" : tool.risk === "network" ? "ask" : "deny",
					children: riskLabel(tool.risk)
				}) }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ActionControl, {
					value: tool.action,
					includeInherit: true,
					onChange: (action) => setAction(tool, action)
				}) })
			] }, tool.name))] });
		}
		function Review({ state, initial, mutate }) {
			const [query, setQuery] = (0, react.useState)("");
			const [filter, setFilter] = (0, react.useState)("all");
			const [sessionFilter, setSessionFilter] = (0, react.useState)("all");
			const [selectedId, setSelectedId] = (0, react.useState)(initial?.id || state.events.find((event) => event.approvalPending)?.id || state.events[0]?.id || null);
			const [feedback, setFeedback] = (0, react.useState)("");
			const [expanded, setExpanded] = (0, react.useState)(false);
			const [analyzing, setAnalyzing] = (0, react.useState)(false);
			const [decisionBusy, setDecisionBusy] = (0, react.useState)(false);
			const [bulkConfirm, setBulkConfirm] = (0, react.useState)(null);
			const [analysis, setAnalysis] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				if (initial?.id) setSelectedId(initial.id);
			}, [initial?.id]);
			(0, react.useEffect)(() => {
				setFeedback("");
				setAnalysis(null);
			}, [selectedId]);
			(0, react.useEffect)(() => {
				if (!bulkConfirm) return;
				const timer = window.setTimeout(() => setBulkConfirm(null), 5e3);
				return () => window.clearTimeout(timer);
			}, [bulkConfirm]);
			const events = (0, react.useMemo)(() => state.events.filter((event) => {
				if (filter === "ask" && !event.approvalPending) return false;
				if (filter !== "all" && filter !== "ask" && event.kind !== filter) return false;
				if (sessionFilter !== "all" && event.sessionId !== sessionFilter) return false;
				return `${event.name} ${event.target} ${event.reason} ${event.sessionTitle} ${event.sessionId}`.toLowerCase().includes(query.trim().toLowerCase());
			}).sort((a, b) => Number(Boolean(b.approvalPending)) - Number(Boolean(a.approvalPending)) || String(b.time).localeCompare(String(a.time))), [
				state.events,
				filter,
				sessionFilter,
				query
			]);
			const selected = events.find((event) => event.id === selectedId) || events[0];
			const sessionEvents = (0, react.useMemo)(() => selected ? state.events.filter((event) => event.sessionId === selected.sessionId).sort((a, b) => String(a.time).localeCompare(String(b.time))) : [], [state.events, selected?.sessionId]);
			const selectedConversation = selected ? state.conversations.find((item) => item.id === selected.sessionId) : void 0;
			const sessionPending = selected ? state.events.filter((event) => event.sessionId === selected.sessionId && event.approvalPending).length : 0;
			const toolBlocked = Boolean(selected && state.config.denyTools.includes(selected.name));
			let selectedHost = "";
			try {
				selectedHost = selected ? new URL(selected.target).hostname : "";
			} catch {
				selectedHost = "";
			}
			const hostRuleIndex = selected ? state.config.hostRules.findIndex((rule) => rule.tool === selected.name && rule.host === selectedHost && rule.action === "deny") : -1;
			const runAction = async (message, work) => {
				setFeedback("");
				if (await mutate(work)) setFeedback(message);
			};
			const toggleTool = () => selected && runAction(toolBlocked ? `已恢复 ${selected.tool} 的自动策略` : `已保存：今后阻止 ${selected.tool} 的调用`, () => api(`/tools/${encodeURIComponent(selected.name)}`, {
				method: "PATCH",
				body: JSON.stringify({ action: toolBlocked ? "inherit" : "deny" })
			}));
			const toggleHost = () => {
				if (!selected || !selectedHost) return;
				return hostRuleIndex >= 0 ? runAction(`已移除 ${selectedHost} 的阻止规则`, () => api(`/rules/host/${hostRuleIndex}`, { method: "DELETE" })) : runAction(`已保存：今后阻止访问 ${selectedHost}`, () => api("/rules", {
					method: "POST",
					body: JSON.stringify({
						type: "host",
						tool: selected.name,
						host: selectedHost,
						action: "deny",
						reason: "从越权审核中创建"
					})
				}));
			};
			const decide = async (action) => {
				if (!selected?.approvalPending || selected.approvalProcessing || decisionBusy) return;
				const messages = {
					"allow-once": "已仅批准本次；当前调用恢复执行，后续策略不变。",
					"allow-session": `已允许此对话访问相同${selectedHost ? "主机" : "目标"}；授权将在一小时后或 DSH 重启时失效。`,
					reject: "已拒绝本次；拒绝结果已返回 Agent，当前对话可以继续寻找其他方案。",
					"reject-tool": "已拒绝本次并阻止此工具；Agent 可继续对话，后续同一工具会自动阻止。",
					"reject-target": `已拒绝本次并阻止此${selectedHost ? "主机" : "目标"}；Agent 可继续对话，后续命中相同边界会自动阻止。`
				};
				setDecisionBusy(true);
				try {
					await runAction(messages[action], () => api(`/approvals/${encodeURIComponent(selected.id)}`, {
						method: "POST",
						body: JSON.stringify({ action })
					}));
				} finally {
					setDecisionBusy(false);
				}
			};
			const rejectBulk = async (scope) => {
				const count = scope === "all" ? state.stats.unresolved : sessionPending;
				if (!count || decisionBusy) return;
				if (bulkConfirm !== scope) {
					setBulkConfirm(scope);
					setFeedback(`将拒绝${scope === "all" ? "全部任务" : "此对话"}的 ${count} 条待审调用；再次点击确认。Agent 会收到拒绝结果并继续运行。`);
					return;
				}
				setBulkConfirm(null);
				setDecisionBusy(true);
				try {
					await runAction(`已拒绝 ${count} 条待审调用；对应 Agent 可以继续寻找其他方案。`, () => api("/approvals", {
						method: "POST",
						body: JSON.stringify({
							action: scope === "all" ? "reject-all" : "reject-session",
							sessionId: selected?.sessionId
						})
					}));
				} finally {
					setDecisionBusy(false);
				}
			};
			const analyze = async () => {
				if (!selected) return;
				setAnalyzing(true);
				setFeedback("");
				try {
					const response = await api("/analyze", {
						method: "POST",
						body: JSON.stringify({ eventId: selected.id })
					});
					setAnalysis(response.analysis);
				} catch (reason) {
					setFeedback(`分析失败：${String(reason?.message || reason)}`);
				} finally {
					setAnalyzing(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "fw-toolbar",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: "fw-search",
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "搜索工具、路径、主机、对话或命中理由",
						"aria-label": "搜索审核记录"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
						className: "fw-session-select",
						value: sessionFilter,
						onChange: (event) => {
							setSessionFilter(event.target.value);
							setSelectedId(null);
						},
						"aria-label": "按对话筛选",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
							value: "all",
							children: [
								"全部对话 (",
								state.conversations.length,
								")"
							]
						}), state.conversations.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
							value: item.id,
							children: [
								item.title,
								" · ",
								item.callCount,
								" 次"
							]
						}, item.id))]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "fw-segment",
						children: [
							["all", "全部"],
							["ask", "待审核"],
							["deny", "已阻止"],
							["allow", "已允许"]
						].map(([value, label]) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							"data-selected": filter === value,
							"data-action": value,
							onClick: () => setFilter(value),
							children: label
						}, value))
					}),
					state.stats.unresolved ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: "fw-button fw-button-danger fw-bulk-action",
						type: "button",
						disabled: decisionBusy,
						onClick: () => rejectBulk("all"),
						children: bulkConfirm === "all" ? `再次确认拒绝 ${state.stats.unresolved} 条` : `拒绝全部待审 (${state.stats.unresolved})`
					}) : null
				]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "fw-review-grid fw-resizable-y",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "fw-event-list fw-resizable-x",
					children: events.length ? events.map((event) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						className: "fw-event",
						"data-selected": event.id === selected?.id,
						"data-violation": event.violation,
						onClick: () => setSelectedId(event.id),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EventPill, { event }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "fw-event-main",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: event.sessionTitle }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: event.tool }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: event.target || event.reason })
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", { children: formatTime(event.time) })
						]
					}, event.id)) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Empty, {
						title: "没有匹配记录",
						text: "换一个关键词或筛选条件试试。"
					})
				}), selected ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
					className: "fw-detail",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-conversation-context",
							"data-risk": selected.violation,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "fw-detail-label",
									children: "所属对话"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: selected.sessionTitle }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["会话 ", shortId(selected.sessionId)] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
										"轮次 ",
										selected.turn ?? "?",
										" / 步骤 ",
										selected.step ?? "?"
									] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: selected.provider && selected.model ? `${selected.provider}/${selected.model}` : "模型未记录" })
								] }),
								selected.cwd ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
									title: selected.cwd,
									children: selected.cwd
								}) : null
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: selected.name }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-detail-meta",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EventPill, { event: selected }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "fw-cap",
									children: riskLabel(selected.risk)
								}),
								selected.simulated ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "fw-cap",
									children: "演练"
								}) : null
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-detail-block",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "fw-detail-label",
								children: selected.violation ? "越权 / 异常目标" : "调用目标"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "fw-target",
								"data-safe": !selected.violation,
								children: selected.target || "调用未声明明确目标"
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-detail-block",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "fw-detail-label",
									children: "策略判断"
								}),
								selected.policySource ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "fw-policy-source",
									children: ["命中：", policySourceLabel(selected.policySource)]
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "fw-reason",
									children: selected.reason
								})
							]
						}),
						selected.approvalPending ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: "fw-approval-panel",
							"aria-label": "待审核操作",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "fw-detail-label",
									children: selected.approvalProcessing ? "正在提交决定" : "需要你的决定"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: selected.approvalProcessing ? "另一窗口正在处理，请勿重复操作" : "当前 MCP 调用已暂停，尚未触达 Server" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "fw-approval-expiry",
									children: approvalExpiry(selected)
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "“仅同意本次”不修改策略；“本对话允许”只复用相同工具与目标，并在一小时后失效。拒绝不会结束整段任务：Agent 会收到“用户拒绝”，可以改用安全方案、调整参数或向你说明。" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "fw-approval-actions",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											className: "fw-button fw-button-primary",
											type: "button",
											disabled: decisionBusy || selected.approvalProcessing,
											onClick: () => decide("allow-once"),
											children: "仅同意本次"
										}),
										selected.target ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											className: "fw-button",
											type: "button",
											disabled: decisionBusy || selected.approvalProcessing,
											onClick: () => decide("allow-session"),
											children: ["本对话允许此", selectedHost ? "主机" : "目标"]
										}) : null,
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											className: "fw-button fw-button-danger",
											type: "button",
											disabled: decisionBusy || selected.approvalProcessing,
											onClick: () => decide("reject"),
											children: "拒绝本次"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											className: "fw-button fw-button-danger",
											type: "button",
											disabled: decisionBusy || selected.approvalProcessing,
											onClick: () => decide("reject-tool"),
											children: "拒绝并阻止此工具"
										}),
										selected.target ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											className: "fw-button fw-button-danger",
											type: "button",
											disabled: decisionBusy || selected.approvalProcessing,
											onClick: () => decide("reject-target"),
											children: ["拒绝并阻止此", selectedHost ? "主机" : "目标"]
										}) : null,
										sessionPending > 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											className: "fw-button fw-button-danger",
											type: "button",
											disabled: decisionBusy || selected.approvalProcessing,
											onClick: () => rejectBulk("session"),
											children: bulkConfirm === "session" ? `再次确认拒绝 ${sessionPending} 条` : `拒绝此对话全部 (${sessionPending})`
										}) : null
									]
								})
							]
						}) : selected.kind === "ask" && !selected.approval ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: "fw-approval-stale",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "这条审批已失效，无法事后批准" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "原任务可能已取消、重启或超过等待时间。重新触发工具调用会生成新的待审请求；你仍可在下方调整今后的策略。" })]
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CallTimeline, { event: selected }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-detail-block",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "fw-detail-label",
								children: "调用参数（已脱敏）"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
								className: "fw-code",
								children: prettyArgs(selected.argumentSummary)
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-detail-block",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "fw-detail-label",
								children: "处理结果"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "fw-reason",
								children: outcomeLabel(selected)
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-detail-actions",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "fw-button fw-button-primary",
									onClick: analyze,
									disabled: analyzing,
									children: analyzing ? "正在分析…" : "AI 分析这次调用"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "fw-button",
									onClick: () => setExpanded((value) => !value),
									children: expanded ? "收起对话全链路" : `展开对话全链路 (${sessionEvents.length})`
								}),
								!selected.approvalPending ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: `fw-button ${toolBlocked ? "" : "fw-button-danger"}`,
									onClick: toggleTool,
									children: toolBlocked ? "恢复自动策略" : "阻止此工具"
								}) : null,
								!selected.approvalPending && isUrl(selected.target) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "fw-button",
									onClick: toggleHost,
									children: hostRuleIndex >= 0 ? "移除主机规则" : "阻止此主机"
								}) : null
							]
						}),
						feedback ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "fw-action-feedback",
							role: "status",
							children: feedback
						}) : null,
						analysis ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AnalysisPanel, { analysis }) : null,
						expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionChain, {
							conversation: selectedConversation,
							events: sessionEvents,
							selectedId: selected.id,
							onSelect: setSelectedId
						}) : null
					]
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Empty, {
					title: "选择一条记录",
					text: "调用目标和命中规则会显示在这里。"
				})]
			})] });
		}
		function CallTimeline({ event }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "fw-detail-block",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "fw-detail-label",
					children: "本次调用全流程"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "fw-timeline",
					children: event.timeline.map((item, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "fw-timeline-node",
						"data-status": item.status,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: item.label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", { children: formatTime(item.time) })] })]
					}, `${item.phase}-${index}`))
				})]
			});
		}
		function AnalysisPanel({ analysis }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "fw-analysis fw-resizable-y",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: analysis.source === "ai" ? "AI 安全分析" : "本地安全分析" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: analysis.model || "规则引擎" })] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: analysis.summary }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "正在做什么" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: analysis.intent }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "错误 / 阻止原因" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: analysis.finding }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "风险判断" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: analysis.risk })
					] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ol", { children: analysis.nextSteps.map((item, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: item }, index)) }),
					analysis.note ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "fw-analysis-note",
						children: analysis.note
					}) : null
				]
			});
		}
		function SessionChain({ conversation, events, selectedId, onSelect }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "fw-session-chain fw-resizable-y",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "fw-detail-label",
					children: "对话全链路"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: conversation?.title || events[0]?.sessionTitle })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
					events.length,
					" 次 MCP 调用 · ",
					conversation?.denied || 0,
					" 次越权 · ",
					conversation?.errors || 0,
					" 次报错"
				] })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "fw-chain-list",
					children: events.map((event, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						className: "fw-chain-call",
						"data-selected": event.id === selectedId,
						"data-violation": event.violation,
						onClick: () => onSelect(event.id),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "fw-chain-index",
								children: index + 1
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "fw-chain-main",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: event.tool }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EventPill, { event })] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: event.target || event.reason }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [
										"轮次 ",
										event.turn ?? "?",
										" / 步骤 ",
										event.step ?? "?",
										" · ",
										event.timeline.map((item) => item.label).join(" → ")
									] })
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", { children: formatTime(event.time) })
						]
					}, event.id))
				})]
			});
		}
		function Policy({ state, mutate }) {
			const [type, setType] = (0, react.useState)("host");
			const [value, setValue] = (0, react.useState)("");
			const [action, setAction] = (0, react.useState)("deny");
			const [repairConfirm, setRepairConfirm] = (0, react.useState)(false);
			const [simulationName, setSimulationName] = (0, react.useState)(state.tools[0]?.name || "");
			const [simulationArgs, setSimulationArgs] = (0, react.useState)("{\n  \"url\": \"https://api.example.com/data\"\n}");
			const [simulation, setSimulation] = (0, react.useState)(null);
			const [simulationError, setSimulationError] = (0, react.useState)("");
			const [simulating, setSimulating] = (0, react.useState)(false);
			const [timeoutMinutes, setTimeoutMinutes] = (0, react.useState)(String(Math.round(state.config.approvalTimeoutMs / 6e4)));
			const [timeoutSaving, setTimeoutSaving] = (0, react.useState)(false);
			(0, react.useEffect)(() => setTimeoutMinutes(String(Math.round(state.config.approvalTimeoutMs / 6e4))), [state.config.approvalTimeoutMs]);
			(0, react.useEffect)(() => {
				if (!repairConfirm) return;
				const timer = window.setTimeout(() => setRepairConfirm(false), 5e3);
				return () => window.clearTimeout(timer);
			}, [repairConfirm]);
			const settings = (patch) => mutate(() => api("/settings", {
				method: "PATCH",
				body: JSON.stringify(patch)
			}));
			const parsedTimeoutMinutes = Number(timeoutMinutes);
			const timeoutValid = Number.isFinite(parsedTimeoutMinutes) && parsedTimeoutMinutes >= 1 && parsedTimeoutMinutes <= 10080;
			const timeoutDirty = timeoutValid && Math.round(parsedTimeoutMinutes * 6e4) !== state.config.approvalTimeoutMs;
			const saveTimeout = async () => {
				if (!timeoutValid || !timeoutDirty) return;
				setTimeoutSaving(true);
				await settings({ approvalTimeoutMs: Math.round(parsedTimeoutMinutes * 6e4) });
				setTimeoutSaving(false);
			};
			(0, react.useEffect)(() => {
				if (!timeoutDirty) return;
				const timer = window.setTimeout(() => {
					saveTimeout();
				}, 600);
				return () => window.clearTimeout(timer);
			}, [timeoutMinutes, state.config.approvalTimeoutMs]);
			const addRule = async () => {
				const body = type === "host" ? {
					type,
					host: value,
					action
				} : {
					type: "argument",
					key: "$target",
					value,
					action
				};
				if (await mutate(() => api("/rules", {
					method: "POST",
					body: JSON.stringify(body)
				}))) setValue("");
			};
			const rules = [...state.config.hostRules.map((rule, index) => ({
				type: "host",
				index,
				label: rule.host,
				detail: `${rule.tool || "全部网络工具"} · ${actionLabel(rule.action)}`
			})), ...state.config.argRules.map((rule, index) => ({
				type: "argument",
				index,
				label: Object.entries(rule.args || {}).map(([key, val]) => `${key === "$target" ? "目标" : key} 包含 ${val}`).join(", "),
				detail: `${rule.tool || "全部工具"} · ${actionLabel(rule.action)}`
			}))];
			const remove = (rule) => mutate(() => api(`/rules/${rule.type}/${rule.index}`, { method: "DELETE" }));
			const repairable = state.policyIssues.filter((issue) => issue.repairable).length;
			const repair = async () => {
				if (!repairConfirm) {
					setRepairConfirm(true);
					return;
				}
				setRepairConfirm(false);
				await mutate(() => api("/policy/repair", {
					method: "POST",
					body: "{}"
				}));
			};
			const revokeGrant = (grant) => mutate(() => api(`/grants/${encodeURIComponent(grant.id)}`, { method: "DELETE" }));
			const simulate = async () => {
				setSimulationError("");
				setSimulation(null);
				let args;
				try {
					args = JSON.parse(simulationArgs || "{}");
				} catch {
					setSimulationError("参数不是有效的 JSON。");
					return;
				}
				setSimulating(true);
				try {
					const response = await api("/simulate", {
						method: "POST",
						body: JSON.stringify({
							name: simulationName,
							arguments: args
						})
					});
					setSimulation(response.simulation);
				} catch (reason) {
					setSimulationError(String(reason?.message || reason));
				} finally {
					setSimulating(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: "fw-policy-health",
					"data-issues": state.policyIssues.length > 0,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "fw-detail-label",
						children: "策略健康"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: state.policyIssues.length ? `${state.policyIssues.length} 个需要注意的配置关系` : "没有发现互相矛盾的规则" })] }), repairable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: "fw-button fw-button-danger",
						type: "button",
						onClick: repair,
						children: repairConfirm ? `再次确认清理 ${repairable} 项` : `安全优先修复 (${repairable})`
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
						kind: "allow",
						children: "正常"
					})] }), state.policyIssues.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "fw-policy-issues fw-resizable-y",
						children: state.policyIssues.map((issue) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-policy-issue",
							"data-severity": issue.severity,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: issue.title }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: issue.detail })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: issue.repairable ? "可修复" : "提示" })]
						}, issue.id))
					}) : null]
				}),
				state.grants.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: "fw-grants",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "fw-detail-label",
						children: "本对话临时授权"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [state.grants.length, " 条正在生效"] })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "到期或 DSH 重启后自动清除" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "fw-grant-list",
						children: state.grants.map((grant) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-grant",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: grant.toolName }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
									grant.sessionTitle,
									" · ",
									grant.host || grant.target
								] })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("time", { children: [new Date(grant.expiresAt).toLocaleTimeString("zh-CN", {
									hour: "2-digit",
									minute: "2-digit"
								}), " 到期"] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									title: "撤销临时授权",
									"aria-label": "撤销临时授权",
									onClick: () => revokeGrant(grant),
									children: "×"
								})
							]
						}, grant.id))
					})]
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "fw-policy-grid",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "fw-section-head",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "全局策略" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "设置未单独配置工具的默认行为" })] })
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "fw-settings",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "fw-setting",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "防火墙开关" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "关闭后不拦截，也不记录新的 MCP 调用" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "fw-toggle",
									"aria-label": "切换防火墙",
									"data-on": state.config.enabled,
									onClick: () => settings({ enabled: !state.config.enabled })
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "fw-setting",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "默认策略" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "工具没有单独规则时采用" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ActionControl, {
									value: state.config.defaultAction,
									onChange: (value) => settings({ defaultAction: value })
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "fw-setting",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "注入风险信号" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "仅作为辅助判断，不承诺识别所有攻击" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ActionControl, {
									value: state.config.injectionAction,
									onChange: (value) => settings({ injectionAction: value })
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "fw-setting fw-setting-timeout",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "审核超时自动拒绝" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: state.config.approvalTimeoutEnabled ? "超过时限自动拒绝当前调用，Agent 可继续寻找安全方案" : "已关闭：调用会等待人工处理、任务取消或 DSH 重启" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "fw-timeout-control",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											className: "fw-toggle",
											"aria-label": "切换审核超时自动拒绝",
											"data-on": state.config.approvalTimeoutEnabled,
											onClick: () => settings({ approvalTimeoutEnabled: !state.config.approvalTimeoutEnabled })
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "number",
											min: "1",
											max: "10080",
											step: "1",
											value: timeoutMinutes,
											"aria-label": "审核超时分钟数",
											onChange: (event) => setTimeoutMinutes(event.target.value),
											onBlur: () => {
												saveTimeout();
											},
											onKeyDown: (event) => {
												if (event.key === "Enter") saveTimeout();
											}
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "分钟" })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "fw-timeout-status",
											"data-error": !timeoutValid,
											children: !timeoutValid ? "范围 1–10080" : timeoutSaving || timeoutDirty ? "自动保存中" : "已保存"
										})
									]
								})]
							})
						]
					})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "fw-section-head",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "边界规则" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "按主机或路径内容快速收紧权限" })] })
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "fw-rule-list",
						children: [rules.length ? rules.map((rule) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-rule",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: rule.label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: rule.detail })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								title: "删除规则",
								"aria-label": "删除规则",
								onClick: () => remove(rule),
								children: "×"
							})]
						}, `${rule.type}-${rule.index}`)) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Empty, {
							title: "没有细粒度规则",
							text: "可以先添加一个禁止访问的主机或路径片段。"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-rule-form",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									value: type,
									onChange: (event) => setType(event.target.value),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: "host",
										children: "网络主机"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: "argument",
										children: "路径片段"
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									value,
									onChange: (event) => setValue(event.target.value),
									placeholder: type === "host" ? "upload.example.com" : "C:\\Windows\\System32"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									value: action,
									onChange: (event) => setAction(event.target.value),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "deny",
											children: "阻止"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "ask",
											children: "询问"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "allow",
											children: "允许"
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "fw-button fw-button-primary",
									disabled: !value.trim(),
									onClick: addRule,
									children: "添加"
								})
							]
						})]
					})] })]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: "fw-simulator fw-resizable-y",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "fw-detail-label",
							children: "策略试算"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "预览一次调用会被如何处理" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "不会执行工具" })] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-simulator-grid",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "完整工具名" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										list: "fw-tool-options",
										value: simulationName,
										onChange: (event) => setSimulationName(event.target.value),
										placeholder: "mcp__server__tool"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("datalist", {
										id: "fw-tool-options",
										children: state.tools.map((tool) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", { value: tool.name }, tool.name))
									})
								] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "调用参数 JSON" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									value: simulationArgs,
									onChange: (event) => setSimulationArgs(event.target.value),
									spellCheck: false
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "fw-button fw-button-primary",
									type: "button",
									disabled: !simulationName.trim() || simulating,
									onClick: simulate,
									children: simulating ? "计算中…" : "运行策略试算"
								})
							]
						}),
						simulationError ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "fw-error",
							children: simulationError
						}) : null,
						simulation ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-simulation-result",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
								kind: simulation.decision.kind,
								children: actionLabel(simulation.decision.kind)
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: policySourceLabel(simulation.decision.source) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: simulation.decision.reason }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: simulation.note })
							] })]
						}) : null
					]
				})
			] });
		}
		function Audit({ state }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "fw-band",
				style: { marginTop: 0 },
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: "fw-band-header",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "本地审计" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
						state.events.filter((event) => !event.simulated).length,
						" 次真实决策 · ",
						state.events.filter((event) => event.simulated).length,
						" 次演练，敏感参数已脱敏"
					] })]
				}), state.events.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
					className: "fw-inventory",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "时间 / 对话" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
							className: "fw-tool-cell",
							children: "工具"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "目标" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "决策" })
					] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: state.events.map((event) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", {
						"data-violation": event.violation,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", { children: [new Date(event.time).toLocaleString("zh-CN"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "fw-tool-desc",
								title: event.sessionId,
								children: event.sessionTitle
							})] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", {
								className: "fw-tool-cell",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "fw-tool-name",
									children: event.name
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "fw-tool-desc",
									children: [
										"轮次 ",
										event.turn ?? "?",
										" / 步骤 ",
										event.step ?? "?"
									]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "fw-tool-desc",
								title: event.target,
								children: event.target || "未声明"
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EventPill, { event }) })
						]
					}, event.id)) })]
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Empty, {
					title: "尚无审计记录",
					text: "MCP 工具调用发生后，决策和结果会保存在本机。"
				})]
			});
		}
		function Empty({ title, text }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "fw-empty",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "fw-empty-mark",
						children: "S"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: title }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: text })
				] })
			});
		}
		function SafetyCockpit({ embedded = false }) {
			const [open, setOpen] = (0, react.useState)(embedded);
			const [view, setView] = (0, react.useState)("overview");
			const [state, setState] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [focusEvent, setFocusEvent] = (0, react.useState)(null);
			const load = (0, react.useCallback)(async () => {
				try {
					setState(await api("/state"));
					setError("");
				} catch (reason) {
					setError(String(reason?.message || reason));
				}
			}, []);
			const mutate = (0, react.useCallback)(async (work) => {
				setBusy(true);
				try {
					setState(await work());
					setError("");
					return true;
				} catch (reason) {
					setError(String(reason?.message || reason));
					return false;
				} finally {
					setBusy(false);
				}
			}, []);
			(0, react.useEffect)(() => {
				const listener = () => setOpen(true);
				window.addEventListener(OPEN_EVENT, listener);
				return () => window.removeEventListener(OPEN_EVENT, listener);
			}, []);
			(0, react.useEffect)(() => {
				if (!open && !embedded) return;
				load();
				const timer = window.setInterval(load, 3e3);
				return () => window.clearInterval(timer);
			}, [
				open,
				embedded,
				load
			]);
			const review = (event) => {
				setFocusEvent(event || null);
				setView("review");
			};
			const demo = () => mutate(() => api("/demo", {
				method: "POST",
				body: "{}"
			}));
			const download = () => {
				window.location.href = `${API_ROOT}/report`;
			};
			if (!embedded && !open) return null;
			const labels = {
				overview: ["安全概览", "查看权限分布和需要立即处理的风险"],
				review: ["调用审核", "快速定位越权目标、命中规则和处理结果"],
				policy: ["策略中心", "调整默认行为和细粒度访问边界"],
				audit: ["审计记录", "本地保存每一次决策、批准和执行结果"]
			};
			const cockpit = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "fw-app",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
					className: "fw-sidebar",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-brand",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "fw-mark",
								children: "S"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Safety Cockpit" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "MCP 行动控制台" })] })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
							className: "fw-nav",
							children: [
								[
									"overview",
									"概览",
									"◫"
								],
								[
									"review",
									"审核",
									"!"
								],
								[
									"policy",
									"策略",
									"≡"
								],
								[
									"audit",
									"审计",
									"↳"
								]
							].map(([id, label, icon]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								"data-active": view === id,
								onClick: () => setView(id),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "fw-nav-icon",
										children: icon
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }),
									id === "review" && state?.stats.unresolved ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "fw-nav-count",
										children: state.stats.unresolved
									}) : null
								]
							}, id))
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-health",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "fw-health-line",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "fw-health-dot",
									"data-off": !state?.config.enabled
								}), state?.config.enabled ? "运行中 · 本地审计" : "防护已停用"]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: state?.meta.auditFile || "正在连接服务" })]
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
					className: "fw-main",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: "fw-topbar",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-title",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: labels[view][0] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: labels[view][1] })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "fw-top-actions",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "fw-button",
									onClick: demo,
									disabled: busy,
									children: "安全演练"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "fw-button fw-report-button",
									onClick: download,
									children: "导出报告"
								}),
								!embedded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "fw-button fw-icon-button",
									title: "关闭",
									"aria-label": "关闭",
									onClick: () => setOpen(false),
									children: "×"
								}) : null
							]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "fw-content",
						children: [error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "fw-error",
							children: error
						}) : null, !state ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "fw-loading",
							children: "正在读取安全状态…"
						}) : view === "overview" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Overview, {
							state,
							mutate,
							onReview: review
						}) : view === "review" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Review, {
							state,
							initial: focusEvent,
							mutate
						}) : view === "policy" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Policy, {
							state,
							mutate
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Audit, { state })]
					})]
				})]
			});
			return embedded ? cockpit : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "fw-overlay",
				children: cockpit
			});
		}
		function FirewallLaunch() {
			const [pending, setPending] = (0, react.useState)(0);
			(0, react.useEffect)(() => {
				let active = true;
				const loadPending = () => api("/state").then((state) => {
					if (active) setPending(state.stats.unresolved);
				}).catch(() => void 0);
				loadPending();
				const timer = window.setInterval(loadPending, 2e3);
				return () => {
					active = false;
					window.clearInterval(timer);
				};
			}, []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "fw-launch-row",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					className: "fw-launch",
					"data-pending": pending > 0,
					onClick: () => window.dispatchEvent(new Event(OPEN_EVENT)),
					title: pending ? `${pending} 条 MCP 调用正在等待审核` : "打开 MCP 安全驾驶舱",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "fw-launch-alert" }),
						pending ? "MCP 待审核" : "MCP 安全驾驶舱",
						pending ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "fw-launch-count",
							children: pending
						}) : null
					]
				})
			});
		}
		function riskLabel(risk) {
			return {
				read: "只读",
				network: "网络",
				destructive: "高风险",
				injection: "注入信号",
				denied: "禁止"
			}[risk] || risk;
		}
		function actionLabel(action) {
			return {
				allow: "允许",
				ask: "询问",
				deny: "阻止"
			}[action] || action;
		}
		function policySourceLabel(source) {
			return {
				"tool-deny": "工具级阻止",
				"argument-deny": "参数阻止规则",
				"host-deny": "主机阻止规则",
				"injection-signal": "Prompt Injection 风险信号",
				"session-grant": "本对话临时授权",
				"argument-ask": "参数询问规则",
				"host-ask": "主机询问规则",
				"argument-allow": "参数允许规则",
				"host-allow": "主机允许规则",
				"tool-ask": "工具每次询问",
				"tool-allow": "工具级允许",
				"risk-default": "内置风险分级",
				"global-default": "全局默认策略"
			}[source] || source;
		}
		function isUrl(value) {
			try {
				return Boolean(new URL(value).hostname);
			} catch {
				return false;
			}
		}
		function prettyArgs(text) {
			try {
				return JSON.stringify(JSON.parse(text), null, 2);
			} catch {
				return text;
			}
		}
		function shortId(value) {
			return value.length > 13 ? `${value.slice(0, 11)}…` : value;
		}
		function approvalExpiry(event) {
			if (event.approvalProcessing) return "正在保存决定";
			if (!event.approvalExpiresAt) return "不会自动拒绝";
			const seconds = Math.max(0, Math.ceil((new Date(event.approvalExpiresAt).valueOf() - Date.now()) / 1e3));
			return seconds > 60 ? `${Math.ceil(seconds / 60)} 分钟后自动拒绝` : `${seconds} 秒后自动拒绝`;
		}
		function outcomeLabel(event) {
			if (event.kind === "deny") return "调用已在执行前阻止，没有触达 MCP Server。";
			if (event.approvalPending) return event.approvalExpiresAt ? "当前工具调用已暂停，正在等待审核；超时会自动拒绝，不会让任务永久挂起。" : "当前工具调用已暂停，正在等待人工审核；自动拒绝已关闭，任务会等待到你处理或任务被取消。";
			if (event.approvalAction === "allow-session") return `用户批准了本次调用，并临时允许此对话继续访问相同目标；授权一小时后或 DSH 重启时自动失效${event.result ? `，本次执行结果：${event.result}` : ""}。`;
			if (event.approval === "allowed-once") return `用户仅批准了这组参数，本次调用已恢复${event.result ? `，执行结果：${event.result}` : ""}；长期策略没有改变。`;
			if (event.approvalAction === "reject-tool") return "用户拒绝了本次调用并阻止此工具。拒绝结果已返回 Agent；当前对话可以继续，但后续同一工具会自动阻止。";
			if (event.approvalAction === "reject-target") return "用户拒绝了本次调用并阻止同类目标。拒绝结果已返回 Agent；当前对话可以继续，但后续命中相同主机或目标会自动阻止。";
			if (event.approvalAction === "reject-session") return "用户批量拒绝了此对话中的待审调用。每个拒绝结果都已返回对应 Agent，任务仍可继续寻找其他方案。";
			if (event.approvalAction === "reject-all") return "用户执行了紧急清空，当前所有待审调用均被拒绝；各 Agent 会收到拒绝结果并继续运行。";
			if (event.approvalAction === "timeout") return "等待审核超时，系统已自动拒绝当前调用并把结果返回 Agent；长期策略没有改变。";
			if (event.approval === "rejected") return "用户只拒绝了当前工具调用，MCP Server 没有执行；拒绝结果已返回 Agent，当前对话可以继续尝试其他方案。";
			if (event.approval === "cancelled") return "审批因任务取消、重启或页面链路中断而关闭，MCP Server 没有执行。";
			if (event.approval === "unavailable") return "没有可用审批通道，系统已默认拒绝。";
			if (event.approval) return `审批结果：${event.approval}。`;
			if (event.kind === "ask") return "这条历史审批已不再关联运行中的工具调用，无法事后处理。";
			return event.result ? `已通过策略检查，执行结果：${event.result}。` : "已通过策略检查。";
		}
		const inject = ["slots"];
		function apply(ctx) {
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.dshMcpFirewall = "";
				style.textContent = FIREWALL_CSS;
				document.head.append(style);
				return () => style.remove();
			}, "mcp-firewall: styles");
			ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "mcp-firewall-launch",
				order: 4
			}, FirewallLaunch));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "mcp-firewall-overlay",
				order: 45
			}, SafetyCockpit));
			ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "mcp-firewall",
				order: 4,
				label: "安全"
			}, () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SafetyCockpit, { embedded: true })));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
