(function(){
  "use strict";
  var root=document.documentElement;
  var themeButton=document.getElementById("theme-toggle");
  var nav=document.getElementById("primary-nav");
  var menuButton=document.getElementById("menu-toggle");
  var speakButton=document.getElementById("v58-bot-speak");
  var voiceStatus=document.getElementById("v58-bot-audio-status");
  var volume=document.getElementById("v72-bot-volume");
  var stage=document.getElementById("v72-bot-stage");
  var utterance=null;

  function applyTheme(theme){
    var next=theme==="light"?"light":"dark";
    root.dataset.theme=next;
    try{localStorage.setItem("davonium.v72.theme",next);}catch(_){}
    if(themeButton){
      themeButton.textContent=next==="dark"?"☼":"◐";
      themeButton.setAttribute("aria-label",next==="dark"?"Switch to light theme":"Switch to dark theme");
      themeButton.setAttribute("aria-pressed",String(next==="dark"));
      themeButton.title=next==="dark"?"Switch to light theme":"Switch to dark theme";
    }
  }
  applyTheme(root.dataset.theme||"dark");
  if(themeButton)themeButton.addEventListener("click",function(){
    applyTheme(root.dataset.theme==="dark"?"light":"dark");
  });

  function closeMenu(){
    if(!nav||!menuButton)return;
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded","false");
    menuButton.setAttribute("aria-label","Open navigation");
  }
  if(menuButton&&nav){
    menuButton.addEventListener("click",function(){
      var open=menuButton.getAttribute("aria-expanded")==="true";
      menuButton.setAttribute("aria-expanded",String(!open));
      menuButton.setAttribute("aria-label",open?"Open navigation":"Close navigation");
      menuButton.textContent=open?"☰":"×";
      nav.classList.toggle("open",!open);
    });
    nav.addEventListener("click",function(event){
      if(event.target.closest("a"))closeMenu();
    });
    document.addEventListener("click",function(event){
      if(!event.target.closest(".v72-nav"))closeMenu();
    });
    document.addEventListener("keydown",function(event){
      if(event.key==="Escape")closeMenu();
    });
  }

  function voiceReset(message){
    if(speakButton){
      speakButton.textContent="▶ Hear the introduction";
      speakButton.setAttribute("aria-pressed","false");
    }
    if(stage)stage.dataset.speaking="false";
    if(voiceStatus&&message)voiceStatus.textContent=message;
    utterance=null;
  }
  if(speakButton&&voiceStatus){
    var synth=window.speechSynthesis;
    if(!synth){
      speakButton.disabled=true;
      voiceStatus.textContent="Spoken introduction is not supported by this browser.";
    }else{
      speakButton.addEventListener("click",function(){
        if(synth.speaking){
          synth.cancel();
          voiceReset("Introduction stopped.");
          return;
        }
        var text="Welcome to Davonium Technologies. We design and engineer digital products, websites, mobile experiences and business software for organisations that value clarity and dependable delivery. Explore our services, see the independent experiences in the Davonium Demo Studio, or tell us about the project you want to build. Our demonstrations are clearly labelled, and our product pages explain what is available today and what is still in development. We look forward to hearing from you.";
        utterance=new SpeechSynthesisUtterance(text);
        utterance.lang="en-GB";
        utterance.rate=0.96;
        utterance.pitch=1;
        utterance.volume=volume?Math.max(0,Math.min(1,Number(volume.value)||0.8)):0.8;
        var voices=synth.getVoices?synth.getVoices():[];
        var selected=voices.find(function(v){return /^en-GB/i.test(v.lang);})||voices.find(function(v){return /^en-/i.test(v.lang);});
        if(selected)utterance.voice=selected;
        utterance.onstart=function(){
          speakButton.textContent="■ Stop introduction";
          speakButton.setAttribute("aria-pressed","true");
          if(stage)stage.dataset.speaking="true";
          voiceStatus.textContent="DVNM Bot is speaking.";
        };
        utterance.onend=function(){voiceReset("Introduction finished.");};
        utterance.onerror=function(){voiceReset("Speech playback stopped or could not start.");};
        synth.cancel();
        synth.speak(utterance);
      });
      if(volume)volume.addEventListener("input",function(){
        if(utterance)utterance.volume=Math.max(0,Math.min(1,Number(volume.value)||0));
      });
      document.addEventListener("visibilitychange",function(){
        if(document.hidden&&synth.speaking){synth.cancel();voiceReset("Introduction paused when you left the page.");}
      });
    }
  }

  var year=document.querySelector("[data-current-year]");
  if(year)year.textContent=String(new Date().getFullYear());

  if("serviceWorker" in navigator){
    window.addEventListener("load",function(){
      navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(function(){});
    },{once:true});
  }
})();