/* DAVONIUM TECHNOLOGIES V62 - page-aware DVNM Bot controls and shared header voice access. */
(function () {
  'use strict';
  if (window.__davoniumV62Ready) return;
  window.__davoniumV62Ready = true;

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function currentPageSummary() {
    var main = document.querySelector('main');
    if (!main) return 'Welcome to Davonium Technologies. Explore our company, services, products, work, five digital experiences and support resources.';
    var heading = main.querySelector('h1');
    var title = heading ? heading.textContent.replace(/\s+/g, ' ').trim() : document.title.split('|')[0].trim();
    var selectors = [
      '.pagehero .lead', '.hero .lead', '.demo-hero .lead', '.demo-hero p',
      '.intro .lead', '.pagehero p', '.demo-hero-copy p', 'p'
    ];
    var paragraphs = [];
    selectors.some(function (selector) {
      var nodes = Array.prototype.slice.call(main.querySelectorAll(selector));
      paragraphs = nodes.map(function (node) { return node.textContent.replace(/\s+/g, ' ').trim(); })
        .filter(function (value) { return value.length > 45; });
      return paragraphs.length > 0;
    });
    var summary = (title ? 'You are viewing ' + title + '. ' : '') + paragraphs.slice(0, 3).join(' ');
    if (summary.length > 1150) summary = summary.slice(0, 1147).replace(/\s+\S*$/, '') + '...';
    return summary || 'Welcome to Davonium Technologies. Explore useful digital products, services and independent demo experiences.';
  }

  function absoluteSectionUrl(path) {
    path = String(path || '').replace(/^\/+/, '');
    try { return new URL(path || './', location.origin + '/').href; }
    catch (_) { return location.origin + '/' + path; }
  }

  function enhanceBot() {
    var dock = document.querySelector('.v59-bot-dock');
    if (!dock) return;
    var trigger = dock.querySelector('.v59-bot-trigger');
    var card = dock.querySelector('.v59-bot-card');
    var copy = dock.querySelector('.v59-bot-copy');
    var topicGroup = dock.querySelector('.v61-bot-topics');
    if (!trigger || !card || !copy || !topicGroup) return;

    var topics = window.DVNMV61Bot && Array.isArray(window.DVNMV61Bot.topics) ? window.DVNMV61Bot.topics : [];
    var currentButton = topicGroup.querySelector('[data-topic="v62-current-page"]');
    if (!currentButton) {
      currentButton = document.createElement('button');
      currentButton.type = 'button';
      currentButton.className = 'v61-bot-topic';
      currentButton.setAttribute('data-topic', 'v62-current-page');
      currentButton.setAttribute('aria-pressed', 'false');
      currentButton.textContent = 'Explain this page';
      topicGroup.appendChild(currentButton);
    }

    var openSection = dock.querySelector('.v62-bot-open-section');
    if (!openSection) {
      openSection = document.createElement('a');
      openSection.className = 'v62-bot-open-section';
      openSection.hidden = true;
      openSection.textContent = 'Open this section';
      openSection.setAttribute('aria-label', 'Open the selected Davonium section');
      topicGroup.insertAdjacentElement('afterend', openSection);
    }

    function showTopicLink(path, label) {
      openSection.href = absoluteSectionUrl(path);
      openSection.textContent = label || 'Open this section';
      openSection.hidden = false;
    }

    var pageTopicMap = {
      about:'company', services:'services', products:'products', work:'work',
      'demo-studio':'studio', 'demo-biz':'studio', 'demo-shop':'studio',
      'demo-portfolio':'studio', 'demo-learning':'studio', 'demo-technology':'studio',
      docs:'docs', documentation:'docs', contact:'contact', support:'contact'
    };
    topicGroup.addEventListener('click', function (event) {
      var button = event.target && event.target.closest ? event.target.closest('button[data-topic]') : null;
      if (!button) return;
      var key = button.getAttribute('data-topic');
      var currentPage = document.body.getAttribute('data-page') || '';
      // On a matching company page, make that topic explain the visible page rather than a generic summary.
      if (key !== 'v62-current-page' && pageTopicMap[currentPage] === key) {
        event.preventDefault(); event.stopImmediatePropagation();
        var matchingSummary = currentPageSummary();
        copy.textContent = matchingSummary;
        Array.prototype.forEach.call(topicGroup.querySelectorAll('button'), function (item) {
          item.setAttribute('aria-pressed', String(item === button));
        });
        showTopicLink(location.pathname.replace(/^\//, '') + location.hash, 'Open this page ↗');
        if (window.DVNMV61Bot && typeof window.DVNMV61Bot.play === 'function') window.DVNMV61Bot.play(matchingSummary);
        return;
      }
      if (key === 'v62-current-page') {
        var summary = currentPageSummary();
        copy.textContent = summary;
        Array.prototype.forEach.call(topicGroup.querySelectorAll('button'), function (item) {
          item.setAttribute('aria-pressed', String(item === button));
        });
        showTopicLink(location.pathname.replace(/^\//, '') + location.hash, 'Open this page ↗');
        if (window.DVNMV61Bot && typeof window.DVNMV61Bot.play === 'function') window.DVNMV61Bot.play(summary);
        return;
      }
      var topic = topics.find(function (item) { return item.key === key; });
      if (topic) showTopicLink(topic.link, 'Open ' + topic.label + ' ↗');
    }, true);

    // Tapping the existing approved Bot head opens its card and reads the current page.
    // Audio remains user-initiated; nothing speaks on page load.
    trigger.addEventListener('click', function () {
      window.setTimeout(function () {
        if (card.classList.contains('is-open') && window.DVNMV61Bot && typeof window.DVNMV61Bot.play === 'function') {
          window.DVNMV61Bot.play(currentPageSummary());
        }
      }, 320);
    });
  }

  function installHeaderVoiceShortcut() {
    var actions = document.querySelector('.head .actions');
    if (!actions || actions.querySelector('.v62-bot-audio-shortcut')) return;
    var theme = actions.querySelector('#theme-toggle, .icon');
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'v62-bot-audio-shortcut';
    button.setAttribute('aria-label', 'Open DVNM Bot voice guide');
    button.setAttribute('title', 'Hear the DVNM Bot guide');
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h3l5 4V6l-5 4H4Z"/><path d="M16 9.2a4 4 0 0 1 0 5.6"/><path d="M18.7 6.7a7.5 7.5 0 0 1 0 10.6"/></svg>';
    button.addEventListener('click', function () {
      var trigger = document.querySelector('.v59-bot-dock .v59-bot-trigger');
      var card = document.querySelector('.v59-bot-dock .v59-bot-card');
      if (!trigger || !card) return;
      if (card.classList.contains('is-open')) {
        if (window.DVNMV61Bot && typeof window.DVNMV61Bot.play === 'function') window.DVNMV61Bot.play(currentPageSummary());
      } else {
        trigger.click();
      }
    });
    if (theme) actions.insertBefore(button, theme);
    else actions.insertBefore(button, actions.firstChild);
  }

  function ensureDemoNavigation() {
    if (!document.body.classList.contains('demo-page')) return;
    var header = document.querySelector('body > header.head, body > header');
    if (header) {
      header.style.position = 'sticky';
      header.style.top = '0';
      header.style.zIndex = '30000';
    }
    var nav = document.querySelector('#primary-nav');
    var toggle = document.querySelector('#menu-toggle, .menu-toggle, [data-menu-toggle]');
    if (nav && toggle) {
      toggle.setAttribute('aria-controls', nav.id || 'primary-nav');
      if (!nav.id) nav.id = 'primary-nav';
    }
  }

  onReady(function () {
    enhanceBot();
    installHeaderVoiceShortcut();
    ensureDemoNavigation();
  });
})();
