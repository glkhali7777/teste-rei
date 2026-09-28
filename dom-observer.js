(function(){
const { h: d } = (function(){
const r="orion_consent_sites";async function n(){if(typeof chrome>"u"||!chrome.storage?.local)return!1;try{const t=location.origin,{[r]:e}=await chrome.storage.local.get([r]);return Array.isArray(e)?e.includes("*")?!0:e.includes(t):!1}catch{return!1}}

return { h: n };
})();
(async function(){const o=window;if(typeof o.__orionDomObserverTeardown=="function")try{o.__orionDomObserverTeardown()}catch{}if(!await d())return;let e=null,t=0;const s=500,i=new MutationObserver(()=>{r()});i.observe(document.documentElement,{childList:!0,subtree:!0,attributes:!0,characterData:!0});const a=XMLHttpRequest.prototype.open,u=function(...n){return t++,this.addEventListener("loadend",()=>{t--,t<=0&&(t=0,r())}),a.apply(this,n)};XMLHttpRequest.prototype.open=u;const c=window.fetch;window.fetch=function(...n){return t++,c.apply(this,n).finally(()=>{t--,t<=0&&(t=0,r())})};function r(){e&&clearTimeout(e),e=setTimeout(()=>{t<=0&&chrome.runtime.sendMessage({type:"DOM_STABLE",url:location.href,timestamp:Date.now()}).catch(()=>{})},s)}o.__orionDomObserverTeardown=function(){try{i.disconnect()}catch{}e&&(clearTimeout(e),e=null);try{XMLHttpRequest.prototype.open=a}catch{}try{window.fetch=c}catch{}t=0},window.addEventListener("pagehide",()=>{try{o.__orionDomObserverTeardown?.()}catch{}}),console.log("[Orion] DOM observer ready")})();

})();
