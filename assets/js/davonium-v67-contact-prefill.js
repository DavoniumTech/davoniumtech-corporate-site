/* Pre-fill the existing email-preparation form from package and project-builder links. */
(function(){
'use strict';
var params=new URLSearchParams(location.search);var msg=params.get('summary')||'';var pkg=params.get('package')||'';var topic=params.get('topic')||'';
var field=document.getElementById('contact-message');var select=document.getElementById('contact-topic');
if(field&&(msg||pkg)){var intro=pkg?'Selected package: '+pkg+'\n\n':'';field.value=(intro+msg).slice(0,6000);}
if(select&&topic){var text= /support|documentation/i.test(topic)?'Documentation or support':/product|software|app/i.test(topic)?'Product question':'Website project';Array.from(select.options).forEach(function(o){if(o.text.trim()===text)select.value=o.value;});}
})();
