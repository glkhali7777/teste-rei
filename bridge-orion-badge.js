(function(){
const { h: l } = (function(){
const r="orion_consent_sites";async function n(){if(typeof chrome>"u"||!chrome.storage?.local)return!1;try{const t=location.origin,{[r]:e}=await chrome.storage.local.get([r]);return Array.isArray(e)?e.includes("*")?!0:e.includes(t):!1}catch{return!1}}

return { h: n };
})();
const a="#7c6ef0",p="rgba(124, 110, 240, 0.4)";window.__orionBridgeBadgeInjected||(window.__orionBridgeBadgeInjected=!0,g());const r="orion_bridge_badge_dismissed",m=1440*60*1e3;async function g(){if(!await l())return;const e=location.hostname;if(e==="orion.cloudconsultingmastery.com"||e==="chrome.google.com"||e==="chromewebstore.google.com"||e.endsWith(".vast.ai")||e.endsWith(".hetzner.com")||e.endsWith(".hetzner.cloud"))return;try{const{[r]:t}=await chrome.storage.local.get(r),i=t?.[e];if(i&&Date.now()<i)return}catch{}document.readyState!=="complete"&&await new Promise(t=>window.addEventListener("load",()=>t(),{once:!0}));const o=u();let n="connecting";c(o,n),chrome.runtime.onMessage.addListener(t=>{t?.type==="BRIDGE_STATE"&&typeof t.state=="string"&&(n=t.state,c(o,n))});try{chrome.runtime.sendMessage({type:"GET_BRIDGE_STATE"},t=>{chrome.runtime.lastError||t?.state&&(n=t.state,c(o,n))})}catch{}}function u(){const e=document.createElement("div");e.id="orion-bridge-badge-host",e.style.cssText=`
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 2147483647;
    width: auto;
    height: 28px;
    pointer-events: none;
  `,document.documentElement.appendChild(e);const o=e.attachShadow({mode:"closed"}),n=document.createElement("style");n.textContent=`
    :host { all: initial; }
    .pill {
      pointer-events: auto;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 10px;
      height: 28px;
      border-radius: 999px;
      font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: white;
      background: ${a};
      box-shadow: 0 2px 10px rgba(124, 110, 240, 0.35);
      cursor: pointer;
      opacity: 0.85;
      transition: opacity 120ms ease, transform 120ms ease;
      user-select: none;
    }
    .pill:hover { opacity: 1; transform: translateY(-1px); }
    .pill[data-state="connecting"] {
      background: transparent;
      color: ${a};
      border: 1.5px solid ${a};
      box-shadow: none;
      animation: orion-bridge-pulse 1.5s ease-in-out infinite;
    }
    .pill[data-state="disconnected"] {
      background: transparent;
      color: rgba(140, 140, 140, 0.9);
      border: 1px solid rgba(140, 140, 140, 0.5);
      box-shadow: none;
    }
    .dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: white;
    }
    .pill[data-state="connecting"] .dot { background: ${a}; }
    .pill[data-state="disconnected"] .dot { background: rgba(140, 140, 140, 0.7); }
    @keyframes orion-bridge-pulse {
      0%, 100% { border-color: ${a}; }
      50% { border-color: ${p}; }
    }
  `,o.appendChild(n);const t=document.createElement("div");t.className="pill",t.dataset.state="connecting",t.title="Bridge Orion - clic pour ouvrir le panneau, clic droit pour masquer 24 h.";const i=document.createElement("span");i.className="dot";const s=document.createElement("span");return s.textContent="Bridge Orion",t.appendChild(i),t.appendChild(s),o.appendChild(t),t.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"OPEN_SIDEPANEL"})}),t.addEventListener("contextmenu",d=>{d.preventDefault(),h(location.hostname),e.remove()}),{shadowHost:e,pill:t,dot:i,label:s}}function c(e,o){switch(e.pill.dataset.state=o,o){case"connected":e.label.textContent="Bridge Orion",e.pill.title="Bridge Orion connecté à orion.cloudconsultingmastery.com";break;case"connecting":e.label.textContent="Bridge Orion · …",e.pill.title="Bridge Orion: connexion en cours";break;case"disconnected":e.label.textContent="Bridge Orion · hors ligne",e.pill.title="Bridge Orion: pas de connexion. Clic pour se connecter.";break}}async function h(e){try{const{[r]:o={}}=await chrome.storage.local.get(r),n={...o};n[e]=Date.now()+m,await chrome.storage.local.set({[r]:n})}catch{}}

})();
