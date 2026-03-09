"use strict";const w=require("node:util"),$=require("node:readline"),u=require("./core.cjs"),p=["title","description","image","siteName","url"];function g(){console.error(`Usage: og-card <command|url> [options]

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

Run "og-card md --help" for markdown subcommand options.`)}function y(){console.error(`Usage: og-card md <url> [url2 ...] [options]

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
  -h, --help             Show this help`)}async function O(){const t=[],e=$.createInterface({input:process.stdin});for await(const l of e){const o=l.trim();o&&t.push(o)}return t}async function b(t,e,l){const o=[];for(let s=0;s<t.length;s+=l){const a=t.slice(s,s+l),r=await Promise.all(a.map(n=>u.fetchOgMeta(n,e).catch(d=>(console.error(`Error fetching ${n}: ${d.message}`),{}))));for(let n=0;n<a.length;n++)o.push({url:a[n],meta:r[n]})}return o}function C(t,e,l){if(l){const o=e[l];o&&console.log(o);return}for(const o of p)e[o]&&console.log(`${o}: ${e[o]}`)}async function x(t){return t.length>0?t:process.stdin.isTTY?[]:O()}async function G(t){const{values:e,positionals:l}=w.parseArgs({args:t,allowPositionals:!0,options:{field:{type:"string",short:"f"},json:{type:"boolean",short:"j",default:!1},proxy:{type:"string",short:"p"},parallel:{type:"string",short:"P",default:"5"},help:{type:"boolean",short:"h",default:!1}}});e.help&&(g(),process.exit(0)),e.field&&!p.includes(e.field)&&(console.error(`Unknown field: ${e.field}`),console.error(`Valid fields: ${p.join(", ")}`),process.exit(1));const o=parseInt(e.parallel,10),s=await x(l);s.length===0&&(g(),process.exit(1));const a=await b(s,e.proxy,o);if(e.json){const r=a.map(n=>({url:n.url,...n.meta}));console.log(JSON.stringify(r.length===1?r[0]:r,null,2))}else for(let r=0;r<a.length;r++)s.length>1&&console.log(`
# ${a[r].url}`),C(a[r].url,a[r].meta,e.field)}function j(t,e,l){return e.image?`[![${l}](${e.image})](${t})`:`[${l}](${t})`}async function M(t){const{values:e,positionals:l}=w.parseArgs({args:t,allowPositionals:!0,options:{cols:{type:"string",short:"c",default:"2"},format:{type:"string",short:"f",default:"table"},row:{type:"boolean",short:"r",default:!1},width:{type:"string",short:"w",default:"400"},"no-desc":{type:"boolean",default:!1},"no-title":{type:"boolean",default:!1},github:{type:"boolean",short:"g",default:!1},proxy:{type:"string",short:"p"},parallel:{type:"string",short:"P",default:"5"},help:{type:"boolean",short:"h",default:!1}}});e.help&&(y(),process.exit(0));const o=e.format;["table","image","html"].includes(o)||(console.error(`Unknown format: ${o}`),console.error("Valid formats: table, image, html"),process.exit(1));const s=await x(l);s.length===0&&(y(),process.exit(1));const a=parseInt(e.parallel,10),r=await b(s,e.proxy,a),n=parseInt(e.cols,10),c={width:parseInt(e.width,10),showTitle:!e["no-title"],showDesc:!e["no-desc"],cleanGitHub:e.github};if(o==="image")for(const{url:i,meta:f}of r){let h=f.title??i;if(c.cleanGitHub&&/github\.com/.test(i)){const m=i.match(/github\.com\/[^/]+\/([^/]+)/);m&&(h=m[1])}console.log(j(i,f,h))}else if(o==="html")for(const{url:i,meta:f}of r)console.log(u.renderCard(i,f,c));else e.row||r.length<=n?console.log(u.renderCardRow(r,c)):console.log(u.renderCardGrid(r,{...c,cols:n}))}async function S(){const t=process.argv.slice(2);t[0]==="md"?await M(t.slice(1)):await G(t)}S();
