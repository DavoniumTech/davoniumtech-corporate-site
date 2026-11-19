/* DVNM V67 Workspace previews - generic front-end-only management framework. */
(function(){
'use strict';
var mount=document.getElementById('workspace-app'); if(!mount) return;
var key=mount.getAttribute('data-workspace');
var config=window.DVNM_V67_WORKSPACES && window.DVNM_V67_WORKSPACES[key]; if(!config) return;
var state=JSON.parse(JSON.stringify(config.modules));
var active=Object.keys(state)[0]; var toast='';
function esc(v){return String(v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);});}
function renderShell(){
 mount.style.setProperty('--wk-accent',config.accent);
 mount.innerHTML='<div class="workspace-app"><aside class="workspace-sidebar"><div class="workspace-brand"><span class="workspace-mark">D</span><div><strong>'+esc(config.name)+'</strong><small>DAVONIUM · PREVIEW</small></div></div><nav class="workspace-nav" aria-label="Workspace modules">'+Object.keys(state).map(function(name){return '<button type="button" data-module="'+esc(name)+'" '+(name===active?'aria-current="page"':'')+'><span aria-hidden="true">◈</span><span>'+esc(name)+'</span></button>';}).join('')+'<button type="button" data-module="Overview" '+(active==='Overview'?'aria-current="page"':'')+'><span aria-hidden="true">▦</span><span>Overview</span></button></nav><div class="workspace-side-note">Sample workspace only. Changes are held in this page session and are not connected to a customer website.</div></aside><div class="workspace-main"><header class="workspace-header"><div><h1>'+esc(config.name)+'</h1><p>'+esc(config.summary)+'</p></div><span class="workspace-live">INTERACTIVE PREVIEW</span></header><section class="workspace-stats">'+config.stats.map(function(x){return '<article class="workspace-stat"><small>'+esc(x[0])+'</small><strong>'+esc(x[1])+'</strong><span>'+esc(x[2])+'</span></article>';}).join('')+'</section><section class="workspace-panel" id="workspace-view" aria-live="polite"></section></div></div>';
 renderView();
}
function renderView(){
 var view=document.getElementById('workspace-view'); if(!view) return;
 if(active==='Overview'){
  view.innerHTML='<div class="workspace-panel-head"><div><h2>Workspace overview</h2><p>Sample activity and shortcuts for '+esc(config.demoName)+'.</p></div></div><div class="workspace-overview-grid"><div class="workspace-note"><strong>Workspace status</strong><p>This is a front-end demonstration using sample records. It shows one possible management experience; it does not publish changes to a real website or database.</p><div class="workspace-reset-row"><button class="workspace-button" type="button" data-action="go-first">Open content manager</button><button class="workspace-button" type="button" data-action="reset">Reset demonstration</button></div></div><div class="workspace-note"><strong>Related experience</strong><p>'+esc(config.demoName)+' is the public-facing website demonstration. Explore the visitor experience alongside this management preview.</p><div class="workspace-reset-row"><a href="'+config.demo+'">Open public demo ↗</a></div></div></div><p class="workspace-toast" role="status">'+esc(toast)+'</p>';
 }else{
  var items=state[active]||[];
  view.innerHTML='<div class="workspace-panel-head"><div><h2>'+esc(active)+'</h2><p>Edit the sample labels, add an example record or remove a record. Changes stay in this browser page only.</p></div><span class="v67-pill">'+items.length+' sample items</span></div>'+
   (items.length?'<div class="workspace-items">'+items.map(function(item,i){return '<form class="workspace-item" data-edit-form data-index="'+i+'"><input name="value" aria-label="Edit sample item '+(i+1)+'" value="'+esc(item)+'" maxlength="90" required><button type="submit">Save</button><button type="button" data-action="remove" data-index="'+i+'">Remove</button></form>';}).join('')+'</div>':'<div class="workspace-empty">No sample records yet. Add an example below to explore this module.</div>')+
   '<form class="workspace-add" data-add-form><input name="value" maxlength="90" placeholder="Add a sample '+esc(active.toLowerCase())+' entry" aria-label="New sample entry" required><button class="workspace-button" type="submit">Add sample item</button></form><div class="workspace-reset-row"><button class="workspace-button" type="button" data-action="preview">Preview changes</button><button class="workspace-button" type="button" data-action="reset">Reset demonstration</button></div><p class="workspace-toast" role="status">'+esc(toast)+'</p>';
 }
 mount.querySelectorAll('[data-module]').forEach(function(b){if(b.dataset.module===active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
}
mount.addEventListener('click',function(event){
 var b=event.target.closest('[data-module],[data-action]'); if(!b)return;
 if(b.hasAttribute('data-module')){active=b.dataset.module;toast='';renderView();return;}
 var action=b.dataset.action;
 if(action==='remove'){var i=Number(b.dataset.index);if(Number.isInteger(i)&&state[active]){state[active].splice(i,1);toast='Sample item removed.';renderView();}}
 if(action==='reset'){state=JSON.parse(JSON.stringify(config.modules));active='Overview';toast='The original sample content has been restored.';renderShell();}
 if(action==='go-first'){active=Object.keys(state)[0];toast='';renderView();}
 if(action==='preview'){toast='Preview updated with your current sample changes.';renderView();}
});
mount.addEventListener('submit',function(event){
 var form=event.target;
 if(form.matches('[data-edit-form]')){event.preventDefault();var idx=Number(form.dataset.index);var value=form.elements.value.value.trim();if(value&&state[active]&&Number.isInteger(idx)){state[active][idx]=value;toast='Sample entry updated.';renderView();}}
 if(form.matches('[data-add-form]')){event.preventDefault();var added=form.elements.value.value.trim();if(added&&state[active]){state[active].push(added);toast='Sample entry added.';renderView();}}
});
renderShell();
})();
