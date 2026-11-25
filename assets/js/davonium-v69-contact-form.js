(function(){
"use strict";
const form=document.getElementById("contact-form");if(!form)return;
form.addEventListener("submit",function(e){e.preventDefault();
const status=document.getElementById("contact-status"),btn=document.getElementById("contact-submit");
const payload={contact_name:document.getElementById("contact-name").value,email:document.getElementById("contact-email").value,phone:document.getElementById("contact-phone").value,company_name:document.getElementById("contact-company").value,service_interest:document.getElementById("contact-topic").value,message:document.getElementById("contact-message").value,privacy_consent:document.getElementById("contact-privacy").checked,marketing_opt_in:document.getElementById("contact-marketing").checked,company_website_check:document.getElementById("contact-website-check").value,source_path:location.pathname,referrer:document.referrer};
window.DavoniumEnquiry.submit(payload,status,btn).then(data=>{if(data&&data.ok){form.reset();}});
});
})();