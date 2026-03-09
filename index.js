import { fetchOgMeta as C, cleanGitHubTitle as y, cleanGitHubDescription as j } from "./core.js";
import { decodeHtmlEntities as R, parseOgTags as U, renderCard as $, renderCardGrid as z, renderCardRow as F, resolveProxy as P } from "./core.js";
import { jsxs as u, jsx as s } from "react/jsx-runtime";
import { useState as f, useEffect as k } from "react";
const O = (r = "both") => r === "none" ? "" : `hover-${r}`, x = ({
  thumbnail: r,
  title: o,
  description: c,
  icons: n,
  href: a,
  className: t,
  aspectRatio: d = 1.91,
  hoverEffect: i = "both"
}) => {
  const l = { "--og-card-ar": d }, e = !!r, h = /* @__PURE__ */ u("div", { className: "og-card-inner", children: [
    e ? /* @__PURE__ */ s("div", { className: "og-card-thumbnail", children: typeof r == "string" ? /* @__PURE__ */ s("img", { src: r, alt: o, loading: "lazy" }) : r }) : /* @__PURE__ */ s("div", { className: "og-card-placeholder", children: /* @__PURE__ */ s("span", { className: "og-card-placeholder-title", children: o }) }),
    e && /* @__PURE__ */ u("div", { className: "og-card-overlay", children: [
      /* @__PURE__ */ s("h3", { className: "og-card-title", children: o }),
      c && /* @__PURE__ */ s("p", { className: "og-card-description", children: c }),
      n && n.length > 0 && /* @__PURE__ */ s("div", { className: "og-card-icons", children: n })
    ] })
  ] }), m = ["og-card", O(i), t].filter(Boolean).join(" ");
  return /* @__PURE__ */ s("div", { className: m, children: a ? /* @__PURE__ */ s("a", { className: "og-card-link", href: a, target: "_blank", rel: "noopener noreferrer", style: l, children: h }) : /* @__PURE__ */ s("div", { className: "og-card-link", style: l, children: h }) });
}, g = /* @__PURE__ */ new Map();
function G(r, o) {
  const [c, n] = f(g.get(r) ?? null), [a, t] = f(!g.has(r)), [d, i] = f(null);
  return k(() => {
    if (g.has(r)) {
      n(g.get(r)), t(!1);
      return;
    }
    let l = !1;
    return t(!0), i(null), C(r, o).then((e) => {
      l || (g.set(r, e), n(e), t(!1));
    }).catch((e) => {
      l || (i(e), t(!1));
    }), () => {
      l = !0;
    };
  }, [r, o]), { data: c, loading: a, error: d };
}
const D = ({
  url: r,
  proxy: o,
  title: c,
  description: n,
  thumbnail: a,
  icons: t,
  className: d,
  aspectRatio: i = 1.91,
  hoverEffect: l = "both"
}) => {
  const { data: e, loading: h } = G(r, o);
  if (h) {
    const b = { "--og-card-ar": i };
    return /* @__PURE__ */ s("div", { className: ["og-card", "og-card-skeleton", d].filter(Boolean).join(" "), children: /* @__PURE__ */ s("div", { className: "og-card-link", style: b, children: /* @__PURE__ */ s("div", { className: "og-card-inner" }) }) });
  }
  const m = new URL(r), v = m.hostname.replace(/^www\./, ""), w = /^(www\.)?github\.com$/.test(m.hostname);
  let p = c ?? (e == null ? void 0 : e.title) ?? v, N = n ?? (e == null ? void 0 : e.description);
  return w && (p = c ?? y((e == null ? void 0 : e.title) ?? v, r), N = n ?? (e != null && e.description ? j(e.description) : void 0)), /* @__PURE__ */ s(
    x,
    {
      thumbnail: a ?? (e == null ? void 0 : e.image),
      title: p,
      description: N,
      icons: t,
      href: r,
      className: d,
      aspectRatio: i,
      hoverEffect: l
    }
  );
}, E = ({
  children: r,
  className: o,
  gap: c = "1rem"
}) => {
  const n = { gap: c }, a = ["og-card-row", o].filter(Boolean).join(" ");
  return /* @__PURE__ */ s("div", { className: a, style: n, children: r });
};
export {
  E as CardRow,
  x as OgCard,
  D as OgCardFromUrl,
  j as cleanGitHubDescription,
  R as decodeHtmlEntities,
  C as fetchOgMeta,
  U as parseOgTags,
  $ as renderCard,
  z as renderCardGrid,
  F as renderCardRow,
  P as resolveProxy,
  G as useOgMeta
};
