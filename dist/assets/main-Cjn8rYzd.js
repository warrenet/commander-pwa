import"./style-eV2glYNL.js";const Z=(e,t)=>t.some(n=>e instanceof n);let ge,he;function Ke(){return ge||(ge=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Qe(){return he||(he=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Y=new WeakMap,z=new WeakMap,q=new WeakMap;function Ze(e){const t=new Promise((n,a)=>{const o=()=>{e.removeEventListener("success",i),e.removeEventListener("error",r)},i=()=>{n(x(e.result)),o()},r=()=>{a(e.error),o()};e.addEventListener("success",i),e.addEventListener("error",r)});return q.set(t,e),t}function Ye(e){if(Y.has(e))return;const t=new Promise((n,a)=>{const o=()=>{e.removeEventListener("complete",i),e.removeEventListener("error",r),e.removeEventListener("abort",r)},i=()=>{n(),o()},r=()=>{a(e.error||new DOMException("AbortError","AbortError")),o()};e.addEventListener("complete",i),e.addEventListener("error",r),e.addEventListener("abort",r)});Y.set(e,t)}let X={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return Y.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return x(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function Be(e){X=e(X)}function Xe(e){return Qe().includes(e)?function(...t){return e.apply(ee(this),t),x(this.request)}:function(...t){return x(e.apply(ee(this),t))}}function et(e){return typeof e=="function"?Xe(e):(e instanceof IDBTransaction&&Ye(e),Z(e,Ke())?new Proxy(e,X):e)}function x(e){if(e instanceof IDBRequest)return Ze(e);if(z.has(e))return z.get(e);const t=et(e);return t!==e&&(z.set(e,t),q.set(t,e)),t}const ee=e=>q.get(e);function tt(e,t,{blocked:n,upgrade:a,blocking:o,terminated:i}={}){const r=indexedDB.open(e,t),s=x(r);return a&&r.addEventListener("upgradeneeded",l=>{a(x(r.result),l.oldVersion,l.newVersion,x(r.transaction),l)}),n&&r.addEventListener("blocked",l=>n(l.oldVersion,l.newVersion,l)),s.then(l=>{i&&l.addEventListener("close",()=>i()),o&&l.addEventListener("versionchange",d=>o(d.oldVersion,d.newVersion,d))}).catch(()=>{}),s}const nt=["get","getKey","getAll","getAllKeys","count"],ot=["put","add","delete","clear"],J=new Map;function ye(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(J.get(t))return J.get(t);const n=t.replace(/FromIndex$/,""),a=t!==n,o=ot.includes(n);if(!(n in(a?IDBIndex:IDBObjectStore).prototype)||!(o||nt.includes(n)))return;const i=async function(r,...s){const l=this.transaction(r,o?"readwrite":"readonly");let d=l.store;return a&&(d=d.index(s.shift())),(await Promise.all([d[n](...s),o&&l.done]))[0]};return J.set(t,i),i}Be(e=>({...e,get:(t,n,a)=>ye(t,n)||e.get(t,n,a),has:(t,n)=>!!ye(t,n)||e.has(t,n)}));const at=["continue","continuePrimaryKey","advance"],ve={},te=new WeakMap,Ce=new WeakMap,it={get(e,t){if(!at.includes(t))return e[t];let n=ve[t];return n||(n=ve[t]=function(...a){te.set(this,Ce.get(this)[t](...a))}),n}};async function*rt(...e){let t=this;if(t instanceof IDBCursor||(t=await t.openCursor(...e)),!t)return;t=t;const n=new Proxy(t,it);for(Ce.set(n,t),q.set(n,ee(t));t;)yield n,t=await(te.get(n)||t.continue()),te.delete(n)}function be(e,t){return t===Symbol.asyncIterator&&Z(e,[IDBIndex,IDBObjectStore,IDBCursor])||t==="iterate"&&Z(e,[IDBIndex,IDBObjectStore])}Be(e=>({...e,get(t,n,a){return be(t,n)?rt:e.get(t,n,a)},has(t,n){return be(t,n)||e.has(t,n)}}));const Ae="commander-db",Oe=3,C="documents",A="pending",ie=3;let k=null;async function N(){return k||(k=await tt(Ae,Oe,{upgrade(e,t,n){console.log(`[DB] Upgrading from v${t} to v${n}`),e.objectStoreNames.contains(C)||e.createObjectStore(C,{keyPath:"id"}),e.objectStoreNames.contains(A)||e.createObjectStore(A,{keyPath:"id"})}}),await st(),k)}async function st(){const e=await k.get(C,"main");if(!e)return;let t=!1;const n={...e};n.schemaVersion||(console.log("[DB] Migrating: Adding schemaVersion"),n.schemaVersion=1,t=!0),n.schemaVersion<2&&(console.log("[DB] Migrating v1 → v2: Ensuring logs array"),Array.isArray(n.logs)||(n.logs=[]),n.schemaVersion=2,t=!0),n.schemaVersion<3&&(console.log("[DB] Migrating v2 → v3: Ensuring shipped array"),Array.isArray(n.shipped)||(n.shipped=[]),["inbox","next","shipToday"].forEach(a=>{Array.isArray(n[a])&&(n[a]=n[a].map((o,i)=>o.id?o:{...o,id:`migrated_${a}_${i}_${Date.now()}`}))}),n.schemaVersion=3,t=!0),t&&(console.log("[DB] Saving migrated document"),await $(n))}async function $(e){const n=(await N()).transaction(C,"readwrite");await n.store.put({id:"main",schemaVersion:ie,...e,updatedAt:Date.now()}),await n.done,await lt()}async function Me(){const e=await N(),t=await e.get(A,"main");return t?(console.log("[DB] Recovering from pending write"),await $(t),t):e.get(C,"main")}async function ct(e){const n=(await N()).transaction(A,"readwrite");await n.store.put({id:"main",...e,pendingAt:Date.now()}),await n.done}async function lt(){const t=(await N()).transaction(A,"readwrite");await t.store.delete("main"),await t.done}function re(){return{schemaVersion:ie,inbox:[],next:[],shipToday:[],logs:[],shipped:[]}}async function Ne(){var e,t,n,a,o;try{const i=await Me();return{dbName:Ae,dbVersion:Oe,schemaVersion:(i==null?void 0:i.schemaVersion)||"unknown",itemCounts:{inbox:((e=i==null?void 0:i.inbox)==null?void 0:e.length)||0,next:((t=i==null?void 0:i.next)==null?void 0:t.length)||0,shipToday:((n=i==null?void 0:i.shipToday)==null?void 0:n.length)||0,logs:((a=i==null?void 0:i.logs)==null?void 0:a.length)||0,shipped:((o=i==null?void 0:i.shipped)==null?void 0:o.length)||0},lastUpdated:i!=null&&i.updatedAt?new Date(i.updatedAt).toISOString():"never"}}catch(i){return{error:i.message}}}let c=re(),I=null,P=null;const ne=new Set;let _="idle",se="tasks";const dt=300;function U(){return Date.now().toString(36)+Math.random().toString(36).substr(2,5)}function b(){return c}function we(){return _}function T(){return se}function E(e){se=e,u()}function ut(e){return ne.add(e),()=>ne.delete(e)}function u(){ne.forEach(e=>e(c,_,se))}function R(e){_=e,u()}function y(){P&&clearTimeout(P),ct(c).catch(console.error),R("saving"),P=setTimeout(async()=>{try{await $(c),R("saved"),setTimeout(()=>{_==="saved"&&R("idle")},2e3)}catch(e){console.error("[State] Save failed:",e),R("error")}},dt)}function g(){I=JSON.parse(JSON.stringify(c))}async function xe(){try{const e=await Me();e&&(c={inbox:e.inbox||[],next:e.next||[],shipToday:e.shipToday||[],logs:e.logs||[]}),u()}catch(e){console.error("[State] Failed to load:",e),c=re(),u()}}function F(e,t=""){g();const n={id:U(),text:t};return c[e]=[...c[e],n],y(),u(),n.id}function Ee(e,t,n){c[e].findIndex(o=>o.id===t)!==-1&&(P||g(),c[e]=c[e].map(o=>o.id===t?{...o,text:n}:o),y(),u())}function $e(e,t){g(),c[e]=c[e].filter(n=>n.id!==t),y(),u()}function mt(e,t,n){if(e===t)return;g();const a=c[e].find(o=>o.id===n);a&&(c[e]=c[e].filter(o=>o.id!==n),c[t]=[...c[t],a],y(),u())}function pt(){g(),c=re(),y(),u()}function ft(){if(!I)return!1;const e=c;return c=I,I=e,y(),u(),!0}function gt(){return I!==null}async function ht(e){g(),c={inbox:Array.isArray(e.inbox)?e.inbox:[],next:Array.isArray(e.next)?e.next:[],shipToday:Array.isArray(e.shipToday)?e.shipToday:[],logs:Array.isArray(e.logs)?e.logs:[]},await $(c),u()}function yt(e,t="manual",n="logs",a=[]){g();const o=e.trim();if(c.logs.length>0){const r=c.logs[0];if(r.content===o)return console.log("[State] Duplicate log ignored"),r.id}const i={id:U(),createdAt:new Date().toISOString(),source:t,route:n,tags:a,content:o};if(c.logs=[i,...c.logs],n==="inbox"||n==="next"||n==="shipToday"){const r={id:U(),text:e.trim()};c[n]=[...c[n],r]}return y(),u(),i.id}function vt(e){g(),c.logs=c.logs.filter(t=>t.id!==e),y(),u()}function bt(e){if(!e||!e.trim())return c.logs||[];const t=e.toLowerCase().trim();return(c.logs||[]).filter(n=>n.content.toLowerCase().includes(t)||n.tags.some(a=>a.toLowerCase().includes(t)))}function wt(e,t,n,a){var r;if(!n||!n.trim())throw new Error("Save As is required");if(!a||!a.trim())throw new Error("Definition of Done is required");g();const o=(r=c[e])==null?void 0:r.find(s=>s.id===t);if(!o)return null;const i={id:U(),originalId:t,text:o.text,saveAs:n.trim(),definitionOfDone:a.trim(),shippedAt:new Date().toISOString(),fromSection:e,logLine:`${new Date().toLocaleTimeString()} | SHIPPED: ${n.trim()} — DoD: ${a.trim()}`};return c.shipped||(c.shipped=[]),c.shipped.unshift(i),c[e]=c[e].filter(s=>s.id!==t),y(),u(),i}function Re(){if(!c.shipped)return[];const e=new Date().toISOString().split("T")[0];return c.shipped.filter(t=>t.shippedAt&&t.shippedAt.startsWith(e))}async function xt(e){g(),c={inbox:e.inbox||[],next:e.next||[],shipToday:e.shipToday||[],logs:e.logs||[],shipped:c.shipped||[]},await $(c),u()}async function Et(){return"serviceWorker"in navigator?!!(await navigator.serviceWorker.ready).active:!1}function St(){const e=b();let t=`# Commander

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
`:n.forEach(a=>{const o=new Date(a.createdAt).toLocaleString(),r=(a.content.length>100?a.content.substring(0,100)+"...":a.content).replace(/\n/g," ");t+=`- [${o}] ${r}
`}),t}function kt(){const e=b(),t={version:2,exportedAt:new Date().toISOString(),data:{inbox:e.inbox,next:e.next,shipToday:e.shipToday,logs:e.logs||[]}};return JSON.stringify(t,null,2)}function ce(e,t,n){const a=new Blob([e],{type:n}),o=URL.createObjectURL(a),i=document.createElement("a");i.href=o,i.download=t,i.style.display="none",document.body.appendChild(i),i.click(),document.body.removeChild(i),setTimeout(()=>URL.revokeObjectURL(o),100)}function It(){const e=St(),t=new Date().toISOString().split("T")[0];ce(e,`commander-${t}.md`,"text/markdown")}function Tt(){const e=kt(),t=new Date().toISOString().split("T")[0];ce(e,`commander-${t}.json`,"application/json")}function Lt(e){let t;try{t=JSON.parse(e)}catch{throw new Error("Invalid JSON format")}const n=t.data||t;if(!n||typeof n!="object")throw new Error("Invalid data structure");const a={inbox:[],next:[],shipToday:[],logs:[]};return["inbox","next","shipToday"].forEach(o=>{Array.isArray(n[o])&&(a[o]=n[o].map(i=>typeof i=="string"?{id:S(),text:i}:i&&typeof i=="object"&&"text"in i?{id:i.id||S(),text:String(i.text||"")}:null).filter(Boolean))}),Array.isArray(n.logs)&&(a.logs=n.logs.map(o=>o&&typeof o=="object"&&"content"in o?{id:o.id||S(),createdAt:o.createdAt||new Date().toISOString(),source:o.source||"manual",route:o.route||"logs",tags:Array.isArray(o.tags)?o.tags:[],content:String(o.content||"")}:null).filter(Boolean)),a}function S(){return Date.now().toString(36)+Math.random().toString(36).substr(2,5)}function Dt(){const e=b(),t={schemaVersion:2,appVersion:"2026-01-04T04:14:37.173Z",createdAt:new Date().toISOString(),backup:!0,data:{inbox:e.inbox||[],next:e.next||[],shipToday:e.shipToday||[],logs:e.logs||[]}};return JSON.stringify(t,null,2)}function Bt(){const e=Dt(),t=new Date().toISOString().split("T")[0],n=new Date().toISOString().split("T")[1].split(".")[0].replace(/:/g,"-");ce(e,`commander-backup-${t}_${n}.json`,"application/json")}function Ct(e,t){let n;try{n=JSON.parse(e)}catch{throw new Error("Invalid JSON format")}const a=n.data||n;if(!a||typeof a!="object")throw new Error("Invalid backup structure");const o={imported:{inbox:0,next:0,shipToday:0,logs:0},skipped:{inbox:0,next:0,shipToday:0,logs:0}},i={inbox:[...t.inbox||[]],next:[...t.next||[]],shipToday:[...t.shipToday||[]],logs:[...t.logs||[]]};function r(s,l,d){return s.some(fe=>fe.id===l.id||d&&fe[d]===l[d])}return["inbox","next","shipToday"].forEach(s=>{Array.isArray(a[s])&&a[s].forEach(l=>{if(!l)return;const d=typeof l=="string"?{id:S(),text:l}:{id:l.id||S(),text:String(l.text||"")};r(i[s],d,"text")?o.skipped[s]++:(i[s].push(d),o.imported[s]++)})}),Array.isArray(a.logs)&&a.logs.forEach(s=>{if(!s||typeof s!="object"||!s.content)return;const l={id:s.id||S(),createdAt:s.createdAt||new Date().toISOString(),source:s.source||"import",route:s.route||"logs",category:s.category||"Note",tags:Array.isArray(s.tags)?s.tags:[],content:String(s.content||"")};r(i.logs,l,"content")?o.skipped.logs++:(i.logs.push(l),o.imported.logs++)}),i.logs.sort((s,l)=>new Date(l.createdAt)-new Date(s.createdAt)),{...i,stats:o}}const Pe={MissionControl:{name:"Morning Mission Control",icon:"🎯",description:"Daily mission briefing and priority alignment",template:`# 🎯 MISSION CONTROL — {{DATE}}

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
`}};function Ve(e,t={}){const n=Pe[e];if(!n)return"";const a=new Date,o=a.toISOString().split("T")[0],i=a.toLocaleTimeString();let r=n.template;return r=r.replace(/\{\{DATE\}\}/g,o),r=r.replace(/\{\{TIMESTAMP\}\}/g,i),r=r.replace(/\{\{AGENDA\}\}/g,t.agenda||"[paste today's agenda]"),r}function At(){return Object.entries(Pe).map(([e,t])=>({key:e,name:t.name,icon:t.icon,description:t.description}))}let O,oe,h,le,de,L,D,je,Ue,ae,m,Se,ke,Fe,Ie,V,We,f=null,w=null,v=null,W=null,j="",B=null;const He=500,Ot={inbox:{icon:"📥",title:"Inbox",className:"section-inbox"},next:{icon:"📋",title:"Next",className:"section-next"},shipToday:{icon:"🚀",title:"Ship Today",className:"section-ship"}};function Mt(){O=document.getElementById("commander"),oe=document.getElementById("captureView"),h=document.getElementById("saveStatus"),le=document.getElementById("contextMenu"),de=document.getElementById("logContextMenu"),L=document.getElementById("menuOverlay"),D=document.getElementById("confirmOverlay"),je=document.getElementById("confirmTitle"),Ue=document.getElementById("confirmMessage"),ae=document.getElementById("importInput"),m=document.getElementById("captureTextarea"),Se=document.getElementById("pasteBtn"),ke=document.getElementById("saveLogBtn"),Fe=document.getElementById("routeSelect"),Ie=document.getElementById("logsSearch"),V=document.getElementById("logsList"),We=document.getElementById("logsCount"),ut(K),document.querySelectorAll("[data-action]").forEach(i=>{i.addEventListener("click",Gt)}),document.querySelectorAll("[data-move]").forEach(i=>{i.addEventListener("click",zt)}),document.querySelectorAll("[data-log-action]").forEach(i=>{i.addEventListener("click",Jt)}),ae.addEventListener("change",Qt),Se.addEventListener("click",Ut),ke.addEventListener("click",Wt);const e=document.getElementById("micBtn");e&&("SpeechRecognition"in window||"webkitSpeechRecognition"in window)&&(e.hidden=!1,e.addEventListener("click",Ft)),Ie.addEventListener("input",Ht);const t=document.getElementById("templateBtn");t&&t.addEventListener("click",Xt);const n=document.getElementById("restoreInput");n&&n.addEventListener("change",tn);const a=document.getElementById("shipOverlay");a&&a.addEventListener("click",i=>{i.target===a&&me()});const o=document.getElementById("templateOverlay");o&&o.addEventListener("click",i=>{i.target===o&&pe()}),L.addEventListener("click",i=>{i.target===L&&p()}),D.addEventListener("click",i=>{i.target===D&&M()}),window.addEventListener("online",G),window.addEventListener("offline",G),G(),K(b(),we(),T()),K(b(),we(),T())}async function G(){const e=document.getElementById("offlineIndicator");if(!e)return;!navigator.onLine?(e.textContent="📡 Offline",e.className="offline-indicator offline",e.hidden=!1):await Et()?(e.textContent="🟢 Ready",e.className="offline-indicator",e.hidden=!1):e.hidden=!0}function K(e,t,n){Rt(t),Nt(n),Zt(),n==="capture"?(O.hidden=!0,oe.hidden=!1,qe(e)):(O.hidden=!1,oe.hidden=!0,$t(e))}function Nt(e){document.querySelectorAll(".action-btn-tab").forEach(t=>{const n=t.dataset.action;n==="view-tasks"?t.classList.toggle("active",e==="tasks"):n==="view-capture"&&t.classList.toggle("active",e==="capture")})}function $t(e){var o,i;const t=document.activeElement,n=t&&t.classList.contains("item-content"),a=n?(i=(o=t.closest(".item"))==null?void 0:o.dataset)==null?void 0:i.id:null;if(n&&a){["inbox","next","shipToday"].forEach(r=>{const s=document.querySelector(`[data-section="${r}"] .section-count`);s&&(s.textContent=e[r].length)});return}O.innerHTML="",["inbox","next","shipToday"].forEach(r=>{const s=Pt(r,e[r]);O.appendChild(s)})}function qe(e){const t=j?bt(j):e.logs||[];if(We.textContent=t.length,V.innerHTML="",t.length===0){const n=document.createElement("li");n.className="logs-empty",n.textContent=j?"No logs match your search":"No logs yet. Capture something!",V.appendChild(n)}else t.forEach(n=>{const a=jt(n);V.appendChild(a)})}function Rt(e){switch(h.className="status-indicator",e){case"saving":h.textContent="Saving…",h.classList.add("saving");break;case"saved":h.textContent="Saved ✓",h.classList.add("saved");break;case"error":h.textContent="Error!",h.classList.add("error");break;default:h.textContent="Ready"}}function Pt(e,t){const n=Ot[e],a=document.createElement("section");a.className=`section ${n.className}`,a.dataset.section=e;const o=document.createElement("header");o.className="section-header",o.innerHTML=`
    <span class="section-icon">${n.icon}</span>
    <h2 class="section-title">${n.title}</h2>
    <span class="section-count">${t.length}</span>
  `,a.appendChild(o);const i=document.createElement("ul");if(i.className="section-list",t.length===0){const r=document.createElement("li");r.className="section-empty",r.textContent="No items",i.appendChild(r)}else t.forEach(r=>{const s=Vt(e,r);i.appendChild(s)});return a.appendChild(i),a}function Vt(e,t){const n=document.createElement("li");n.className="item",n.dataset.id=t.id,n.dataset.section=e;const a=document.createElement("span");a.className="item-bullet",n.appendChild(a);const o=document.createElement("div");o.className="item-content",o.contentEditable="true",o.spellcheck=!0,o.textContent=t.text,o.addEventListener("input",()=>{Ee(e,t.id,o.textContent)}),o.addEventListener("blur",()=>{const s=o.textContent.trim();s!==t.text&&Ee(e,t.id,s)}),o.addEventListener("keydown",s=>{if(s.key==="Enter"&&!s.shiftKey){s.preventDefault();const l=F(e,"");requestAnimationFrame(()=>{const d=document.querySelector(`[data-id="${l}"] .item-content`);d&&d.focus()})}s.key==="Backspace"&&o.textContent===""&&(s.preventDefault(),$e(e,t.id))}),n.appendChild(o);const i=()=>{n.classList.add("long-pressing"),v=setTimeout(()=>{n.classList.remove("long-pressing"),qt(e,t.id)},He)},r=()=>{n.classList.remove("long-pressing"),v&&(clearTimeout(v),v=null)};return n.addEventListener("touchstart",i,{passive:!0}),n.addEventListener("touchend",r),n.addEventListener("touchcancel",r),n.addEventListener("touchmove",r),n.addEventListener("mousedown",s=>{s.button===0&&i()}),n.addEventListener("mouseup",r),n.addEventListener("mouseleave",r),n}function jt(e){const t=document.createElement("li");t.className="log-item",t.dataset.logId=e.id;const n=new Date(e.createdAt).toLocaleString(),a=e.content.length>50?e.content.substring(0,50).replace(/\n/g," ")+"...":e.content.replace(/\n/g," ");t.innerHTML=`
    <div class="log-item-header">
      <div class="log-item-meta">
        <span class="log-item-date">${n}</span>
        <span class="log-item-preview">${Te(a)}</span>
      </div>
      <span class="log-item-source ${e.source==="clipboard"?"clipboard":""}">${e.source}</span>
    </div>
    <div class="log-item-content">
      <div class="log-item-full-text">${Te(e.content)}</div>
    </div>
  `;const o=t.querySelector(".log-item-header");o.addEventListener("click",()=>{t.classList.toggle("expanded")});const i=()=>{t.classList.add("long-pressing"),v=setTimeout(()=>{t.classList.remove("long-pressing"),_t(e)},He)},r=()=>{t.classList.remove("long-pressing"),v&&(clearTimeout(v),v=null)};return o.addEventListener("touchstart",i,{passive:!0}),o.addEventListener("touchend",r),o.addEventListener("touchcancel",r),o.addEventListener("touchmove",r),t}function Te(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}async function Ut(){try{const e=await navigator.clipboard.readText();e&&(m.value=e,m.focus())}catch{alert(`📋 Clipboard access not available.

Please use your keyboard to paste (long-press the textarea and select Paste).`)}}function Ft(){const e=document.getElementById("micBtn"),t=window.SpeechRecognition||window.webkitSpeechRecognition;if(!t)return;if(e.classList.contains("recording")){window.recognitionInstance&&window.recognitionInstance.stop();return}const n=new t;window.recognitionInstance=n,n.continuous=!1,n.interimResults=!0,n.lang="en-US",e.classList.add("recording");const a=m.getAttribute("placeholder");m.setAttribute("placeholder","Listening...");let o="";n.onresult=r=>{let s="";for(let l=r.resultIndex;l<r.results.length;++l)r.results[l].isFinal?o+=r.results[l][0].transcript:s+=r.results[l][0].transcript;m.value};let i=m.value;i&&!i.endsWith(" ")&&(i+=" "),n.onresult=r=>{let s="";for(let l=r.resultIndex;l<r.results.length;++l)s+=r.results[l][0].transcript;m.value=i+s,m.scrollTop=m.scrollHeight},n.onend=()=>{e.classList.remove("recording"),m.setAttribute("placeholder",a),window.recognitionInstance=null,navigator.vibrate&&navigator.vibrate(50)},n.onerror=r=>{console.error("Speech recognition error",r.error),e.classList.remove("recording"),m.setAttribute("placeholder",a)},n.start()}function Wt(){const e=m.value.trim();if(!e){alert("Nothing to save!");return}const t=Fe.value;yt(e,"manual",t,[]),m.value="",navigator.vibrate&&navigator.vibrate(50)}function Ht(e){j=e.target.value,qe(b())}function qt(e,t){f={section:e,id:t},document.querySelectorAll("[data-move]").forEach(n=>{n.hidden=n.dataset.move===e}),le.hidden=!1,navigator.vibrate&&navigator.vibrate(50)}function H(){le.hidden=!0,f=null}function _t(e){w=e,de.hidden=!1,navigator.vibrate&&navigator.vibrate(50)}function Le(){de.hidden=!0,w=null}function zt(e){const t=e.currentTarget.dataset.move;f&&mt(f.section,t,f.id),H()}function Jt(e){const t=e.currentTarget.dataset.logAction;if(!w){Le();return}switch(t){case"copy":navigator.clipboard.writeText(w.content).then(()=>{navigator.vibrate&&navigator.vibrate(50)}).catch(()=>{alert("Failed to copy")});break;case"send-inbox":F("inbox",w.content);break;case"send-ship":F("shipToday",w.content);break;case"delete":vt(w.id);break}Le()}function Gt(e){var n;switch(e.currentTarget.dataset.action){case"view-tasks":E("tasks");break;case"view-capture":E("capture");break;case"add-inbox":T()!=="tasks"&&E("tasks"),Q("inbox");break;case"add-next":T()!=="tasks"&&E("tasks"),Q("next");break;case"add-ship":T()!=="tasks"&&E("tasks"),Q("shipToday");break;case"menu":Kt();break;case"close-menu":p();break;case"export-md":It(),p();break;case"export-json":Tt(),p();break;case"import-json":ae.click();break;case"undo":gt()?(ft(),p()):alert("Nothing to undo");break;case"clear-all":ue("Clear All?","This will delete all items in all sections. This cannot be undone.",()=>{pt(),M(),p()});break;case"delete":f&&($e(f.section,f.id),H());break;case"cancel":H();break;case"mark-shipped":f&&_e(f.section,f.id);break;case"confirm-cancel":M();break;case"confirm-yes":W&&W();break;case"backup":Bt(),p();break;case"restore":(n=document.getElementById("restoreInput"))==null||n.click();break;case"view-shipped":nn();break;case"close-ship":case"cancel-ship":me();break;case"confirm-ship":Yt();break;case"close-template":pe();break;case"diagnostics":on();break;case"close-diag":Je();break;case"weekly-export":an();break;case"check-update":rn();break;case"reset-cache":sn();break;case"export-debug":cn();break}}function Q(e){const t=F(e,"");requestAnimationFrame(()=>{const n=document.querySelector(`[data-id="${t}"] .item-content`);n&&(n.focus(),n.scrollIntoView({behavior:"smooth",block:"center"}))})}function Kt(){L.hidden=!1}function p(){L.hidden=!0}function ue(e,t,n){je.textContent=e,Ue.textContent=t,W=n,D.hidden=!1}function M(){D.hidden=!0,W=null}async function Qt(e){var n;const t=(n=e.target.files)==null?void 0:n[0];if(t){try{const a=await t.text(),o=Lt(a);ue("Replace All Data?","This will replace all current items with the imported data. Continue?",async()=>{await ht(o),M(),p()})}catch(a){alert(`Import failed: ${a.message}`)}e.target.value=""}}function Zt(){const e=document.getElementById("todayShipped");if(!e)return;const t=Re();e.textContent=`${t.length} shipped`}function _e(e,t){B={section:e,id:t};const n=document.getElementById("shipOverlay");n&&(n.hidden=!1);const a=document.getElementById("shipSaveAs"),o=document.getElementById("shipDoD");a&&(a.value=""),o&&(o.value="")}function me(){const e=document.getElementById("shipOverlay");e&&(e.hidden=!0),B=null}function Yt(){var n,a,o,i;if(!B)return;const e=(a=(n=document.getElementById("shipSaveAs"))==null?void 0:n.value)==null?void 0:a.trim(),t=(i=(o=document.getElementById("shipDoD"))==null?void 0:o.value)==null?void 0:i.trim();if(!e){alert("Save As is required");return}if(!t){alert("Definition of Done is required");return}try{wt(B.section,B.id,e,t),me(),H(),navigator.vibrate&&navigator.vibrate(100)}catch(r){alert(r.message)}}function Xt(){const e=document.getElementById("templateOverlay"),t=document.getElementById("templateList");if(!e||!t)return;const n=At();t.innerHTML="",n.forEach(a=>{const o=document.createElement("button");o.className="template-option",o.innerHTML=`
      <span class="template-icon">${a.icon}</span>
      <div class="template-info">
        <div class="template-name">${a.name}</div>
        <div class="template-desc">${a.description}</div>
      </div>
    `,o.addEventListener("click",()=>{en(a.key)}),t.appendChild(o)}),e.hidden=!1}function pe(){const e=document.getElementById("templateOverlay");e&&(e.hidden=!0)}function en(e){const t=Ve(e,{}),n=document.getElementById("captureTextarea");n&&(n.value=t,n.focus()),pe()}async function tn(e){var n;const t=(n=e.target.files)==null?void 0:n[0];if(t){try{const a=await t.text(),o=Ct(a,b());ue("Merge Backup?",`Found ${o.stats.imported.inbox+o.stats.imported.next+o.stats.imported.shipToday} tasks and ${o.stats.imported.logs} logs to import. Duplicates will be skipped. Continue?`,async()=>{await xt(o),M(),p(),alert(`Imported: ${o.stats.imported.inbox} inbox, ${o.stats.imported.next} next, ${o.stats.imported.shipToday} ship, ${o.stats.imported.logs} logs`)})}catch(a){alert(`Restore failed: ${a.message}`)}e.target.value=""}}function nn(){const e=Re();if(e.length===0){alert("No items shipped today yet!");return}let t=`Today's Shipped (${e.length}):

`;e.forEach((n,a)=>{t+=`${a+1}. ${n.saveAs}
   DoD: ${n.definitionOfDone}

`}),alert(t),p()}window.openShipModal=_e;const ze="2026-01-04T04:14:37.173Z";async function on(){var a;const e=document.getElementById("diagOverlay");if(!e)return;const t=await Ne();document.getElementById("diagVersion").textContent=ze.split("T")[0]||"dev",document.getElementById("diagSchema").textContent=`v${t.schemaVersion||"unknown"}`,document.getElementById("diagUpdated").textContent=((a=t.lastUpdated)==null?void 0:a.split("T")[0])||"never";const n=t.itemCounts||{};document.getElementById("diagCounts").textContent=`${n.inbox||0} inbox, ${n.next||0} next, ${n.logs||0} logs`,"serviceWorker"in navigator?navigator.serviceWorker.ready.then(o=>{document.getElementById("diagSW").textContent=o.active?"🟢 Active":"🟡 Waiting"}).catch(()=>{document.getElementById("diagSW").textContent="🔴 Error"}):document.getElementById("diagSW").textContent="⚪ Not supported",e.hidden=!1,p()}function Je(){const e=document.getElementById("diagOverlay");e&&(e.hidden=!0)}function an(){const t=b().logs||[],n=new Date;n.setDate(n.getDate()-7);const a=t.filter(i=>new Date(i.createdAt)>=n);if(a.length===0){alert("No logs from the past 7 days.");return}let o=`# Commander Weekly Export
`;o+=`Exported: ${new Date().toISOString()}
`,o+=`Period: Last 7 days (${a.length} entries)

`,o+=`---

`,a.forEach(i=>{const r=new Date(i.createdAt).toLocaleString(),s=i.category||"Note";o+=`## [${s}] ${i.saveAs||"Untitled"} — ${r}

`,o+=i.content+`

`,o+=`---

`}),navigator.clipboard.writeText(o).then(()=>{alert(`Copied ${a.length} logs to clipboard!

Paste into ChatGPT for analysis.`),p()}).catch(()=>{const i=new Blob([o],{type:"text/markdown"}),r=URL.createObjectURL(i),s=document.createElement("a");s.href=r,s.download=`commander-weekly-${new Date().toISOString().split("T")[0]}.md`,s.click(),URL.revokeObjectURL(r),p()})}async function rn(){"serviceWorker"in navigator?(await(await navigator.serviceWorker.ready).update(),alert("Update check complete. If an update is available, it will install automatically.")):alert("Service workers not supported.")}async function sn(){if(confirm("This will clear cached files. Your data will NOT be lost. Continue?"))try{if("caches"in window){const e=await caches.keys();await Promise.all(e.map(t=>caches.delete(t)))}alert("Cache cleared. Reloading..."),location.reload()}catch(e){alert("Failed to clear cache: "+e.message)}}async function cn(){const e=await Ne(),t={exportedAt:new Date().toISOString(),appVersion:ze,schemaVersion:ie,diagnostics:e,userAgent:navigator.userAgent,online:navigator.onLine,serviceWorker:"serviceWorker"in navigator},n=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),a=URL.createObjectURL(n),o=document.createElement("a");o.href=a,o.download=`commander-debug-${new Date().toISOString().split("T")[0]}.json`,o.click(),URL.revokeObjectURL(a),Je()}function ln(){const e=new URLSearchParams(window.location.search);if(e.get("safemode")==="1")return{safemode:!0};const t=e.get("screen"),n=e.get("text"),a=e.get("template"),o=e.get("autofocus")==="1";return!t&&!n&&!a?null:{view:dn(t)||"capture",template:un(t)||a,text:n,autofocus:o,originalParams:e}}function dn(e){return e?{"mission-control":"capture","micro-research":"capture","build-block":"capture","nightly-delta":"capture",capture:"capture",tasks:"tasks",inbox:"tasks"}[e]:null}function un(e){return e?{"mission-control":"MissionControl","micro-research":"MicroResearch","build-block":"BuildBlock","nightly-delta":"NightlyDelta"}[e]:null}function mn(e,t){e&&(console.log("[Integrations] Applying launch params:",e),e.view&&t(e.view),e.view==="capture"&&setTimeout(()=>{const n=document.getElementById("captureTextarea");if(n){if(e.text)n.value=e.text;else if(e.template){const a=new CustomEvent("commander-fill-template",{detail:{template:e.template}});window.dispatchEvent(a)}(e.autofocus||e.text)&&(n.focus(),n.value&&(n.selectionStart=n.selectionEnd=n.value.length))}},100),window.history.replaceState&&window.history.replaceState({},document.title,window.location.pathname))}const Ge="2026-01-04T04:14:37.173Z";async function De(){console.log(`[Commander] Starting v${Ge}...`);const e=ln();if(e!=null&&e.safemode){pn();return}try{await N(),console.log("[Commander] Database initialized"),await xe(),console.log("[Commander] State loaded"),Mt(),console.log("[Commander] UI initialized"),mn(e,E),window.addEventListener("commander-fill-template",t=>{const n=document.getElementById("captureTextarea");n&&t.detail.template&&(n.value=Ve(t.detail.template,{}))}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(console.log("[Commander] App visible, refreshing state"),xe())}),console.log("[Commander] Ready!")}catch(t){console.error("[Commander] Bootstrap failed:",t),fn(t)}}function pn(){document.body.innerHTML=`
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
        <p style="font-size: 14px; color: #606070;">Version: ${Ge}</p>
        <p style="font-size: 14px; color: #606070;" id="swStatus">Service Worker: Checking...</p>
        <p style="font-size: 14px; color: #606070;" id="dbStatus">Database: Checking...</p>
      </div>
    </div>
  `,"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(e=>{document.getElementById("swStatus").textContent="Service Worker: "+(e.active?"🟢 Active":"🟡 Waiting")}).catch(()=>{document.getElementById("swStatus").textContent="Service Worker: 🔴 Error"});try{const e=indexedDB.open("commander-db");e.onsuccess=()=>{document.getElementById("dbStatus").textContent="Database: 🟢 Accessible"},e.onerror=()=>{document.getElementById("dbStatus").textContent="Database: 🔴 Error"}}catch{document.getElementById("dbStatus").textContent="Database: 🔴 Failed"}window.exportEmergencyBackup=async function(){try{const e=indexedDB.open("commander-db",3);e.onsuccess=()=>{const o=e.result.transaction("documents","readonly").objectStore("documents").get("main");o.onsuccess=()=>{const i=o.result||{},r=new Blob([JSON.stringify(i,null,2)],{type:"application/json"}),s=URL.createObjectURL(r),l=document.createElement("a");l.href=s,l.download=`commander-emergency-${new Date().toISOString().split("T")[0]}.json`,l.click(),URL.revokeObjectURL(s)}}}catch(e){alert("Export failed: "+e.message)}},window.clearAndReload=async function(){if(confirm("This will clear cached files (not your data). Continue?")){if("caches"in window){const e=await caches.keys();await Promise.all(e.map(t=>caches.delete(t)))}location.reload()}}}function fn(e){document.body.innerHTML=`
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
  `}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",De):De();
