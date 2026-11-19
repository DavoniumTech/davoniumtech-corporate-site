/* One lightweight responsive viewport controller for the five existing DVNM demos. */
(function(){
'use strict';
var frame=document.getElementById('demo-preview-frame');
var stage=document.getElementById('demo-preview-viewport');
var select=document.getElementById('demo-preview-select');
var title=document.getElementById('demo-preview-title');
var note=document.getElementById('demo-preview-note');
if(!frame||!stage||!select)return;
var demos={
 business:{name:'DVNM Biz',url:'business.html',description:'Business website experience'},
 shop:{name:'DVNM Market',url:'shop.html',description:'Online commerce experience'},
 portfolio:{name:'DVNM Creative',url:'portfolio.html',description:'Creative portfolio experience'},
 learning:{name:'DVNM Skills',url:'learning.html',description:'Learning platform experience'},
 technology:{name:'DVNM Digital',url:'technology.html',description:'Technology company experience'}
};
var params=new URLSearchParams(location.search);
var selected=demos[params.get('demo')]?params.get('demo'):'business';
var device='desktop';
function loadDemo(){var d=demos[selected];frame.src=d.url;frame.title=d.name+' responsive website preview';title.textContent=d.name+' — '+d.description;note.textContent='Previewing '+d.name+'. The device control changes the viewport width; the demo itself remains the original Davonium sample experience.';select.value=selected;}
function setDevice(next){device=['desktop','tablet','mobile'].includes(next)?next:'desktop';stage.dataset.device=device;document.querySelectorAll('[data-preview-device]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.previewDevice===device));});}
select.addEventListener('change',function(){selected=demos[select.value]?select.value:'business';loadDemo();var u=new URL(location.href);u.searchParams.set('demo',selected);history.replaceState(null,'',u.href);});
document.querySelectorAll('[data-preview-device]').forEach(function(b){b.addEventListener('click',function(){setDevice(b.dataset.previewDevice);});});
loadDemo();setDevice('desktop');
})();
