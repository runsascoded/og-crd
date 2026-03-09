function g(n, e) {
  return e ? typeof e == "function" ? e(n) : `${e}${encodeURIComponent(n)}` : n;
}
const d = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'"
}, $ = /&(?:amp|lt|gt|quot|#39|apos);/g;
function f(n) {
  return n.replace($, (e) => d[e] ?? e);
}
function b(n, e) {
  const t = [
    /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+rel=["']icon["'][^>]+type=["']image\/png["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+rel=["']icon["'][^>]+href=["']([^"']+)["']/i
  ];
  for (const i of t) {
    const c = n.match(i);
    if (c) {
      const o = c[1];
      if (/^https?:\/\//.test(o)) return o;
      const a = new URL(e);
      return new URL(o, a).href;
    }
  }
}
function w(n) {
  const e = n.match(/<title[^>]*>([^<]+)<\/title>/i);
  return e ? f(e[1].trim()) : void 0;
}
function p(n, e) {
  const t = (o) => {
    const a = new RegExp(`<meta[^>]+property=["']og:${o}["'][^>]+content=["']([^"']+)["']`, "i"), r = n.match(a);
    if (r) return f(r[1]);
    const s = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${o}["']`, "i"), l = n.match(s);
    return l ? f(l[1]) : void 0;
  }, i = t("title") ?? w(n), c = t("image") ?? (e ? b(n, e) : void 0);
  return {
    title: i,
    description: t("description"),
    image: c,
    siteName: t("site_name"),
    url: t("url")
  };
}
async function G(n, e) {
  const t = await fetch(g(n, e));
  return p(await t.text(), n);
}
const T = [
  /^Contribute to .+ on GitHub\.?$/i,
  /\.?\s*Contribute to .+ on GitHub\.?$/i,
  /^GitHub - [^:]+: /,
  / - [A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/
], H = /^GitHub - /;
function E(n) {
  let e = n.trim();
  for (const t of T)
    t.test(e) && (e = e.replace(t, ""));
  return e.trim();
}
function R(n, e) {
  var c;
  let t = n.replace(H, "");
  const i = e.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (i) {
    const o = `${i[1]}/${i[2]}`, a = new RegExp(`^${i[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/[^:]+:\\s*`);
    if (t.startsWith(`${o}: `))
      t = i[2];
    else if (t === o)
      t = i[2];
    else if (a.test(t)) {
      const r = (c = t.match(/^[^/]+\/([^:]+)/)) == null ? void 0 : c[1];
      r && (t = r);
    }
  }
  return t.trim();
}
function u(n) {
  return n.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function h(n, e, t) {
  const i = (t == null ? void 0 : t.width) ?? 400, c = (t == null ? void 0 : t.showTitle) ?? !0, o = (t == null ? void 0 : t.showDesc) ?? !0, a = (t == null ? void 0 : t.cleanGitHub) ?? !0;
  let r = e.title ?? "", s = e.description ?? "";
  a && /github\.com/.test(n) && (r && (r = R(r, n)), s && (s = E(s)));
  const l = [];
  e.image && l.push(`<img src="${u(e.image)}" alt="${u(r)}" width="${i}">`), c && r && l.push(`<br><b>${u(r)}</b>`), o && s && l.push(`<br><sub>${u(s)}</sub>`);
  const m = l.join(`
`);
  return `<td width="${i}" valign="top">
<a href="${u(n)}">
${m}
</a>
</td>`;
}
function C(n, e) {
  return `<table><tr>
${n.map((i) => h(i.url, i.meta, e)).join(`
`)}
</tr></table>`;
}
function I(n, e) {
  const t = (e == null ? void 0 : e.cols) ?? 2, i = [];
  for (let c = 0; c < n.length; c += t) {
    const a = n.slice(c, c + t).map((r) => h(r.url, r.meta, e));
    i.push(`<tr>
${a.join(`
`)}
</tr>`);
  }
  return `<table>
${i.join(`
`)}
</table>`;
}
export {
  E as cleanGitHubDescription,
  R as cleanGitHubTitle,
  f as decodeHtmlEntities,
  G as fetchOgMeta,
  p as parseOgTags,
  h as renderCard,
  I as renderCardGrid,
  C as renderCardRow,
  g as resolveProxy
};
