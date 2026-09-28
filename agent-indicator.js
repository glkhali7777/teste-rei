(function(){
const { h: s } = (function(){
const r="orion_consent_sites";async function n(){if(typeof chrome>"u"||!chrome.storage?.local)return!1;try{const t=location.origin,{[r]:e}=await chrome.storage.local.get([r]);return Array.isArray(e)?e.includes("*")?!0:e.includes(t):!1}catch{return!1}}

return { h: n };
})();
const i="#7c6ef0";let t=null,n=null,o=null;function a(){if(t)return t;const e=document.createElement("div");e.id="orion-pulse-overlay",e.style.cssText=`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147483646;
    border: 2px solid ${i};
    box-shadow: inset 0 0 20px rgba(124, 110, 240, 0.15);
    animation: orion-pulse-border 2s ease-in-out infinite;
    display: none;
  `,document.documentElement.appendChild(e);const r=document.createElement("style");return r.textContent=`
    @keyframes orion-pulse-border {
      0%, 100% { border-color: ${i}; box-shadow: inset 0 0 20px rgba(124, 110, 240, 0.15); }
      50% { border-color: rgba(124, 110, 240, 0.4); box-shadow: inset 0 0 10px rgba(124, 110, 240, 0.05); }
    }
  `,document.head.appendChild(r),t=e,e}function l(){if(n)return n;const e=document.createElement("div");return e.id="orion-stop-button",e.style.cssText=`
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    background: ${i};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 12px;
    font-family: -apple-system, system-ui, sans-serif;
    cursor: pointer;
    display: none;
    align-items: center;
    gap: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  `,e.innerHTML=`
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="1"/>
    </svg>
    <span>Arreter Orion</span>
  `,e.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"STOP_AGENT"})}),document.documentElement.appendChild(e),n=e,e}function d(){if(o)return o;const e=document.createElement("div");return e.id="orion-static-indicator",e.style.cssText=`
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 2147483647;
    background: rgba(17, 17, 17, 0.95);
    border: 1px solid ${i};
    border-radius: 10px;
    padding: 8px 14px;
    font-size: 11px;
    font-family: -apple-system, system-ui, sans-serif;
    color: #a1a1a1;
    display: none;
    align-items: center;
    gap: 8px;
    backdrop-filter: blur(8px);
    box-shadow: 0 2px 12px rgba(0,0,0,0.4);
  `,e.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" stroke="${i}" fill="none" stroke-width="1.5">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2" fill="${i}"/>
    </svg>
    <span>Orion actif</span>
  `,document.documentElement.appendChild(e),o=e,e}(async()=>await s()&&(chrome.runtime.onMessage.addListener(e=>{switch(e.type){case"SHOW_AGENT_INDICATORS":a().style.display="block",l().style.display="flex";break;case"HIDE_AGENT_INDICATORS":t&&(t.style.display="none"),n&&(n.style.display="none");break;case"SHOW_STATIC_INDICATOR":d().style.display="flex";break;case"HIDE_STATIC_INDICATOR":o&&(o.style.display="none");break;case"HIDE_FOR_TOOL_USE":t&&(t.style.display="none"),n&&(n.style.display="none"),setTimeout(()=>{t&&(t.style.display="block"),n&&(n.style.display="flex")},e.duration||1e3);break}}),console.log("[Orion] Agent indicator ready")))();

})();
