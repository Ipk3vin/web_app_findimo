
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  baseHref: "/",
  criticalCssPlans: [[1,"/styles-7XER3MTO.css",1400,["button","a","input","select","textarea"],[],[[5,":root","{--color-primary-navy:#123055;--color-navy-dark:#0c213b;--color-navy-light:#1c416e;--color-navy-section:#143359;--color-accent-orange:#f26422;--color-accent-orange-hover:#dc5212;--color-accent-teal:#00b4b6;--color-accent-teal-light:rgba(0, 180, 182, .12);--color-bg-light:#f8fafc;--color-card-bg:#ffffff;--color-border:#e2e8f0;--color-text-dark:#0f172a;--color-text-muted:#64748b;--color-text-light:#94a3b8;--color-white:#ffffff;--font-family:\"Plus Jakarta Sans\", \"Inter\", system-ui, -apple-system, sans-serif;--radius-sm:8px;--radius-md:12px;--radius-lg:16px;--radius-pill:9999px;--shadow-sm:0 1px 3px rgba(0, 0, 0, .05);--shadow-md:0 4px 20px -2px rgba(18, 48, 85, .08);--shadow-lg:0 10px 25px -5px rgba(18, 48, 85, .12)}",[0]],[5,["*","*:before","*:after"],"{box-sizing:border-box;margin:0;padding:0}",[0,0,0]],[37,"html","{scroll-behavior:smooth;font-family:var(--font-family);color:var(--color-text-dark);background-color:#fff;-webkit-font-smoothing:antialiased}",[0],["var(--font-family)"]],[5,"body","{margin:0;padding:0;line-height:1.5;min-height:100vh}",[0]],[5,1,"{font-family:inherit;cursor:pointer;border:none;background:none;transition:all .2s ease}",[3]],[5,2,"{text-decoration:none;color:inherit;transition:all .2s ease}",[3]],[5,[3,4,5],"{font-family:inherit}",[3,3,3]]]]],
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    "index.csr.html": {size: 18135, hash: "54f6864fee42637c", text: () => import("./assets-chunks/index_csr_html.mjs").then(m => m.default)},
    "index.server.html": {size: 17352, hash: "3a4de871ee2c07fd", text: () => import("./assets-chunks/index_server_html.mjs").then(m => m.default)},
    "index.html": {size: 70605, hash: "416dfbeb756f6766", text: () => import("./assets-chunks/index_html.mjs").then(m => m.default)}
  },
};
