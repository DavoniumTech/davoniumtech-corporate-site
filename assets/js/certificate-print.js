document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('print-showcase-certificate');
  if (button) button.addEventListener('click', () => window.print());
});
