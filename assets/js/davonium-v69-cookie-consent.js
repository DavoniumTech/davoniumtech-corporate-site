(function(){
  "use strict";
  const KEY="davonium.cookiePreferences.v1";
  const defaults={essential:true,analytics:false,marketing:false,updatedAt:null};
  const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||"null");return v&&typeof v==="object"?{...defaults,...v,essential:true}:null}catch{return null}};
  const save=p=>{const v={...defaults,...p,essential:true,updatedAt:new Date().toISOString()};try{localStorage.setItem(KEY,JSON.stringify(v))}catch{};return v};
  const current=read();
  window.DavoniumConsent={get:()=>read(),save,open:()=>openDialog(),reset:()=>{localStorage.removeItem(KEY);openDialog()}};
  const css=`
  .dv-consent{position:fixed;z-index:999999;left:18px;right:18px;bottom:18px;max-width:680px;margin:auto;padding:20px;background:var(--dv-consent-bg,#101b2c);color:var(--dv-consent-fg,#eef4ff);border:1px solid rgba(255,255,255,.16);border-radius:18px;box-shadow:0 18px 60px rgba(0,0,0,.35);font:inherit}
  .dv-consent h2{font-size:1.1rem;margin:0 0 8px}.dv-consent p{margin:0 0 12px;font-size:.92rem;line-height:1.55;color:inherit}
  .dv-consent a{color:#9ed1ff}.dv-consent-actions{display:flex;gap:8px;flex-wrap:wrap}.dv-consent button{border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:10px 14px;font:inherit;font-weight:650;cursor:pointer;background:transparent;color:inherit}.dv-consent button.primary{background:#8bc5ff;color:#081626;border-color:transparent}.dv-consent button.secondary{background:rgba(255,255,255,.08)}.dv-consent button:focus-visible{outline:3px solid #9ed1ff;outline-offset:2px}
  .dv-consent-settings{margin-top:14px;border-top:1px solid rgba(255,255,255,.15);padding-top:12px}.dv-consent-settings label{display:flex;justify-content:space-between;align-items:center;padding:8px 0;gap:12px}.dv-consent-settings input{width:20px;height:20px;accent-color:#8bc5ff}
  @media(max-width:520px){.dv-consent{left:10px;right:10px;bottom:10px;padding:16px}.dv-consent-actions button{flex:1}}
  `;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
  function openDialog(){
    if(document.getElementById("dv-consent"))return;
    const panel=document.createElement("section");panel.id="dv-consent";panel.className="dv-consent";panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.setAttribute("aria-labelledby","dv-consent-title");
    panel.innerHTML='<h2 id="dv-consent-title">Your privacy choices</h2><p>We use essential browser storage for preferences and the website app experience. Optional analytics or marketing storage remains off unless you choose it. <a href="'+(location.pathname.includes("/legal/")?"cookies":"legal/cookies")+'">Learn about cookies &amp; storage</a>.</p><div class="dv-consent-actions"><button class="primary" data-action="accept">Accept optional</button><button class="secondary" data-action="reject">Reject optional</button><button class="secondary" data-action="customize">Customize</button></div><div class="dv-consent-settings" hidden><label>Essential storage <span>Always on</span></label><label>Analytics storage <input type="checkbox" id="dv-analytics"></label><label>Marketing storage <input type="checkbox" id="dv-marketing"></label><div class="dv-consent-actions"><button class="primary" data-action="save">Save choices</button></div></div>';
    panel.addEventListener("click",e=>{const btn=e.target.closest("button");if(!btn)return;const a=btn.dataset.action;if(a==="accept"){save({analytics:false,marketing:false});panel.remove()}if(a==="reject"){save({analytics:false,marketing:false});panel.remove()}if(a==="customize"){const s=panel.querySelector(".dv-consent-settings");s.hidden=false;panel.querySelector("#dv-analytics").checked=read()?.analytics===true;panel.querySelector("#dv-marketing").checked=read()?.marketing===true;btn.disabled=true;}if(a==="save"){save({analytics:panel.querySelector("#dv-analytics").checked,marketing:panel.querySelector("#dv-marketing").checked});panel.remove()}});
    document.body.appendChild(panel);panel.querySelector("button").focus();
  }
  if(!current){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",openDialog,{once:true});else openDialog();}
  // Expose a consistent preferences entry point to existing page footers without altering their layouts.
  document.addEventListener("DOMContentLoaded",()=>{const a=document.createElement("button");a.type="button";a.textContent="Cookie preferences";a.style.cssText="position:fixed;z-index:999998;left:10px;bottom:10px;font:inherit;font-size:12px;padding:6px 9px;border-radius:8px;border:1px solid rgba(128,128,128,.45);background:rgba(16,27,44,.8);color:white;opacity:.7";a.addEventListener("click",openDialog);document.body.appendChild(a)});
})();