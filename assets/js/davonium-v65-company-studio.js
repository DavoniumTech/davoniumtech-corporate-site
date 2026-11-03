/* DAVONIUM V65 — company and independent demo studio enhancements. */
(function(){
 'use strict';
 if(window.__davoniumV65Ready) return; window.__davoniumV65Ready=true;
 var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function qs(s,c){return (c||document).querySelector(s)}
 function qsa(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
 function makeMouthPulse(){
   qsa('.v65-bot-mouth').forEach(function(m){
     m.classList.add('is-open');
     if(m.__v65Timer) clearTimeout(m.__v65Timer);
     m.__v65Timer=setTimeout(function(){m.classList.remove('is-open')},190);
   });
 }
 window.addEventListener('dvnm:v65-mouth-pulse',makeMouthPulse);
 window.addEventListener('dvnm:robot-speaking',function(e){
   var active=!!(e.detail&&e.detail.active);
   qsa('.v65-hero-character').forEach(function(el){el.classList.toggle('is-speaking',active)});
   qsa('.v65-bot-avatar').forEach(function(el){el.classList.toggle('is-speaking',active)});
 });
 // Support the existing V61 speech-boundary controller without replacing the Bot or voice engine.
 var dock=qs('.v59-bot-dock');
 if(dock){
   var observer=new MutationObserver(function(){
     var active=dock.classList.contains('is-speaking');
     qsa('.v65-hero-character').forEach(function(el){el.classList.toggle('is-speaking',active)});
     qsa('.v65-bot-avatar').forEach(function(el){el.classList.toggle('is-speaking',active)});
   });
   observer.observe(dock,{attributes:true,attributeFilter:['class']});
 }
 // The brand meaning is available to the bot and About page without introducing event-related content.
 window.DAVONIUM_BRAND_MEANING='DAVONIUM stands for Digital Access, Venture Operations, Networking, Innovation, Unity and Marketing.';
 // Attach contextual quick-links to the Bot card once it has been constructed.
 function enhanceBotCard(){
   var card=qs('.v59-bot-card'); if(!card||card.dataset.v65Enhanced==='true') return;
   card.dataset.v65Enhanced='true';
   var copy=qs('.v59-bot-copy',card);
   if(copy && !copy.textContent.includes('Digital Access')){
     var p=document.createElement('p'); p.className='v65-bot-brand-note'; p.textContent=window.DAVONIUM_BRAND_MEANING; copy.insertAdjacentElement('afterend',p);
   }
   var links=qs('.v59-bot-links',card);
   if(links && !links.querySelector('[data-v65-about-link]')){
     var a=document.createElement('a'); var baseMeta=qs('meta[name="site-base"]'); var base=baseMeta?baseMeta.content:'.'; a.href=new URL((String(base).replace(/\/$/,'')||'.')+'/about',location.href).href; a.textContent='About Davonium and our name ↗'; a.setAttribute('data-v65-about-link','true'); links.insertBefore(a,links.firstChild);
   }
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',enhanceBotCard,{once:true}); else enhanceBotCard();
 // The old site already has a dark-first theme controller. Keep the user choice and normalize mobile-nav state.
 document.addEventListener('click',function(e){
   var toggle=e.target&&e.target.closest?e.target.closest('#menu-toggle'):null;
   if(!toggle) return;
   var nav=qs('#primary-nav'); if(!nav) return;
   // Preserve the primary controller's own state; only expose an explicit state for assistive technology.
   setTimeout(function(){toggle.setAttribute('aria-expanded',String(nav.classList.contains('open')))},0);
 },true);
 // Keep all demo artwork imagery lazy after the hero; the first demo hero stays eager for LCP.
 qsa('main img').forEach(function(img){
   if(img.closest('.hero,.demo-hero') || img.hasAttribute('fetchpriority')) return;
   if(!img.loading) img.loading='lazy';
   if(!img.decoding) img.decoding='async';
 });
})();
