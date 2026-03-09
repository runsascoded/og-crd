import { fetchOgMeta as N } from "./core.js";
import { cleanGitHubDescription as M, decodeHtmlEntities as D, parseOgTags as G, renderCard as H, renderCardGrid as L, renderCardRow as R, resolveProxy as T } from "./core.js";
import { jsxs as p, jsx as n } from "react/jsx-runtime";
import { useState as f, useEffect as u } from "react";
const w = (e = "both") => e === "none" ? "" : `hover-${e}`, C = ({
  thumbnail: e,
  title: a,
  description: o,
  icons: s,
  href: c,
  className: t,
  aspectRatio: d = 1.91,
  hoverEffect: i = "both"
}) => {
  const l = { "--og-card-ar": d }, r = !!e, h = /* @__PURE__ */ p("div", { className: "og-card-inner", children: [
    r ? /* @__PURE__ */ n("div", { className: "og-card-thumbnail", children: typeof e == "string" ? /* @__PURE__ */ n("img", { src: e, alt: a, loading: "lazy" }) : e }) : /* @__PURE__ */ n("div", { className: "og-card-placeholder", children: /* @__PURE__ */ n("span", { className: "og-card-placeholder-title", children: a }) }),
    r && /* @__PURE__ */ p("div", { className: "og-card-overlay", children: [
      /* @__PURE__ */ n("h3", { className: "og-card-title", children: a }),
      o && /* @__PURE__ */ n("p", { className: "og-card-description", children: o }),
      s && s.length > 0 && /* @__PURE__ */ n("div", { className: "og-card-icons", children: s })
    ] })
  ] }), m = ["og-card", w(i), t].filter(Boolean).join(" ");
  return /* @__PURE__ */ n("div", { className: m, children: c ? /* @__PURE__ */ n("a", { className: "og-card-link", href: c, target: "_blank", rel: "noopener noreferrer", style: l, children: h }) : /* @__PURE__ */ n("div", { className: "og-card-link", style: l, children: h }) });
}, g = /* @__PURE__ */ new Map();
function y(e, a) {
  const [o, s] = f(g.get(e) ?? null), [c, t] = f(!g.has(e)), [d, i] = f(null);
  return u(() => {
    if (g.has(e)) {
      s(g.get(e)), t(!1);
      return;
    }
    let l = !1;
    return t(!0), i(null), N(e, a).then((r) => {
      l || (g.set(e, r), s(r), t(!1));
    }).catch((r) => {
      l || (i(r), t(!1));
    }), () => {
      l = !0;
    };
  }, [e, a]), { data: o, loading: c, error: d };
}
const O = ({
  url: e,
  proxy: a,
  title: o,
  description: s,
  thumbnail: c,
  icons: t,
  className: d,
  aspectRatio: i = 1.91,
  hoverEffect: l = "both"
}) => {
  const { data: r, loading: h } = y(e, a);
  if (h) {
    const v = { "--og-card-ar": i };
    return /* @__PURE__ */ n("div", { className: ["og-card", "og-card-skeleton", d].filter(Boolean).join(" "), children: /* @__PURE__ */ n("div", { className: "og-card-link", style: v, children: /* @__PURE__ */ n("div", { className: "og-card-inner" }) }) });
  }
  const m = new URL(e).hostname.replace(/^www\./, "");
  return /* @__PURE__ */ n(
    C,
    {
      thumbnail: c ?? (r == null ? void 0 : r.image),
      title: o ?? (r == null ? void 0 : r.title) ?? m,
      description: s ?? (r == null ? void 0 : r.description),
      icons: t,
      href: e,
      className: d,
      aspectRatio: i,
      hoverEffect: l
    }
  );
}, x = ({
  children: e,
  className: a,
  gap: o = "1rem"
}) => {
  const s = { gap: o }, c = ["og-card-row", a].filter(Boolean).join(" ");
  return /* @__PURE__ */ n("div", { className: c, style: s, children: e });
};
export {
  x as CardRow,
  C as OgCard,
  O as OgCardFromUrl,
  M as cleanGitHubDescription,
  D as decodeHtmlEntities,
  N as fetchOgMeta,
  G as parseOgTags,
  H as renderCard,
  L as renderCardGrid,
  R as renderCardRow,
  T as resolveProxy,
  y as useOgMeta
};
