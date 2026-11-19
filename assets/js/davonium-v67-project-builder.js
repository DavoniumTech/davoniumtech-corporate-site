/* DVNM Guided Project Builder: lightweight recommendation and user-controlled enquiry. */
(function () {
  'use strict';
  var app = document.getElementById('project-builder-app');
  if (!app) return;
  var types = {
    landing:{label:'Landing page',package:'Quick Launch',demo:'DVNM Biz',demoUrl:'demos/business',workspace:'workspaces/biz',packageId:'quick-launch',desc:'A focused landing page is a practical starting point for one clear offer or campaign.'},
    business:{label:'Business website',package:'Business Essential',demo:'DVNM Biz',demoUrl:'demos/business',workspace:'workspaces/biz',packageId:'business-essential',desc:'A professional multi-page business website is a useful starting point for company information, services and enquiries.'},
    growth:{label:'Business growth website',package:'Business Growth',demo:'DVNM Digital',demoUrl:'demos/technology',workspace:'workspaces/digital',packageId:'business-growth',desc:'A richer business website can bring together service content, case studies, product information and more developed enquiry journeys.'},
    commerce:{label:'Online store',package:'DVNM Commerce',demo:'DVNM Market',demoUrl:'demos/shop',workspace:'workspaces/market',packageId:'dvnm-commerce',desc:'An online store needs its product catalogue, ordering, payment, fulfilment and administration scope agreed.'},
    portfolio:{label:'Portfolio',package:'Business Growth',demo:'DVNM Creative',demoUrl:'demos/portfolio',workspace:'workspaces/creative',packageId:'business-growth',desc:'A portfolio experience can organise projects, galleries, case studies and professional enquiries.'},
    learning:{label:'Learning platform',package:'Custom Digital Solutions',demo:'DVNM Skills',demoUrl:'demos/learning',workspace:'workspaces/skills',packageId:'custom-solutions',desc:'A learning platform may need course, lesson, learner, assessment and progress workflows, so requirements should be scoped.'},
    technology:{label:'Custom software',package:'Custom Digital Solutions',demo:'DVNM Digital',demoUrl:'demos/technology',workspace:'workspaces/digital',packageId:'custom-solutions',desc:'A custom application starts with discovery of users, data, permissions, workflows and integrations.'}
  };
  var selected = new URLSearchParams(location.search).get('type') || 'business';
  if (!types[selected]) selected = 'business';
  var packageNames = {'quick-launch':'Quick Launch','business-essential':'Business Essential','business-growth':'Business Growth','dvnm-commerce':'DVNM Commerce','custom-solutions':'Custom Digital Solutions'};
  var requestedPackage = new URLSearchParams(location.search).get('package');
  var initialPackage = Object.prototype.hasOwnProperty.call(packageNames, requestedPackage) ? requestedPackage : null;
  var summaryList = document.getElementById('project-summary');
  var title = document.getElementById('recommendation-title');
  var description = document.getElementById('recommendation-description');
  var links = document.getElementById('recommendation-links');
  var currency = document.getElementById('project-currency');
  var budget = document.getElementById('project-budget');
  var detail = document.getElementById('project-description');
  var status = document.getElementById('builder-status');
  function esc(v) { return String(v).replace(/[&<>"']/g, function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);}); }
  function chosenFeatures() { return Array.from(app.querySelectorAll('#project-features input:checked')).map(function(x){return x.value;}); }
  function currentBrief() {
    var t = types[selected];
    var c = currency.value || 'NGN';
    var feats = chosenFeatures();
    return [
      'DAVONIUM TECHNOLOGIES — PROJECT ENQUIRY',
      'Project type: ' + t.label,
      'Suggested starting package: ' + (initialPackage && /^[a-z-]+$/.test(initialPackage) ? initialPackage : t.packageId),
      'Matching demonstration: ' + t.demo,
      'Preferred quotation currency: ' + c,
      'Approximate budget: ' + (budget.value.trim() || 'Not specified'),
      'Requested features: ' + (feats.length ? feats.join(', ') : 'To be discussed'),
      'Project details: ' + (detail.value.trim() || 'To be discussed'),
      '',
      'This is an enquiry brief, not an accepted quote or contract.'
    ].join('\n');
  }
  function update() {
    var t = types[selected];
    document.querySelectorAll('[data-project-type]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.projectType===selected));});
    var packageLabel = packageNames[initialPackage] || t.package;
    title.textContent = packageLabel;
    description.textContent = t.desc;
    links.innerHTML = '<a href="' + t.demoUrl + '">Explore ' + t.demo + ' ↗</a><a href="' + t.workspace + '">Preview its workspace ↗</a>';
    var feats = chosenFeatures();
    var items = ['Project type: ' + t.label, 'Suggested package: ' + packageLabel, 'Matching demo: ' + t.demo, 'Preferred currency: ' + currency.value];
    if (budget.value.trim()) items.push('Approximate budget: ' + budget.value.trim());
    if (feats.length) items.push('Features: ' + feats.join(', '));
    summaryList.innerHTML = items.map(function(x){return '<li>' + esc(x) + '</li>';}).join('');
    status.textContent = 'Your choices are local to this page. Nothing is sent until you choose an enquiry method.';
  }
  document.querySelectorAll('[data-project-type]').forEach(function(b){b.addEventListener('click',function(){selected=b.dataset.projectType;initialPackage=null;update();});});
  app.addEventListener('change', update);
  app.addEventListener('input', function(e){if(e.target===budget||e.target===detail) update();});
  document.getElementById('send-project-whatsapp').addEventListener('click', function(){
    var url='https://wa.me/2347072604426?text='+encodeURIComponent(currentBrief());
    window.open(url,'_blank','noopener,noreferrer');
    status.textContent='A WhatsApp message draft was opened. Review it before sending.';
  });
  document.getElementById('send-project-email').addEventListener('click', function(){
    var subject=encodeURIComponent('Davonium project enquiry — '+types[selected].label);
    var body=encodeURIComponent(currentBrief());
    location.href='mailto:support@davoniumtech.com?subject='+subject+'&body='+body;
    status.textContent='Your email application should open with the project brief. The enquiry is not sent until you send that email.';
  });
  update();
})();
