/* Davonium V69: persistent enquiry form client. */
(function(){
 "use strict";
 const cfg=window.DAVONIUM_BACKEND;
 if(!cfg)return;
 function submitEnquiry(payload,status,button){
  const consent=window.DavoniumConsent?.get();
  if(!consent){status.textContent="Please set your cookie/storage preference before submitting.";return Promise.resolve(false);}
  if(!payload.privacy_consent){status.textContent="Please accept the privacy notice to send this enquiry.";return Promise.resolve(false);}
  button.disabled=true;const old=button.textContent;button.textContent="Sending securely…";
  return fetch(cfg.url+"/functions/v1/"+cfg.enquiryFunction,{method:"POST",headers:{"Content-Type":"application/json","apikey":cfg.publishableKey},body:JSON.stringify(payload)})
   .then(async r=>{const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||"We could not save your enquiry. Please try again or use WhatsApp.");return data;})
   .then(data=>{status.textContent="Enquiry received successfully. Reference: "+data.reference+". We will review it and respond.";return data;})
   .catch(err=>{status.textContent=err.message||"Could not send enquiry. Please try WhatsApp or email.";return false;})
   .finally(()=>{button.disabled=false;button.textContent=old;});
 }
 window.DavoniumEnquiry={submit:submitEnquiry};
})();