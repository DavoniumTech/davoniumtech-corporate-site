/* Davonium theme preference bootstrap — external file for strict CSP compatibility. */
(function () {
  'use strict';
  try {
    var key = 'davonium-theme-choice';
    var choice = localStorage.getItem(key);
    if (choice !== 'light' && choice !== 'dark') {
      choice = 'dark';
      localStorage.setItem(key, choice);
    }
    document.documentElement.dataset.theme = choice;
    document.documentElement.classList.toggle('dark', choice === 'dark');
    document.documentElement.classList.toggle('light', choice === 'light');
  } catch (error) {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.classList.add('dark');
  }
}());
