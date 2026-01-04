(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function n(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(o){if(o.ep)return;o.ep=!0;const r=n(o);fetch(o.href,r)}})();const K=(e,t)=>t.some(n=>e instanceof n);let pe,fe;function Je(){return pe||(pe=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Ge(){return fe||(fe=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Q=new WeakMap,z=new WeakMap,H=new WeakMap;function Ke(e){const t=new Promise((n,a)=>{const o=()=>{e.removeEventListener("success",r),e.removeEventListener("error",i)},r=()=>{n(w(e.result)),o()},i=()=>{a(e.error),o()};e.addEventListener("success",r),e.addEventListener("error",i)});return H.set(t,e),t}function Qe(e){if(Q.has(e))return;const t=new Promise((n,a)=>{const o=()=>{e.removeEventListener("complete",r),e.removeEventListener("error",i),e.removeEventListener("abort",i)},r=()=>{n(),o()},i=()=>{a(e.error||new DOMException("AbortError","AbortError")),o()};e.addEventListener("complete",r),e.addEventListener("error",i),e.addEventListener("abort",i)});Q.set(e,t)}let Z={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return Q.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return w(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function Le(e){Z=e(Z)}function Ze(e){return Ge().includes(e)?function(...t){return e.apply(Y(this),t),w(this.request)}:function(...t){return w(e.apply(Y(this),t))}}function Ye(e){return typeof e=="function"?Ze(e):(e instanceof IDBTransaction&&Qe(e),K(e,Je())?new Proxy(e,Z):e)}function w(e){if(e instanceof IDBRequest)return Ke(e);if(z.has(e))return z.get(e);const t=Ye(e);return t!==e&&(z.set(e,t),H.set(t,e)),t}const Y=e=>H.get(e);function Xe(e,t,{blocked:n,upgrade:a,blocking:o,terminated:r}={}){const i=indexedDB.open(e,t),s=w(i);return a&&i.addEventListener("upgradeneeded",d=>{a(w(i.result),d.oldVersion,d.newVersion,w(i.transaction),d)}),n&&i.addEventListener("blocked",d=>n(d.oldVersion,d.newVersion,d)),s.then(d=>{r&&d.addEventListener("close",()=>r()),o&&d.addEventListener("versionchange",l=>o(l.oldVersion,l.newVersion,l))}).catch(()=>{}),s}const et=["get","getKey","getAll","getAllKeys","count"],tt=["put","add","delete","clear"],J=new Map;function ge(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(J.get(t))return J.get(t);const n=t.replace(/FromIndex$/,""),a=t!==n,o=tt.includes(n);if(!(n in(a?IDBIndex:IDBObjectStore).prototype)||!(o||et.includes(n)))return;const r=async function(i,...s){const d=this.transaction(i,o?"readwrite":"readonly");let l=d.store;return a&&(l=l.index(s.shift())),(await Promise.all([l[n](...s),o&&d.done]))[0]};return J.set(t,r),r}Le(e=>({...e,get:(t,n,a)=>ge(t,n)||e.get(t,n,a),has:(t,n)=>!!ge(t,n)||e.has(t,n)}));const nt=["continue","continuePrimaryKey","advance"],he={},X=new WeakMap,De=new WeakMap,ot={get(e,t){if(!nt.includes(t))return e[t];let n=he[t];return n||(n=he[t]=function(...a){X.set(this,De.get(this)[t](...a))}),n}};async function*at(...e){let t=this;if(t instanceof IDBCursor||(t=await t.openCursor(...e)),!t)return;t=t;const n=new Proxy(t,ot);for(De.set(n,t),H.set(n,Y(t));t;)yield n,t=await(X.get(n)||t.continue()),X.delete(n)}function ye(e,t){return t===Symbol.asyncIterator&&K(e,[IDBIndex,IDBObjectStore,IDBCursor])||t==="iterate"&&K(e,[IDBIndex,IDBObjectStore])}Le(e=>({...e,get(t,n,a){return ye(t,n)?at:e.get(t,n,a)},has(t,n){return ye(t,n)||e.has(t,n)}}));const Be="commander-db",Ce=3,D="documents",B="pending",oe=3;let S=null;async function M(){return S||(S=await Xe(Be,Ce,{upgrade(e,t,n){console.log(`[DB] Upgrading from v${t} to v${n}`),e.objectStoreNames.contains(D)||e.createObjectStore(D,{keyPath:"id"}),e.objectStoreNames.contains(B)||e.createObjectStore(B,{keyPath:"id"})}}),await rt(),S)}async function rt(){const e=await S.get(D,"main");if(!e)return;let t=!1;const n={...e};n.schemaVersion||(console.log("[DB] Migrating: Adding schemaVersion"),n.schemaVersion=1,t=!0),n.schemaVersion<2&&(console.log("[DB] Migrating v1 → v2: Ensuring logs array"),Array.isArray(n.logs)||(n.logs=[]),n.schemaVersion=2,t=!0),n.schemaVersion<3&&(console.log("[DB] Migrating v2 → v3: Ensuring shipped array"),Array.isArray(n.shipped)||(n.shipped=[]),["inbox","next","shipToday"].forEach(a=>{Array.isArray(n[a])&&(n[a]=n[a].map((o,r)=>o.id?o:{...o,id:`migrated_${a}_${r}_${Date.now()}`}))}),n.schemaVersion=3,t=!0),t&&(console.log("[DB] Saving migrated document"),await N(n))}async function N(e){const n=(await M()).transaction(D,"readwrite");await n.store.put({id:"main",schemaVersion:oe,...e,updatedAt:Date.now()}),await n.done,await st()}async function Ae(){const e=await M(),t=await e.get(B,"main");return t?(console.log("[DB] Recovering from pending write"),await N(t),t):e.get(D,"main")}async function it(e){const n=(await M()).transaction(B,"readwrite");await n.store.put({id:"main",...e,pendingAt:Date.now()}),await n.done}async function st(){const t=(await M()).transaction(B,"readwrite");await t.store.delete("main"),await t.done}function ae(){return{schemaVersion:oe,inbox:[],next:[],shipToday:[],logs:[],shipped:[]}}async function Oe(){var e,t,n,a,o;try{const r=await Ae();return{dbName:Be,dbVersion:Ce,schemaVersion:(r==null?void 0:r.schemaVersion)||"unknown",itemCounts:{inbox:((e=r==null?void 0:r.inbox)==null?void 0:e.length)||0,next:((t=r==null?void 0:r.next)==null?void 0:t.length)||0,shipToday:((n=r==null?void 0:r.shipToday)==null?void 0:n.length)||0,logs:((a=r==null?void 0:r.logs)==null?void 0:a.length)||0,shipped:((o=r==null?void 0:r.shipped)==null?void 0:o.length)||0},lastUpdated:r!=null&&r.updatedAt?new Date(r.updatedAt).toISOString():"never"}}catch(r){return{error:r.message}}}let c=ae(),k=null,P=null;const ee=new Set;let _="idle",re="tasks";const ct=300;function U(){return Date.now().toString(36)+Math.random().toString(36).substr(2,5)}function x(){return c}function dt(){return _}function R(){return re}function b(e){re=e,u()}function lt(e){return ee.add(e),()=>ee.delete(e)}function u(){ee.forEach(e=>e(c,_,re))}function $(e){_=e,u()}function h(){P&&clearTimeout(P),it(c).catch(console.error),$("saving"),P=setTimeout(async()=>{try{await N(c),$("saved"),setTimeout(()=>{_==="saved"&&$("idle")},2e3)}catch(e){console.error("[State] Save failed:",e),$("error")}},ct)}function f(){k=JSON.parse(JSON.stringify(c))}async function be(){try{const e=await Ae();e&&(c={inbox:e.inbox||[],next:e.next||[],shipToday:e.shipToday||[],logs:e.logs||[]}),u()}catch(e){console.error("[State] Failed to load:",e),c=ae(),u()}}function F(e,t=""){f();const n={id:U(),text:t};return c[e]=[...c[e],n],h(),u(),n.id}function ve(e,t,n){c[e].findIndex(o=>o.id===t)!==-1&&(P||f(),c[e]=c[e].map(o=>o.id===t?{...o,text:n}:o),h(),u())}function Me(e,t){f(),c[e]=c[e].filter(n=>n.id!==t),h(),u()}function ut(e,t,n){if(e===t)return;f();const a=c[e].find(o=>o.id===n);a&&(c[e]=c[e].filter(o=>o.id!==n),c[t]=[...c[t],a],h(),u())}function mt(){f(),c=ae(),h(),u()}function pt(){if(!k)return!1;const e=c;return c=k,k=e,h(),u(),!0}function ft(){return k!==null}async function gt(e){f(),c={inbox:Array.isArray(e.inbox)?e.inbox:[],next:Array.isArray(e.next)?e.next:[],shipToday:Array.isArray(e.shipToday)?e.shipToday:[],logs:Array.isArray(e.logs)?e.logs:[]},await N(c),u()}function ht(e,t="manual",n="logs",a=[]){f();const o={id:U(),createdAt:new Date().toISOString(),source:t,route:n,tags:a,content:e.trim()};if(c.logs=[o,...c.logs],n==="inbox"||n==="next"||n==="shipToday"){const r={id:U(),text:e.trim()};c[n]=[...c[n],r]}return h(),u(),o.id}function yt(e){f(),c.logs=c.logs.filter(t=>t.id!==e),h(),u()}function bt(e){if(!e||!e.trim())return c.logs||[];const t=e.toLowerCase().trim();return(c.logs||[]).filter(n=>n.content.toLowerCase().includes(t)||n.tags.some(a=>a.toLowerCase().includes(t)))}function vt(e,t,n,a){var i;if(!n||!n.trim())throw new Error("Save As is required");if(!a||!a.trim())throw new Error("Definition of Done is required");f();const o=(i=c[e])==null?void 0:i.find(s=>s.id===t);if(!o)return null;const r={id:U(),originalId:t,text:o.text,saveAs:n.trim(),definitionOfDone:a.trim(),shippedAt:new Date().toISOString(),fromSection:e,logLine:`${new Date().toLocaleTimeString()} | SHIPPED: ${n.trim()} — DoD: ${a.trim()}`};return c.shipped||(c.shipped=[]),c.shipped.unshift(r),c[e]=c[e].filter(s=>s.id!==t),h(),u(),r}function Ne(){if(!c.shipped)return[];const e=new Date().toISOString().split("T")[0];return c.shipped.filter(t=>t.shippedAt&&t.shippedAt.startsWith(e))}async function wt(e){f(),c={inbox:e.inbox||[],next:e.next||[],shipToday:e.shipToday||[],logs:e.logs||[],shipped:c.shipped||[]},await N(c),u()}async function xt(){return"serviceWorker"in navigator?!!(await navigator.serviceWorker.ready).active:!1}function Et(){const e=x();let t=`# Commander

`;t+=`## Inbox
`,e.inbox.length===0?t+=`- (empty)
`:e.inbox.forEach(a=>{t+=`- ${a.text||"(empty)"}
`}),t+=`
`,t+=`## Next
`,e.next.length===0?t+=`- (empty)
`:e.next.forEach(a=>{t+=`- ${a.text||"(empty)"}
`}),t+=`
`,t+=`## Ship Today
`,e.shipToday.length===0?t+=`- (empty)
`:e.shipToday.forEach(a=>{t+=`- ${a.text||"(empty)"}
`}),t+=`
`,t+=`## Logs
`;const n=e.logs||[];return n.length===0?t+=`- (empty)
`:n.forEach(a=>{const o=new Date(a.createdAt).toLocaleString(),i=(a.content.length>100?a.content.substring(0,100)+"...":a.content).replace(/\n/g," ");t+=`- [${o}] ${i}
`}),t}function St(){const e=x(),t={version:2,exportedAt:new Date().toISOString(),data:{inbox:e.inbox,next:e.next,shipToday:e.shipToday,logs:e.logs||[]}};return JSON.stringify(t,null,2)}function ie(e,t,n){const a=new Blob([e],{type:n}),o=URL.createObjectURL(a),r=document.createElement("a");r.href=o,r.download=t,r.style.display="none",document.body.appendChild(r),r.click(),document.body.removeChild(r),setTimeout(()=>URL.revokeObjectURL(o),100)}function kt(){const e=Et(),t=new Date().toISOString().split("T")[0];ie(e,`commander-${t}.md`,"text/markdown")}function It(){const e=St(),t=new Date().toISOString().split("T")[0];ie(e,`commander-${t}.json`,"application/json")}function Tt(e){let t;try{t=JSON.parse(e)}catch{throw new Error("Invalid JSON format")}const n=t.data||t;if(!n||typeof n!="object")throw new Error("Invalid data structure");const a={inbox:[],next:[],shipToday:[],logs:[]};return["inbox","next","shipToday"].forEach(o=>{Array.isArray(n[o])&&(a[o]=n[o].map(r=>typeof r=="string"?{id:E(),text:r}:r&&typeof r=="object"&&"text"in r?{id:r.id||E(),text:String(r.text||"")}:null).filter(Boolean))}),Array.isArray(n.logs)&&(a.logs=n.logs.map(o=>o&&typeof o=="object"&&"content"in o?{id:o.id||E(),createdAt:o.createdAt||new Date().toISOString(),source:o.source||"manual",route:o.route||"logs",tags:Array.isArray(o.tags)?o.tags:[],content:String(o.content||"")}:null).filter(Boolean)),a}function E(){return Date.now().toString(36)+Math.random().toString(36).substr(2,5)}function Lt(){const e=x(),t={schemaVersion:2,appVersion:"2026-01-04T00:04:23.766Z",createdAt:new Date().toISOString(),backup:!0,data:{inbox:e.inbox||[],next:e.next||[],shipToday:e.shipToday||[],logs:e.logs||[]}};return JSON.stringify(t,null,2)}function Dt(){const e=Lt(),t=new Date().toISOString().split("T")[0],n=new Date().toISOString().split("T")[1].split(".")[0].replace(/:/g,"-");ie(e,`commander-backup-${t}_${n}.json`,"application/json")}function Bt(e,t){let n;try{n=JSON.parse(e)}catch{throw new Error("Invalid JSON format")}const a=n.data||n;if(!a||typeof a!="object")throw new Error("Invalid backup structure");const o={imported:{inbox:0,next:0,shipToday:0,logs:0},skipped:{inbox:0,next:0,shipToday:0,logs:0}},r={inbox:[...t.inbox||[]],next:[...t.next||[]],shipToday:[...t.shipToday||[]],logs:[...t.logs||[]]};function i(s,d,l){return s.some(me=>me.id===d.id||l&&me[l]===d[l])}return["inbox","next","shipToday"].forEach(s=>{Array.isArray(a[s])&&a[s].forEach(d=>{if(!d)return;const l=typeof d=="string"?{id:E(),text:d}:{id:d.id||E(),text:String(d.text||"")};i(r[s],l,"text")?o.skipped[s]++:(r[s].push(l),o.imported[s]++)})}),Array.isArray(a.logs)&&a.logs.forEach(s=>{if(!s||typeof s!="object"||!s.content)return;const d={id:s.id||E(),createdAt:s.createdAt||new Date().toISOString(),source:s.source||"import",route:s.route||"logs",category:s.category||"Note",tags:Array.isArray(s.tags)?s.tags:[],content:String(s.content||"")};i(r.logs,d,"content")?o.skipped.logs++:(r.logs.push(d),o.imported.logs++)}),r.logs.sort((s,d)=>new Date(d.createdAt)-new Date(s.createdAt)),{...r,stats:o}}const $e={MissionControl:{name:"Morning Mission Control",icon:"🎯",description:"Daily mission briefing and priority alignment",template:`# 🎯 MISSION CONTROL — {{DATE}}

## HUD
- **Energy:** [1-10]
- **Focus Window:** [time range]
- **Top Constraint:** [what's blocking]
- **Today Agenda:** {{AGENDA}}

## Priority Stack
1. 
2. 
3. 

## Critical Path
- [ ] 

## Risks / Blockers
- 

## Next Step
> 

---
## 60s Verify
- [ ] Priorities clear
- [ ] No conflicting commits
- [ ] Resources available

## LOG
- {{TIMESTAMP}} | Mission Control initialized
`},MicroResearch:{name:"Mid-Morning Micro Research Sprint",icon:"🔬",description:"Focused research burst with tight scope",template:`# 🔬 MICRO RESEARCH — {{DATE}}

## HUD
- **Query:** [specific question]
- **Time Box:** 25 min
- **Success Criteria:** [what would be a good answer]

## Sources Checked
- [ ] 
- [ ] 
- [ ] 

## Findings
### Key Insight 1
> 

### Key Insight 2
> 

## Decision / Recommendation
> 

---
## 60s Verify
- [ ] Question answered
- [ ] Sources cited
- [ ] Actionable next step

## Failure Fixes
1. If research incomplete → scope down
2. If conflicting info → note both, flag for later
3. If no results → reframe question

## LOG
- {{TIMESTAMP}} | Research started
`},BuildBlock:{name:"Daily Build Block",icon:"🧱",description:"Deep work implementation session",template:`# 🧱 BUILD BLOCK — {{DATE}}

## HUD
- **Target:** [what to ship]
- **Definition of Done:** [how we know it's done]
- **Time Box:** [hours]
- **Dependencies:** [what's needed]

## Scope (DO)
- [ ] 
- [ ] 
- [ ] 

## Out of Scope (DON'T)
- 
- 

## Progress Log
| Time | Action | Result |
|------|--------|--------|
| | | |

## Blockers Encountered
- 

## Ship Checklist
- [ ] Code works
- [ ] Tested locally
- [ ] No console errors
- [ ] Committed with clear message

---
## 60s Verify
- [ ] DoD met
- [ ] No regressions
- [ ] Ship status updated

## Failure Fixes
1. If blocked → capture state, switch task
2. If scope creep → log it, defer
3. If energy low → 10 min break, then reassess

## Delta Patch
> Changes to carry forward:

## LOG
- {{TIMESTAMP}} | Build block started
`},NightlyDelta:{name:"Nightly System Delta + Tomorrow Seed",icon:"🌙",description:"End of day review and tomorrow prep",template:`# 🌙 NIGHTLY DELTA — {{DATE}}

## Today's Shipped
| Item | DoD | Status |
|------|-----|--------|
| | | ✅/❌ |

## Progress Summary
> 

## Lessons / Observations
- 

## Open Loops
- [ ] 
- [ ] 

## Tomorrow Seed
### Top 3 Priorities
1. 
2. 
3. 

### First Action (no decisions needed)
> 

### Known Blockers
- 

---
## 60s Verify
- [ ] Today reviewed
- [ ] Tomorrow prepped
- [ ] Mind clear

## LOG
- {{TIMESTAMP}} | Nightly delta complete
`}};function Pe(e,t={}){const n=$e[e];if(!n)return"";const a=new Date,o=a.toISOString().split("T")[0],r=a.toLocaleTimeString();let i=n.template;return i=i.replace(/\{\{DATE\}\}/g,o),i=i.replace(/\{\{TIMESTAMP\}\}/g,r),i=i.replace(/\{\{AGENDA\}\}/g,t.agenda||"[paste today's agenda]"),i}function Ct(){return Object.entries($e).map(([e,t])=>({key:e,name:t.name,icon:t.icon,description:t.description}))}let C,te,g,se,ce,I,T,Re,Ve,ne,A,we,xe,je,Ee,V,Ue,p=null,v=null,y=null,W=null,j="",L=null;const Fe=500,At={inbox:{icon:"📥",title:"Inbox",className:"section-inbox"},next:{icon:"📋",title:"Next",className:"section-next"},shipToday:{icon:"🚀",title:"Ship Today",className:"section-ship"}};function Ot(){C=document.getElementById("commander"),te=document.getElementById("captureView"),g=document.getElementById("saveStatus"),se=document.getElementById("contextMenu"),ce=document.getElementById("logContextMenu"),I=document.getElementById("menuOverlay"),T=document.getElementById("confirmOverlay"),Re=document.getElementById("confirmTitle"),Ve=document.getElementById("confirmMessage"),ne=document.getElementById("importInput"),A=document.getElementById("captureTextarea"),we=document.getElementById("pasteBtn"),xe=document.getElementById("saveLogBtn"),je=document.getElementById("routeSelect"),Ee=document.getElementById("logsSearch"),V=document.getElementById("logsList"),Ue=document.getElementById("logsCount"),lt(Se),document.querySelectorAll("[data-action]").forEach(o=>{o.addEventListener("click",zt)}),document.querySelectorAll("[data-move]").forEach(o=>{o.addEventListener("click",Ht)}),document.querySelectorAll("[data-log-action]").forEach(o=>{o.addEventListener("click",_t)}),ne.addEventListener("change",Gt),we.addEventListener("click",jt),xe.addEventListener("click",Ut),Ee.addEventListener("input",Ft);const e=document.getElementById("templateBtn");e&&e.addEventListener("click",Zt);const t=document.getElementById("restoreInput");t&&t.addEventListener("change",Xt);const n=document.getElementById("shipOverlay");n&&n.addEventListener("click",o=>{o.target===n&&le()});const a=document.getElementById("templateOverlay");a&&a.addEventListener("click",o=>{o.target===a&&ue()}),I.addEventListener("click",o=>{o.target===I&&m()}),T.addEventListener("click",o=>{o.target===T&&O()}),xt().then(o=>{const r=document.getElementById("offlineIndicator");r&&o&&(r.hidden=!1)}),Se(x(),dt(),R())}function Se(e,t,n){$t(t),Mt(n),Kt(),n==="capture"?(C.hidden=!0,te.hidden=!1,We(e)):(C.hidden=!1,te.hidden=!0,Nt(e))}function Mt(e){document.querySelectorAll(".action-btn-tab").forEach(t=>{const n=t.dataset.action;n==="view-tasks"?t.classList.toggle("active",e==="tasks"):n==="view-capture"&&t.classList.toggle("active",e==="capture")})}function Nt(e){var o,r;const t=document.activeElement,n=t&&t.classList.contains("item-content"),a=n?(r=(o=t.closest(".item"))==null?void 0:o.dataset)==null?void 0:r.id:null;if(n&&a){["inbox","next","shipToday"].forEach(i=>{const s=document.querySelector(`[data-section="${i}"] .section-count`);s&&(s.textContent=e[i].length)});return}C.innerHTML="",["inbox","next","shipToday"].forEach(i=>{const s=Pt(i,e[i]);C.appendChild(s)})}function We(e){const t=j?bt(j):e.logs||[];if(Ue.textContent=t.length,V.innerHTML="",t.length===0){const n=document.createElement("li");n.className="logs-empty",n.textContent=j?"No logs match your search":"No logs yet. Capture something!",V.appendChild(n)}else t.forEach(n=>{const a=Vt(n);V.appendChild(a)})}function $t(e){switch(g.className="status-indicator",e){case"saving":g.textContent="Saving…",g.classList.add("saving");break;case"saved":g.textContent="Saved ✓",g.classList.add("saved");break;case"error":g.textContent="Error!",g.classList.add("error");break;default:g.textContent="Ready"}}function Pt(e,t){const n=At[e],a=document.createElement("section");a.className=`section ${n.className}`,a.dataset.section=e;const o=document.createElement("header");o.className="section-header",o.innerHTML=`
    <span class="section-icon">${n.icon}</span>
    <h2 class="section-title">${n.title}</h2>
    <span class="section-count">${t.length}</span>
  `,a.appendChild(o);const r=document.createElement("ul");if(r.className="section-list",t.length===0){const i=document.createElement("li");i.className="section-empty",i.textContent="No items",r.appendChild(i)}else t.forEach(i=>{const s=Rt(e,i);r.appendChild(s)});return a.appendChild(r),a}function Rt(e,t){const n=document.createElement("li");n.className="item",n.dataset.id=t.id,n.dataset.section=e;const a=document.createElement("span");a.className="item-bullet",n.appendChild(a);const o=document.createElement("div");o.className="item-content",o.contentEditable="true",o.spellcheck=!0,o.textContent=t.text,o.addEventListener("input",()=>{ve(e,t.id,o.textContent)}),o.addEventListener("blur",()=>{const s=o.textContent.trim();s!==t.text&&ve(e,t.id,s)}),o.addEventListener("keydown",s=>{if(s.key==="Enter"&&!s.shiftKey){s.preventDefault();const d=F(e,"");requestAnimationFrame(()=>{const l=document.querySelector(`[data-id="${d}"] .item-content`);l&&l.focus()})}s.key==="Backspace"&&o.textContent===""&&(s.preventDefault(),Me(e,t.id))}),n.appendChild(o);const r=()=>{n.classList.add("long-pressing"),y=setTimeout(()=>{n.classList.remove("long-pressing"),Wt(e,t.id)},Fe)},i=()=>{n.classList.remove("long-pressing"),y&&(clearTimeout(y),y=null)};return n.addEventListener("touchstart",r,{passive:!0}),n.addEventListener("touchend",i),n.addEventListener("touchcancel",i),n.addEventListener("touchmove",i),n.addEventListener("mousedown",s=>{s.button===0&&r()}),n.addEventListener("mouseup",i),n.addEventListener("mouseleave",i),n}function Vt(e){const t=document.createElement("li");t.className="log-item",t.dataset.logId=e.id;const n=new Date(e.createdAt).toLocaleString(),a=e.content.length>50?e.content.substring(0,50).replace(/\n/g," ")+"...":e.content.replace(/\n/g," ");t.innerHTML=`
    <div class="log-item-header">
      <div class="log-item-meta">
        <span class="log-item-date">${n}</span>
        <span class="log-item-preview">${ke(a)}</span>
      </div>
      <span class="log-item-source ${e.source==="clipboard"?"clipboard":""}">${e.source}</span>
    </div>
    <div class="log-item-content">
      <div class="log-item-full-text">${ke(e.content)}</div>
    </div>
  `;const o=t.querySelector(".log-item-header");o.addEventListener("click",()=>{t.classList.toggle("expanded")});const r=()=>{t.classList.add("long-pressing"),y=setTimeout(()=>{t.classList.remove("long-pressing"),qt(e)},Fe)},i=()=>{t.classList.remove("long-pressing"),y&&(clearTimeout(y),y=null)};return o.addEventListener("touchstart",r,{passive:!0}),o.addEventListener("touchend",i),o.addEventListener("touchcancel",i),o.addEventListener("touchmove",i),t}function ke(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}async function jt(){try{const e=await navigator.clipboard.readText();e&&(A.value=e,A.focus())}catch{alert(`📋 Clipboard access not available.

Please use your keyboard to paste (long-press the textarea and select Paste).`)}}function Ut(){const e=A.value.trim();if(!e){alert("Nothing to save!");return}const t=je.value;ht(e,"manual",t,[]),A.value="",navigator.vibrate&&navigator.vibrate(50)}function Ft(e){j=e.target.value,We(x())}function Wt(e,t){p={section:e,id:t},document.querySelectorAll("[data-move]").forEach(n=>{n.hidden=n.dataset.move===e}),se.hidden=!1,navigator.vibrate&&navigator.vibrate(50)}function q(){se.hidden=!0,p=null}function qt(e){v=e,ce.hidden=!1,navigator.vibrate&&navigator.vibrate(50)}function Ie(){ce.hidden=!0,v=null}function Ht(e){const t=e.currentTarget.dataset.move;p&&ut(p.section,t,p.id),q()}function _t(e){const t=e.currentTarget.dataset.logAction;if(!v){Ie();return}switch(t){case"copy":navigator.clipboard.writeText(v.content).then(()=>{navigator.vibrate&&navigator.vibrate(50)}).catch(()=>{alert("Failed to copy")});break;case"send-inbox":F("inbox",v.content);break;case"send-ship":F("shipToday",v.content);break;case"delete":yt(v.id);break}Ie()}function zt(e){var n;switch(e.currentTarget.dataset.action){case"view-tasks":b("tasks");break;case"view-capture":b("capture");break;case"add-inbox":R()!=="tasks"&&b("tasks"),G("inbox");break;case"add-next":R()!=="tasks"&&b("tasks"),G("next");break;case"add-ship":R()!=="tasks"&&b("tasks"),G("shipToday");break;case"menu":Jt();break;case"close-menu":m();break;case"export-md":kt(),m();break;case"export-json":It(),m();break;case"import-json":ne.click();break;case"undo":ft()?(pt(),m()):alert("Nothing to undo");break;case"clear-all":de("Clear All?","This will delete all items in all sections. This cannot be undone.",()=>{mt(),O(),m()});break;case"delete":p&&(Me(p.section,p.id),q());break;case"cancel":q();break;case"mark-shipped":p&&qe(p.section,p.id);break;case"confirm-cancel":O();break;case"confirm-yes":W&&W();break;case"backup":Dt(),m();break;case"restore":(n=document.getElementById("restoreInput"))==null||n.click();break;case"view-shipped":en();break;case"close-ship":case"cancel-ship":le();break;case"confirm-ship":Qt();break;case"close-template":ue();break;case"diagnostics":tn();break;case"close-diag":_e();break;case"weekly-export":nn();break;case"check-update":on();break;case"reset-cache":an();break;case"export-debug":rn();break}}function G(e){const t=F(e,"");requestAnimationFrame(()=>{const n=document.querySelector(`[data-id="${t}"] .item-content`);n&&(n.focus(),n.scrollIntoView({behavior:"smooth",block:"center"}))})}function Jt(){I.hidden=!1}function m(){I.hidden=!0}function de(e,t,n){Re.textContent=e,Ve.textContent=t,W=n,T.hidden=!1}function O(){T.hidden=!0,W=null}async function Gt(e){var n;const t=(n=e.target.files)==null?void 0:n[0];if(t){try{const a=await t.text(),o=Tt(a);de("Replace All Data?","This will replace all current items with the imported data. Continue?",async()=>{await gt(o),O(),m()})}catch(a){alert(`Import failed: ${a.message}`)}e.target.value=""}}function Kt(){const e=document.getElementById("todayShipped");if(!e)return;const t=Ne();e.textContent=`${t.length} shipped`}function qe(e,t){L={section:e,id:t};const n=document.getElementById("shipOverlay");n&&(n.hidden=!1);const a=document.getElementById("shipSaveAs"),o=document.getElementById("shipDoD");a&&(a.value=""),o&&(o.value="")}function le(){const e=document.getElementById("shipOverlay");e&&(e.hidden=!0),L=null}function Qt(){var n,a,o,r;if(!L)return;const e=(a=(n=document.getElementById("shipSaveAs"))==null?void 0:n.value)==null?void 0:a.trim(),t=(r=(o=document.getElementById("shipDoD"))==null?void 0:o.value)==null?void 0:r.trim();if(!e){alert("Save As is required");return}if(!t){alert("Definition of Done is required");return}try{vt(L.section,L.id,e,t),le(),q(),navigator.vibrate&&navigator.vibrate(100)}catch(i){alert(i.message)}}function Zt(){const e=document.getElementById("templateOverlay"),t=document.getElementById("templateList");if(!e||!t)return;const n=Ct();t.innerHTML="",n.forEach(a=>{const o=document.createElement("button");o.className="template-option",o.innerHTML=`
      <span class="template-icon">${a.icon}</span>
      <div class="template-info">
        <div class="template-name">${a.name}</div>
        <div class="template-desc">${a.description}</div>
      </div>
    `,o.addEventListener("click",()=>{Yt(a.key)}),t.appendChild(o)}),e.hidden=!1}function ue(){const e=document.getElementById("templateOverlay");e&&(e.hidden=!0)}function Yt(e){const t=Pe(e,{}),n=document.getElementById("captureTextarea");n&&(n.value=t,n.focus()),ue()}async function Xt(e){var n;const t=(n=e.target.files)==null?void 0:n[0];if(t){try{const a=await t.text(),o=Bt(a,x());de("Merge Backup?",`Found ${o.stats.imported.inbox+o.stats.imported.next+o.stats.imported.shipToday} tasks and ${o.stats.imported.logs} logs to import. Duplicates will be skipped. Continue?`,async()=>{await wt(o),O(),m(),alert(`Imported: ${o.stats.imported.inbox} inbox, ${o.stats.imported.next} next, ${o.stats.imported.shipToday} ship, ${o.stats.imported.logs} logs`)})}catch(a){alert(`Restore failed: ${a.message}`)}e.target.value=""}}function en(){const e=Ne();if(e.length===0){alert("No items shipped today yet!");return}let t=`Today's Shipped (${e.length}):

`;e.forEach((n,a)=>{t+=`${a+1}. ${n.saveAs}
   DoD: ${n.definitionOfDone}

`}),alert(t),m()}window.openShipModal=qe;const He="2026-01-04T00:04:23.766Z";async function tn(){var a;const e=document.getElementById("diagOverlay");if(!e)return;const t=await Oe();document.getElementById("diagVersion").textContent=He.split("T")[0]||"dev",document.getElementById("diagSchema").textContent=`v${t.schemaVersion||"unknown"}`,document.getElementById("diagUpdated").textContent=((a=t.lastUpdated)==null?void 0:a.split("T")[0])||"never";const n=t.itemCounts||{};document.getElementById("diagCounts").textContent=`${n.inbox||0} inbox, ${n.next||0} next, ${n.logs||0} logs`,"serviceWorker"in navigator?navigator.serviceWorker.ready.then(o=>{document.getElementById("diagSW").textContent=o.active?"🟢 Active":"🟡 Waiting"}).catch(()=>{document.getElementById("diagSW").textContent="🔴 Error"}):document.getElementById("diagSW").textContent="⚪ Not supported",e.hidden=!1,m()}function _e(){const e=document.getElementById("diagOverlay");e&&(e.hidden=!0)}function nn(){const t=x().logs||[],n=new Date;n.setDate(n.getDate()-7);const a=t.filter(r=>new Date(r.createdAt)>=n);if(a.length===0){alert("No logs from the past 7 days.");return}let o=`# Commander Weekly Export
`;o+=`Exported: ${new Date().toISOString()}
`,o+=`Period: Last 7 days (${a.length} entries)

`,o+=`---

`,a.forEach(r=>{const i=new Date(r.createdAt).toLocaleString(),s=r.category||"Note";o+=`## [${s}] ${r.saveAs||"Untitled"} — ${i}

`,o+=r.content+`

`,o+=`---

`}),navigator.clipboard.writeText(o).then(()=>{alert(`Copied ${a.length} logs to clipboard!

Paste into ChatGPT for analysis.`),m()}).catch(()=>{const r=new Blob([o],{type:"text/markdown"}),i=URL.createObjectURL(r),s=document.createElement("a");s.href=i,s.download=`commander-weekly-${new Date().toISOString().split("T")[0]}.md`,s.click(),URL.revokeObjectURL(i),m()})}async function on(){"serviceWorker"in navigator?(await(await navigator.serviceWorker.ready).update(),alert("Update check complete. If an update is available, it will install automatically.")):alert("Service workers not supported.")}async function an(){if(confirm("This will clear cached files. Your data will NOT be lost. Continue?"))try{if("caches"in window){const e=await caches.keys();await Promise.all(e.map(t=>caches.delete(t)))}alert("Cache cleared. Reloading..."),location.reload()}catch(e){alert("Failed to clear cache: "+e.message)}}async function rn(){const e=await Oe(),t={exportedAt:new Date().toISOString(),appVersion:He,schemaVersion:oe,diagnostics:e,userAgent:navigator.userAgent,online:navigator.onLine,serviceWorker:"serviceWorker"in navigator},n=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),a=URL.createObjectURL(n),o=document.createElement("a");o.href=a,o.download=`commander-debug-${new Date().toISOString().split("T")[0]}.json`,o.click(),URL.revokeObjectURL(a),_e()}const ze="2026-01-04T00:04:23.766Z";function sn(){const e=new URLSearchParams(window.location.search),t=e.get("screen"),n=e.get("safemode"),a=e.get("autofocus");return n==="1"?(console.log("[Commander] Safe mode enabled"),{safemode:!0}):t?(console.log("[Commander] Deep link to:",t),{...{"mission-control":{view:"capture",template:"MissionControl"},"micro-research":{view:"capture",template:"MicroResearch"},"build-block":{view:"capture",template:"BuildBlock"},"nightly-delta":{view:"capture",template:"NightlyDelta"},capture:{view:"capture",template:null},tasks:{view:"tasks",template:null},inbox:{view:"tasks",template:null}}[t],autofocus:a==="1",screen:t}):null}function cn(e){e&&(e.view==="capture"?(b("capture"),e.template?setTimeout(()=>{const t=document.getElementById("captureTextarea");t&&(t.value=Pe(e.template,{}),e.autofocus&&t.focus())},100):e.autofocus&&setTimeout(()=>{const t=document.getElementById("captureTextarea");t&&t.focus()},100)):e.view==="tasks"&&b("tasks"),window.history.replaceState&&window.history.replaceState({},document.title,window.location.pathname))}async function Te(){console.log(`[Commander] Starting v${ze}...`);const e=sn();if(e!=null&&e.safemode){dn();return}try{await M(),console.log("[Commander] Database initialized"),await be(),console.log("[Commander] State loaded"),Ot(),console.log("[Commander] UI initialized"),cn(e),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(console.log("[Commander] App visible, refreshing state"),be())}),console.log("[Commander] Ready!")}catch(t){console.error("[Commander] Bootstrap failed:",t),ln(t)}}function dn(){document.body.innerHTML=`
    <div style="padding: 20px; font-family: sans-serif; background: #0a0a0f; color: #f0f0f5; min-height: 100vh;">
      <h1 style="color: #f59e0b;">🛡️ Commander Safe Mode</h1>
      <p style="color: #a0a0b0; margin: 16px 0;">Running in minimal mode for recovery and debugging.</p>
      
      <div style="margin: 24px 0; display: flex; flex-direction: column; gap: 12px;">
        <button onclick="exportEmergencyBackup()" style="padding: 16px; background: #00d4ff; color: #000; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
          📦 Export Emergency Backup
        </button>
        <button onclick="location.href='./?'" style="padding: 16px; background: #1a1a24; color: #f0f0f5; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
          🔄 Try Normal Mode
        </button>
        <button onclick="clearAndReload()" style="padding: 16px; background: #ef4444; color: #fff; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
          🗑️ Clear Cache & Reload
        </button>
      </div>
      
      <div style="background: #12121a; padding: 16px; border-radius: 8px; margin-top: 24px;">
        <h3 style="margin-bottom: 12px;">Diagnostics</h3>
        <p style="font-size: 14px; color: #606070;">Version: ${ze}</p>
        <p style="font-size: 14px; color: #606070;" id="swStatus">Service Worker: Checking...</p>
        <p style="font-size: 14px; color: #606070;" id="dbStatus">Database: Checking...</p>
      </div>
    </div>
  `,"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(e=>{document.getElementById("swStatus").textContent="Service Worker: "+(e.active?"🟢 Active":"🟡 Waiting")}).catch(()=>{document.getElementById("swStatus").textContent="Service Worker: 🔴 Error"});try{const e=indexedDB.open("commander-db");e.onsuccess=()=>{document.getElementById("dbStatus").textContent="Database: 🟢 Accessible"},e.onerror=()=>{document.getElementById("dbStatus").textContent="Database: 🔴 Error"}}catch{document.getElementById("dbStatus").textContent="Database: 🔴 Failed"}window.exportEmergencyBackup=async function(){try{const e=indexedDB.open("commander-db",3);e.onsuccess=()=>{const o=e.result.transaction("documents","readonly").objectStore("documents").get("main");o.onsuccess=()=>{const r=o.result||{},i=new Blob([JSON.stringify(r,null,2)],{type:"application/json"}),s=URL.createObjectURL(i),d=document.createElement("a");d.href=s,d.download=`commander-emergency-${new Date().toISOString().split("T")[0]}.json`,d.click(),URL.revokeObjectURL(s)}}}catch(e){alert("Export failed: "+e.message)}},window.clearAndReload=async function(){if(confirm("This will clear cached files (not your data). Continue?")){if("caches"in window){const e=await caches.keys();await Promise.all(e.map(t=>caches.delete(t)))}location.reload()}}}function ln(e){document.body.innerHTML=`
    <div style="padding: 20px; font-family: sans-serif; background: #0a0a0f; color: #f0f0f5; min-height: 100vh;">
      <h1 style="color: #ef4444;">⚠️ Commander Failed to Start</h1>
      <p style="color: #a0a0b0; margin: 16px 0;">${e.message}</p>
      
      <div style="margin: 24px 0; display: flex; flex-direction: column; gap: 12px;">
        <button onclick="location.reload()" style="padding: 16px; background: #00d4ff; color: #000; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
          🔄 Try Again
        </button>
        <button onclick="location.href='./?safemode=1'" style="padding: 16px; background: #f59e0b; color: #000; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
          🛡️ Enter Safe Mode
        </button>
      </div>
      
      <details style="margin-top: 24px; background: #12121a; padding: 16px; border-radius: 8px;">
        <summary style="cursor: pointer; color: #606070;">Technical Details</summary>
        <pre style="font-size: 12px; color: #ef4444; margin-top: 12px; overflow-x: auto;">${e.stack||e}</pre>
      </details>
    </div>
  `}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Te):Te();
