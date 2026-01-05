import"./style-BbxpixY-.js";const V=(e,t)=>t.some(n=>e instanceof n);let Z,X;function De(){return Z||(Z=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function ke(){return X||(X=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const W=new WeakMap,N=new WeakMap,O=new WeakMap;function Oe(e){const t=new Promise((n,i)=>{const o=()=>{e.removeEventListener("success",s),e.removeEventListener("error",a)},s=()=>{n(h(e.result)),o()},a=()=>{i(e.error),o()};e.addEventListener("success",s),e.addEventListener("error",a)});return O.set(t,e),t}function Me(e){if(W.has(e))return;const t=new Promise((n,i)=>{const o=()=>{e.removeEventListener("complete",s),e.removeEventListener("error",a),e.removeEventListener("abort",a)},s=()=>{n(),o()},a=()=>{i(e.error||new DOMException("AbortError","AbortError")),o()};e.addEventListener("complete",s),e.addEventListener("error",a),e.addEventListener("abort",a)});W.set(e,t)}let F={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return W.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return h(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function ge(e){F=e(F)}function Ne(e){return ke().includes(e)?function(...t){return e.apply(U(this),t),h(this.request)}:function(...t){return h(e.apply(U(this),t))}}function Ae(e){return typeof e=="function"?Ne(e):(e instanceof IDBTransaction&&Me(e),V(e,De())?new Proxy(e,F):e)}function h(e){if(e instanceof IDBRequest)return Oe(e);if(N.has(e))return N.get(e);const t=Ae(e);return t!==e&&(N.set(e,t),O.set(t,e)),t}const U=e=>O.get(e);function Re(e,t,{blocked:n,upgrade:i,blocking:o,terminated:s}={}){const a=indexedDB.open(e,t),r=h(a);return i&&a.addEventListener("upgradeneeded",c=>{i(h(a.result),c.oldVersion,c.newVersion,h(a.transaction),c)}),n&&a.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),r.then(c=>{s&&c.addEventListener("close",()=>s()),o&&c.addEventListener("versionchange",d=>o(d.oldVersion,d.newVersion,d))}).catch(()=>{}),r}const Pe=["get","getKey","getAll","getAllKeys","count"],$e=["put","add","delete","clear"],A=new Map;function ee(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(A.get(t))return A.get(t);const n=t.replace(/FromIndex$/,""),i=t!==n,o=$e.includes(n);if(!(n in(i?IDBIndex:IDBObjectStore).prototype)||!(o||Pe.includes(n)))return;const s=async function(a,...r){const c=this.transaction(a,o?"readwrite":"readonly");let d=c.store;return i&&(d=d.index(r.shift())),(await Promise.all([d[n](...r),o&&c.done]))[0]};return A.set(t,s),s}ge(e=>({...e,get:(t,n,i)=>ee(t,n)||e.get(t,n,i),has:(t,n)=>!!ee(t,n)||e.has(t,n)}));const Ve=["continue","continuePrimaryKey","advance"],te={},_=new WeakMap,he=new WeakMap,We={get(e,t){if(!Ve.includes(t))return e[t];let n=te[t];return n||(n=te[t]=function(...i){_.set(this,he.get(this)[t](...i))}),n}};async function*Fe(...e){let t=this;if(t instanceof IDBCursor||(t=await t.openCursor(...e)),!t)return;t=t;const n=new Proxy(t,We);for(he.set(n,t),O.set(n,U(t));t;)yield n,t=await(_.get(n)||t.continue()),_.delete(n)}function ne(e,t){return t===Symbol.asyncIterator&&V(e,[IDBIndex,IDBObjectStore,IDBCursor])||t==="iterate"&&V(e,[IDBIndex,IDBObjectStore])}ge(e=>({...e,get(t,n,i){return ne(t,n)?Fe:e.get(t,n,i)},has(t,n){return ne(t,n)||e.has(t,n)}}));const Ue="commander-db",_e=3,S="documents",B="pending",ye=3;let x=null;async function T(){return x||(x=await Re(Ue,_e,{upgrade(e,t,n){console.log(`[DB] Upgrading from v${t} to v${n}`),e.objectStoreNames.contains(S)||e.createObjectStore(S,{keyPath:"id"}),e.objectStoreNames.contains(B)||e.createObjectStore(B,{keyPath:"id"})}}),await He(),x)}async function He(){const e=await x.get(S,"main");if(!e)return;let t=!1;const n={...e};n.schemaVersion||(console.log("[DB] Migrating: Adding schemaVersion"),n.schemaVersion=1,t=!0),n.schemaVersion<2&&(console.log("[DB] Migrating v1 → v2: Ensuring logs array"),Array.isArray(n.logs)||(n.logs=[]),n.schemaVersion=2,t=!0),n.schemaVersion<3&&(console.log("[DB] Migrating v2 → v3: Ensuring shipped array"),Array.isArray(n.shipped)||(n.shipped=[]),["inbox","next","shipToday"].forEach(i=>{Array.isArray(n[i])&&(n[i]=n[i].map((o,s)=>o.id?o:{...o,id:`migrated_${i}_${s}_${Date.now()}`}))}),n.schemaVersion=3,t=!0),t&&(console.log("[DB] Saving migrated document"),await z(n))}async function z(e){const n=(await T()).transaction(S,"readwrite");await n.store.put({id:"main",schemaVersion:ye,...e,updatedAt:Date.now()}),await n.done,await qe()}async function je(){const e=await T(),t=await e.get(B,"main");return t?(console.log("[DB] Recovering from pending write"),await z(t),t):e.get(S,"main")}async function Ge(e){const n=(await T()).transaction(B,"readwrite");await n.store.put({id:"main",...e,pendingAt:Date.now()}),await n.done}async function qe(){const t=(await T()).transaction(B,"readwrite");await t.store.delete("main"),await t.done}function Ee(){return{schemaVersion:ye,inbox:[],next:[],shipToday:[],logs:[],shipped:[]}}let u=Ee(),D=null;const H=new Set;let M="idle",K="tasks";const ze=300;function Ke(){return Date.now().toString(36)+Math.random().toString(36).substr(2,5)}function Y(){return u}function ve(){return M}function Ye(){return K}function be(e){K=e,y()}function Je(e){return H.add(e),()=>H.delete(e)}function y(){H.forEach(e=>e(u,M,K))}function C(e){M=e,y()}function J(){D&&clearTimeout(D),Ge(u).catch(console.error),C("saving"),D=setTimeout(async()=>{try{await z(u),C("saved"),setTimeout(()=>{M==="saved"&&C("idle")},2e3)}catch(e){console.error("[State] Save failed:",e),C("error")}},ze)}function Q(){JSON.parse(JSON.stringify(u))}async function oe(){try{const e=await je();e&&(u={inbox:e.inbox||[],next:e.next||[],shipToday:e.shipToday||[],logs:e.logs||[]}),y()}catch(e){console.error("[State] Failed to load:",e),u=Ee(),y()}}function xe(e,t=""){Q();const n={id:Ke(),text:t};return u[e]=[...u[e],n],J(),y(),n.id}function ie(e,t,n){u[e].findIndex(o=>o.id===t)!==-1&&(D||Q(),u[e]=u[e].map(o=>o.id===t?{...o,text:n}:o),J(),y())}function Qe(e,t){Q(),u[e]=u[e].filter(n=>n.id!==t),J(),y()}function Ze(){return u.logs||[]}async function Xe(){return"serviceWorker"in navigator?!!(await navigator.serviceWorker.ready).active:!1}const we=[{id:"bug",icon:"🐛",label:"Bug Report",content:`[BUG] 
Context: 
Expected: 
Actual: `},{id:"idea",icon:"💡",label:"Idea",content:`[IDEA] 
Goal: 
First Step: `},{id:"log",icon:"🪵",label:"Daily Log",content:`#log 
Wins: 
Blockers: `},{id:"meeting",icon:"📅",label:"Meeting Note",content:`[MEETING] 
Who: 
Action Items:
- `},{id:"MissionControl",icon:"🎯",label:"Morning Mission Control",content:`## 🎯 MISSION CONTROL — {{DATE}}

### HUD
- Energy: /10
- Focus Target: 

### BODY
Top 3 Priorities:
{{PREVIOUS_FOCUS}}

### CLOSE BLOCK
- Review at: 
- Success = 

### LOG
#morning #mission-control`},{id:"MicroResearch",icon:"🔬",label:"Micro Research Sprint",content:`## 🔬 MICRO RESEARCH — {{DATE}} {{TIME}}

### HUD
- Topic: 
- Time Box: 25min

### BODY
Question: 
Sources:
- 

Key Findings:
- 

### CLOSE BLOCK
Next Step: 

### LOG
#research #micro-sprint`},{id:"BuildBlock",icon:"🔨",label:"Daily Build Block",content:`## 🔨 BUILD BLOCK — {{DATE}}

### HUD
- Project: 
- Branch: 
- Time: {{TIME}}

### BODY
Goal: 

Steps:
1. 
2. 
3. 

### CLOSE BLOCK
Definition of Done: 
Commit Message: 

### LOG
#build #dev`},{id:"NightlyDelta",icon:"🌙",label:"Nightly System Delta",content:`## 🌙 NIGHTLY DELTA — {{DATE}}

### HUD
- Mood: /10
- Energy EOD: /10

### BODY
Shipped Today:
- 

Blockers Hit:
- 

Tomorrow's Focus:
- 

### CLOSE BLOCK
Gratitude: 
Learning: 

### LOG
#nightly #reflection`},{id:"WeeklyReview",icon:"🗓️",label:"Weekly Review",content:`## 🗓️ WEEKLY REVIEW — {{DATE}}

### HUD
- Week Score: /10
- Big Wins: 

### BODY
Shipped this Week:
{{WEEKLY_LOGS}}

### REFLECTION
- What went well?
- What broke?
- Theme for Next Week: 

### LOG
#weekly #review`}];function et(){return we}function Le(e,t={}){const n=we.find(s=>s.id===e||s.id.toLowerCase()===(e==null?void 0:e.toLowerCase()));if(!n)return"";let i=n.content;const o=new Date;return i=i.replace(/\{\{DATE\}\}/g,o.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})),i=i.replace(/\{\{TIME\}\}/g,o.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})),t.previousFocus?i=i.replace("{{PREVIOUS_FOCUS}}",t.previousFocus):i=i.replace("{{PREVIOUS_FOCUS}}",`1. 
2. 
3. `),t.shippedContext&&(i=i.replace(/- \n/,t.shippedContext+`
`)),t.weeklyLogs?i=i.replace("{{WEEKLY_LOGS}}",t.weeklyLogs):i=i.replace("{{WEEKLY_LOGS}}","-"),i}const tt=[{id:"urgent",title:"🔥 Urgent",tags:["urgent","priority-high"]},{id:"bug",title:"🐛 Bugs",tags:["bug","fix"]},{id:"meeting",title:"📅 Meetings",tags:["meeting"]},{id:"idea",title:"💡 Ideas",tags:["idea"]},{id:"shopping",title:"🛒 Shopping",tags:["shopping"]},{id:"other",title:"📝 Tasks",tags:[]}];function nt(e){const t=tt.map(n=>({...n,items:[]}));return e.forEach(n=>{const i=(n.tags||[]).map(s=>s.toLowerCase().replace("#",""));let o=!1;for(const s of t)if(s.id!=="other"&&s.tags.some(a=>i.includes(a))){s.items.push(n),o=!0;break}if(!o){const s=t.find(a=>a.id==="other");s&&s.items.push(n)}}),t}let E,j,p,R,P,ae,I,se,re,ce,k,Se;document.querySelector('[data-action="close-menu"]');const de=document.getElementById("templateBtn"),Be=document.getElementById("templateOverlay"),le=document.getElementById("templateList"),ue=document.querySelector('[data-action="close-template"]');let g=null,w="list";const Ie=500,ot={inbox:{icon:"📥",title:"Inbox",className:"section-inbox"},next:{icon:"📋",title:"Next",className:"section-next"},shipToday:{icon:"🚀",title:"Ship Today",className:"section-ship"}};function it(){E=document.getElementById("commander"),j=document.getElementById("captureView"),p=document.getElementById("saveStatus"),document.getElementById("contextMenu"),document.getElementById("logContextMenu"),R=document.getElementById("menuOverlay"),P=document.getElementById("confirmOverlay"),document.getElementById("confirmTitle"),document.getElementById("confirmMessage"),ae=document.getElementById("importInput"),I=document.getElementById("captureTextarea"),se=document.getElementById("pasteBtn"),re=document.getElementById("saveLogBtn"),document.getElementById("routeSelect"),ce=document.getElementById("logsSearch"),k=document.getElementById("logsList"),Se=document.getElementById("logsCount"),Je(G),document.querySelectorAll("[data-action]").forEach(a=>{a.addEventListener("click",handleAction)}),document.querySelectorAll("[data-move]").forEach(a=>{a.addEventListener("click",handleMoveAction)}),document.querySelectorAll("[data-log-action]").forEach(a=>{a.addEventListener("click",handleLogAction)}),ae.addEventListener("change",handleImportFile),se.addEventListener("click",ft),re.addEventListener("click",handleSaveLog),de&&de.addEventListener("click",pt),ue&&ue.addEventListener("click",q);const e=document.getElementById("timeBandit");e&&e.addEventListener("click",handleTimeBandit);const t=document.getElementById("micBtn");t&&("SpeechRecognition"in window||"webkitSpeechRecognition"in window)&&(t.hidden=!1,t.addEventListener("click",handleVoiceCapture)),ce.addEventListener("input",handleSearchInput);const n=document.getElementById("viewToggle");n&&n.addEventListener("click",ct);const i=document.getElementById("restoreInput");i&&i.addEventListener("change",handleRestoreFile);const o=document.getElementById("shipOverlay");o&&o.addEventListener("click",a=>{a.target===o&&closeShipModal()});const s=document.getElementById("templateOverlay");s&&s.addEventListener("click",a=>{a.target===s&&q()}),R.addEventListener("click",a=>{a.target===R&&closeMenu()}),P.addEventListener("click",a=>{a.target===P&&closeConfirm()}),window.addEventListener("online",$),window.addEventListener("offline",$),$(),document.addEventListener("keydown",handleKeyboardShortcuts),G(Y(),ve(),Ye()),checkFirstRun()}async function $(){const e=document.getElementById("offlineIndicator");if(!e)return;!navigator.onLine?(e.textContent="📡 Offline",e.className="offline-indicator offline",e.hidden=!1):await Xe()?(e.textContent="🟢 Ready",e.className="offline-indicator",e.hidden=!1):e.hidden=!0}function G(e,t,n){lt(t),at(n),updateTodayShipped(),document.startViewTransition?document.startViewTransition(()=>{me(n,e)}):me(n,e)}function me(e,t){e==="capture"?(E.hidden=!0,j.hidden=!1,dt(t)):(E.hidden=!1,j.hidden=!0,st(t))}function at(e){document.querySelectorAll(".action-btn-tab").forEach(t=>{const n=t.dataset.action;n==="view-tasks"?t.classList.toggle("active",e==="tasks"):n==="view-capture"&&t.classList.toggle("active",e==="capture")})}function st(e){var o,s;if(w==="board"){rt(e);return}const t=document.activeElement,n=t&&t.classList.contains("item-content"),i=n?(s=(o=t.closest(".item"))==null?void 0:o.dataset)==null?void 0:s.id:null;if(n&&i){["inbox","next","shipToday"].forEach(a=>{const r=document.querySelector(`[data-section="${a}"] .section-count`);r&&(r.textContent=e[a].length)});return}E.innerHTML="",["inbox","next","shipToday"].forEach(a=>{let r=e[a];const c=ut(a,r);E.appendChild(c)})}function rt(e){E.innerHTML="";const t=[...e.inbox.map(o=>({...o,_section:"inbox"})),...e.next.map(o=>({...o,_section:"next"})),...e.shipToday.map(o=>({...o,_section:"shipToday"}))],n=nt(t),i=document.createElement("div");i.className="board-container",n.forEach(o=>{const s=document.createElement("div");s.className="board-column",s.classList.add(`board-col-${o.id}`),s.innerHTML=`
            <div class="board-header">
                <span class="board-title">${o.title}</span>
                <span class="board-count">${o.items.length}</span>
            </div>
        `;const a=document.createElement("ul");a.className="board-items",o.items.forEach(r=>{const c=Te(r._section,r);c.classList.add("board-card"),a.appendChild(c)}),s.appendChild(a),i.appendChild(s)}),E.appendChild(i)}function ct(){w=w==="list"?"board":"list";const e=document.getElementById("viewToggle");e&&(e.textContent=w==="list"?"📋":"📊",e.setAttribute("title",w==="list"?"Switch to Smart Board":"Switch to List")),G(Y(),ve(),"tasks")}function dt(e){const t=e.logs||[];if(Se.textContent=t.length,k.innerHTML="",t.length===0){const n=document.createElement("li");n.className="logs-empty",n.textContent="No logs yet. Capture something!",k.appendChild(n)}else t.forEach(n=>{const i=mt(n);k.appendChild(i)})}function lt(e){switch(p.className="status-indicator",e){case"saving":p.textContent="Saving…",p.classList.add("saving");break;case"saved":p.textContent="Saved ✓",p.classList.add("saved");break;case"error":p.textContent="Error!",p.classList.add("error");break;default:p.textContent="Ready"}}function ut(e,t){const n=ot[e],i=document.createElement("section");i.className=`section ${n.className}`,i.dataset.section=e;const o=document.createElement("header");o.className="section-header",o.innerHTML=`
    <span class="section-icon">${n.icon}</span>
    <h2 class="section-title">${n.title}</h2>
    <span class="section-count">${t.length}</span>
  `,i.appendChild(o);const s=document.createElement("ul");if(s.className="section-list",t.length===0){const a=document.createElement("li");a.className="section-empty";const c={inbox:{icon:"📥",text:"Inbox empty — capture something!"},next:{icon:"🎯",text:"Nothing queued up"},shipToday:{icon:"🚀",text:"Ready to ship?"}}[e]||{icon:"📭",text:"No items"};a.innerHTML=`<span class="empty-icon">${c.icon}</span><span class="empty-text">${c.text}</span>`,s.appendChild(a)}else t.forEach(a=>{const r=Te(e,a);s.appendChild(r)});return i.appendChild(s),i}function Te(e,t){const n=document.createElement("li");n.className="item",n.dataset.id=t.id,n.dataset.section=e;const i=document.createElement("span");i.className="item-bullet",n.appendChild(i);const o=document.createElement("div");if(o.className="item-content",o.contentEditable="true",o.spellcheck=!0,o.textContent=t.text,o.addEventListener("input",()=>{ie(e,t.id,o.textContent)}),o.addEventListener("blur",()=>{const r=o.textContent.trim();r!==t.text&&ie(e,t.id,r)}),o.addEventListener("keydown",r=>{if(r.key==="Enter"&&!r.shiftKey){r.preventDefault();const c=xe(e,"");requestAnimationFrame(()=>{const d=document.querySelector(`[data-id="${c}"] .item-content`);d&&d.focus()})}r.key==="Backspace"&&o.textContent===""&&(r.preventDefault(),Qe(e,t.id))}),n.appendChild(o),t.tags&&t.tags.length>0){const r=document.createElement("div");r.className="item-tags",t.tags.forEach(c=>{const d=document.createElement("span");d.className="item-tag",d.textContent=c.startsWith("#")?c:`#${c}`,d.addEventListener("click",m=>{m.stopPropagation(),filterByTag(c)}),r.appendChild(d)}),n.appendChild(r)}const s=()=>{n.classList.add("long-pressing"),g=setTimeout(()=>{n.classList.remove("long-pressing"),showContextMenu(e,t.id)},Ie)},a=()=>{n.classList.remove("long-pressing"),g&&(clearTimeout(g),g=null)};return n.addEventListener("touchstart",s,{passive:!0}),n.addEventListener("touchend",a),n.addEventListener("touchcancel",a),n.addEventListener("touchmove",a),n.addEventListener("mousedown",r=>{r.button===0&&s()}),n.addEventListener("mouseup",a),n.addEventListener("mouseleave",a),n}function mt(e){const t=document.createElement("li");t.className="log-item",t.dataset.logId=e.id;const n=new Date(e.createdAt).toLocaleString(),i=e.content.length>50?e.content.substring(0,50).replace(/\n/g," ")+"...":e.content.replace(/\n/g," ");t.innerHTML=`
    <div class="log-item-header">
      <div class="log-item-meta">
        <span class="log-item-date">${n}</span>
        <span class="log-item-preview">${fe(i)}</span>
      </div>
      <span class="log-item-source ${e.source==="clipboard"?"clipboard":""}">${e.source}</span>
    </div>
    <div class="log-item-content">
      <div class="log-item-full-text">${fe(e.content)}</div>
    </div>
  `;const o=t.querySelector(".log-item-header");o.addEventListener("click",()=>{t.classList.toggle("expanded")});const s=()=>{t.classList.add("long-pressing"),g=setTimeout(()=>{t.classList.remove("long-pressing"),showLogContextMenu(e)},Ie)},a=()=>{t.classList.remove("long-pressing"),g&&(clearTimeout(g),g=null)};return o.addEventListener("touchstart",s,{passive:!0}),o.addEventListener("touchend",a),o.addEventListener("touchcancel",a),o.addEventListener("touchmove",a),t}function fe(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function L(e,t="success"){const n=document.getElementById("toast");if(!n)return;const i={success:"✅",error:"❌",info:"ℹ️",warning:"⚠️"},o=i[t]||i.success;n.textContent=`${o} ${e}`,n.className="toast show toast-"+t,navigator.vibrate&&navigator.vibrate(t==="error"?[50,50,50]:50),setTimeout(()=>{n.classList.remove("show")},3e3)}async function ft(){try{const e=await navigator.clipboard.readText();if(!e)return;const t=e.split(`
`).map(o=>o.trim()).filter(o=>o),n=/^(\-|\*|\d+\.)\s+/,i=t.filter(o=>n.test(o));if(i.length>1&&confirm(`Detected ${i.length} list items. Split them into separate Inbox tasks?`)){i.forEach(s=>{const a=s.replace(n,"").trim();a&&xe("inbox",a)}),L(`✅ Added ${i.length} items to Inbox`),be("tasks"),navigator.vibrate&&navigator.vibrate(50);return}I.value=e,I.focus()}catch(e){console.error("Failed to read clipboard:",e),alert("Permission to read clipboard denied.")}}function pt(){gt(),Be.hidden=!1}function q(){Be.hidden=!0}function gt(){const e=et();le.innerHTML="";const t=document.createElement("div");t.style.cssText="display: grid; gap: 12px; grid-template-columns: repeat(2, 1fr);",e.forEach(n=>{const i=document.createElement("button");i.className="menu-btn",i.style.cssText="height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center;",i.innerHTML=`
            <span style="font-size: 24px;">${n.icon}</span>
            <span>${n.label}</span>
        `,i.onclick=()=>ht(n.id),t.appendChild(i)}),le.appendChild(t)}async function ht(e){let t={};if(e==="MissionControl"){let n=function(d,m){const f=document.getElementById("shipOverlay");f&&(f.hidden=!1);const l=document.getElementById("shipSaveAs"),v=document.getElementById("shipDoD");l&&(l.value=""),v&&(v.value="")},i=function(){const d=document.getElementById("onboardingOverlay");d&&(d.hidden=!1)},o=function(){localStorage.getItem("commander-onboarded")||i()};const r=(Y().logs||[]).find(d=>d.tags&&d.tags.includes("#nightly")||d.saveAs&&d.saveAs.includes("NightlyDelta"));if(r){const d=r.content.match(/Tomorrow's Focus:([\s\S]*?)(?:###|$)/);if(d&&d[1]){const f=d[1].trim().split(`
`).map(l=>l.trim()).filter(l=>l.startsWith("-")).map(l=>l.replace(/^-\s*/,"").trim()).filter(l=>l).map((l,v)=>`${v+1}. ${l}`).join(`
`);f&&(t.previousFocus=f,L("🔗 Ouroboros Linked: Focus recovered","info"))}const m=Le(e,t);m&&(I.value=m,q(),I.focus())}window.openShipModal=n,function(){setTimeout(()=>{const m=document.querySelector("#menuOverlay .modal-body");if(m&&!document.getElementById("dailyDebriefBtn")){const f=document.querySelector('[data-action="weekly-export"]');if(f){const l=document.createElement("button");l.id="dailyDebriefBtn",l.className="menu-btn",l.innerHTML="🧠 Copy Daily Debrief",l.onclick=c,m.insertBefore(l,f)}}},1e3)}();async function c(){const d=Ze(),m=new Date().toISOString().split("T")[0],f=d.filter(b=>b.createdAt.startsWith(m));if(f.length===0){L("No logs for today.");return}const l=f.map(b=>`- [${new Date(b.createdAt).toLocaleTimeString()}] ${b.content}`).join(`
`),v=`DATE: ${m}
LOGS:
${l}

PROMPT:
Analyze my day based on these execution logs.
1. What was the highest leverage task?
2. Where was the friction or wasted time?
3. Grade my execution (A-F) with a short explanation.
4. Suggest one improvement for tomorrow.`;try{await navigator.clipboard.writeText(v),L("🧠 Debrief Prompt copied to clipboard!")}catch(b){console.error("Failed to copy",b),L("Failed to copy.")}}o()}}function yt(){const e=new URLSearchParams(window.location.search);if(e.get("safemode")==="1")return{safemode:!0};const t=e.get("screen"),n=e.get("text"),i=e.get("template"),o=e.get("autofocus")==="1";return!t&&!n&&!i?null:{view:Et(t)||"capture",template:vt(t)||i,text:n,autofocus:o,originalParams:e}}function Et(e){return e?{"mission-control":"capture","micro-research":"capture","build-block":"capture","nightly-delta":"capture",capture:"capture",tasks:"tasks",inbox:"tasks"}[e]:null}function vt(e){return e?{"mission-control":"MissionControl","micro-research":"MicroResearch","build-block":"BuildBlock","nightly-delta":"NightlyDelta"}[e]:null}function bt(e,t){e&&(console.log("[Integrations] Applying launch params:",e),e.view&&t(e.view),e.view==="capture"&&setTimeout(()=>{const n=document.getElementById("captureTextarea");if(n){if(e.text)n.value=e.text;else if(e.template){const i=new CustomEvent("commander-fill-template",{detail:{template:e.template}});window.dispatchEvent(i)}(e.autofocus||e.text)&&(n.focus(),n.value&&(n.selectionStart=n.selectionEnd=n.value.length))}},100),window.history.replaceState&&window.history.replaceState({},document.title,window.location.pathname))}const Ce="2026-01-05T04:37:33.609Z";async function pe(){console.log(`[Commander] Starting v${Ce}...`);const e=yt();if(e!=null&&e.safemode){xt();return}try{await T(),console.log("[Commander] Database initialized"),await oe(),console.log("[Commander] State loaded"),it(),console.log("[Commander] UI initialized"),bt(e,be),window.addEventListener("commander-fill-template",t=>{const n=document.getElementById("captureTextarea");n&&t.detail.template&&(n.value=Le(t.detail.template,{}))}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(console.log("[Commander] App visible, refreshing state"),oe())}),console.log("[Commander] Ready!")}catch(t){console.error("[Commander] Bootstrap failed:",t),wt(t)}}function xt(){document.body.innerHTML=`
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
        <p style="font-size: 14px; color: #606070;">Version: ${Ce}</p>
        <p style="font-size: 14px; color: #606070;" id="swStatus">Service Worker: Checking...</p>
        <p style="font-size: 14px; color: #606070;" id="dbStatus">Database: Checking...</p>
      </div>
    </div>
  `,"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(e=>{document.getElementById("swStatus").textContent="Service Worker: "+(e.active?"🟢 Active":"🟡 Waiting")}).catch(()=>{document.getElementById("swStatus").textContent="Service Worker: 🔴 Error"});try{const e=indexedDB.open("commander-db");e.onsuccess=()=>{document.getElementById("dbStatus").textContent="Database: 🟢 Accessible"},e.onerror=()=>{document.getElementById("dbStatus").textContent="Database: 🔴 Error"}}catch{document.getElementById("dbStatus").textContent="Database: 🔴 Failed"}window.exportEmergencyBackup=async function(){try{const e=indexedDB.open("commander-db",3);e.onsuccess=()=>{const o=e.result.transaction("documents","readonly").objectStore("documents").get("main");o.onsuccess=()=>{const s=o.result||{},a=new Blob([JSON.stringify(s,null,2)],{type:"application/json"}),r=URL.createObjectURL(a),c=document.createElement("a");c.href=r,c.download=`commander-emergency-${new Date().toISOString().split("T")[0]}.json`,c.click(),URL.revokeObjectURL(r)}}}catch(e){alert("Export failed: "+e.message)}},window.clearAndReload=async function(){if(confirm("This will clear cached files (not your data). Continue?")){if("caches"in window){const e=await caches.keys();await Promise.all(e.map(t=>caches.delete(t)))}location.reload()}}}function wt(e){document.body.innerHTML=`
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
  `}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",pe):pe();
