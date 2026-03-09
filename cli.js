#!/usr/bin/env node
import { parseArgs as y } from "node:util";
import { createInterface as x } from "node:readline";
import { renderCard as $, renderCardRow as O, renderCardGrid as C, fetchOgMeta as G } from "./core.js";
const p = ["title", "description", "image", "siteName", "url"];
function m() {
  console.error(`Usage: og-card <command|url> [options]

Commands:
  md <url> [url2 ...]   Generate GitHub-compatible markdown/HTML cards

Default (no subcommand):
  og-card <url> [url2 ...] [options]

Options:
  -f, --field <name>     Output only one field (${p.join(", ")})
  -j, --json             JSON output
  -p, --proxy <url>      CORS proxy prefix
  -P, --parallel <n>     Max concurrent fetches (default: 5)
  -h, --help             Show this help

Run "og-card md --help" for markdown subcommand options.`);
}
function g() {
  console.error(`Usage: og-card md <url> [url2 ...] [options]

Generate GitHub-compatible HTML cards from URLs.

Options:
  -c, --cols <n>         Cards per row (default: 2)
  -f, --format <type>    Output format: table (default), image, html
  -r, --row              Wrap output in <table><tr>...</tr></table>
  -w, --width <px>       Card width in pixels (default: 400)
      --no-desc          Omit description
      --no-title         Omit title below image
  -g, --github           Clean GitHub boilerplate from title/description
  -p, --proxy <url>      CORS proxy prefix
  -P, --parallel <n>     Max concurrent fetches (default: 5)
  -h, --help             Show this help`);
}
async function j() {
  const e = [], t = x({ input: process.stdin });
  for await (const l of t) {
    const o = l.trim();
    o && e.push(o);
  }
  return e;
}
async function w(e, t, l) {
  const o = [];
  for (let s = 0; s < e.length; s += l) {
    const a = e.slice(s, s + l), r = await Promise.all(
      a.map((n) => G(n, t).catch((u) => (console.error(`Error fetching ${n}: ${u.message}`), {})))
    );
    for (let n = 0; n < a.length; n++)
      o.push({ url: a[n], meta: r[n] });
  }
  return o;
}
function M(e, t, l) {
  if (l) {
    const o = t[l];
    o && console.log(o);
    return;
  }
  for (const o of p)
    t[o] && console.log(`${o}: ${t[o]}`);
}
async function b(e) {
  return e.length > 0 ? e : process.stdin.isTTY ? [] : j();
}
async function S(e) {
  const { values: t, positionals: l } = y({
    args: e,
    allowPositionals: !0,
    options: {
      field: { type: "string", short: "f" },
      json: { type: "boolean", short: "j", default: !1 },
      proxy: { type: "string", short: "p" },
      parallel: { type: "string", short: "P", default: "5" },
      help: { type: "boolean", short: "h", default: !1 }
    }
  });
  t.help && (m(), process.exit(0)), t.field && !p.includes(t.field) && (console.error(`Unknown field: ${t.field}`), console.error(`Valid fields: ${p.join(", ")}`), process.exit(1));
  const o = parseInt(t.parallel, 10), s = await b(l);
  s.length === 0 && (m(), process.exit(1));
  const a = await w(s, t.proxy, o);
  if (t.json) {
    const r = a.map((n) => ({ url: n.url, ...n.meta }));
    console.log(JSON.stringify(r.length === 1 ? r[0] : r, null, 2));
  } else
    for (let r = 0; r < a.length; r++)
      s.length > 1 && console.log(`
# ${a[r].url}`), M(a[r].url, a[r].meta, t.field);
}
function U(e, t, l) {
  return t.image ? `[![${l}](${t.image})](${e})` : `[${l}](${e})`;
}
async function H(e) {
  const { values: t, positionals: l } = y({
    args: e,
    allowPositionals: !0,
    options: {
      cols: { type: "string", short: "c", default: "2" },
      format: { type: "string", short: "f", default: "table" },
      row: { type: "boolean", short: "r", default: !1 },
      width: { type: "string", short: "w", default: "400" },
      "no-desc": { type: "boolean", default: !1 },
      "no-title": { type: "boolean", default: !1 },
      github: { type: "boolean", short: "g", default: !1 },
      proxy: { type: "string", short: "p" },
      parallel: { type: "string", short: "P", default: "5" },
      help: { type: "boolean", short: "h", default: !1 }
    }
  });
  t.help && (g(), process.exit(0));
  const o = t.format;
  ["table", "image", "html"].includes(o) || (console.error(`Unknown format: ${o}`), console.error("Valid formats: table, image, html"), process.exit(1));
  const s = await b(l);
  s.length === 0 && (g(), process.exit(1));
  const a = parseInt(t.parallel, 10), r = await w(s, t.proxy, a), n = parseInt(t.cols, 10), c = {
    width: parseInt(t.width, 10),
    showTitle: !t["no-title"],
    showDesc: !t["no-desc"],
    cleanGitHub: t.github
  };
  if (o === "image")
    for (const { url: i, meta: f } of r) {
      let d = f.title ?? i;
      if (c.cleanGitHub && /github\.com/.test(i)) {
        const h = i.match(/github\.com\/[^/]+\/([^/]+)/);
        h && (d = h[1]);
      }
      console.log(U(i, f, d));
    }
  else if (o === "html")
    for (const { url: i, meta: f } of r)
      console.log($(i, f, c));
  else
    t.row || r.length <= n ? console.log(O(r, c)) : console.log(C(r, { ...c, cols: n }));
}
async function I() {
  const e = process.argv.slice(2);
  e[0] === "md" ? await H(e.slice(1)) : await S(e);
}
I();
