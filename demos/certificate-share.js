/* V45: local-only, shareable showcase PNG. No visitor name is sent to a server. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const nameInput = $('certificate-name');
  const demoSelect = $('certificate-demo');
  const recipient = $('certificate-recipient');
  const descriptionDetail = $('certificate-detail-text');
  const dateLabel = $('certificate-date');
  const serialLabel = $('certificate-serial');
  const status = $('certificate-status');
  const downloadButton = $('certificate-download');
  const shareButton = $('certificate-share');
  const printButton = $('certificate-print');
  const samples = [...document.querySelectorAll('[data-sample]')];
  if (!nameInput || !demoSelect || !recipient || !downloadButton || !shareButton || !printButton) return;

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const serial = `DVNM-SHOWCASE-${y}${m}${d}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  serialLabel.textContent = serial;
  dateLabel.textContent = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(now);
  const allSamples = [
    ['biz', '01', 'DVNM Biz', 'Business websites and service pathways'],
    ['growth', '02', 'DVNM Growth', 'Campaigns, positioning and growth journeys'],
    ['market', '03', 'DVNM Market', 'Commerce and product discovery'],
    ['creative', '04', 'DVNM Creative', 'Portfolio storytelling and motion'],
    ['skills', '05', 'DVNM Skills', 'Learning and guided practice'],
    ['digital', '06', 'DVNM Digital', 'Technology and digital products'],
    ['connect', '07', 'DVNM Connect', 'Community and collaboration']
  ];
  const selected = () => demoSelect.value;
  const selectedItems = () => selected() === 'all' ? allSamples : allSamples.filter(item => item[0] === selected());
  function updatePreview() {
    const name = String(nameInput.value || '').trim().slice(0, 64) || 'A Digital Explorer';
    recipient.textContent = name;
    if (descriptionDetail) {
      descriptionDetail.textContent = selected() === 'all'
        ? 'explored all seven original Davonium Technologies sample experiences and their design directions.'
        : `explored the ${allSamples.find(item => item[0] === selected())?.[2] || 'selected'} sample experience and its design direction.`;
    }
    samples.forEach(li => {
      const active = selected() === 'all' || li.dataset.sample === selected();
      li.classList.toggle('is-selected', selected() !== 'all' && active);
      li.classList.toggle('is-dimmed', selected() !== 'all' && !active);
    });
  }
  const certificateForm = $('certificate-form');
  if (certificateForm) certificateForm.addEventListener('submit', event => event.preventDefault());
  nameInput.addEventListener('input', updatePreview);
  demoSelect.addEventListener('change', updatePreview);
  updatePreview();

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + width, y, x + width, y + height, r); ctx.arcTo(x + width, y + height, x, y + height, r); ctx.arcTo(x, y + height, x, y, r); ctx.arcTo(x, y, x + width, y, r); ctx.closePath();
  }
  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
    const words = String(text).split(/\s+/); let line = ''; let count = 0;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, y); y += lineHeight; count++; line = word; if (count >= maxLines - 1) break; }
      else line = test;
    }
    if (line) { ctx.fillText(line, x, y); y += lineHeight; }
    return y;
  }
  function loadImage(src) {
    return new Promise(resolve => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = src; });
  }
  async function renderCertificate() {
    const canvas = document.createElement('canvas'); canvas.width = 2400; canvas.height = 1600;
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Your browser cannot create the certificate image.');
    const logo = await loadImage('../assets/images/davonium-d-icon.webp');
    const qr = await loadImage('../assets/images/qr-dvnm-demo-studio.png');
    const bg = ctx.createLinearGradient(0, 0, 2400, 1600); bg.addColorStop(0, '#f8fbff'); bg.addColorStop(.55, '#f0f3ff'); bg.addColorStop(1, '#e9faf7');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 12; ctx.strokeStyle = '#7493c0'; roundedRect(ctx, 36, 36, 2328, 1528, 22); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = '#b6c9e4'; roundedRect(ctx, 63, 63, 2274, 1474, 14); ctx.stroke();
    ctx.globalAlpha = .16; ctx.strokeStyle = '#3f9fcb'; ctx.lineWidth = 3;
    for (let r = 0; r < 5; r++) { ctx.beginPath(); ctx.arc(2240, 140, 80 + r * 35, 0, Math.PI * 2); ctx.stroke(); }
    ctx.globalAlpha = 1;
    if (logo) ctx.drawImage(logo, 215, 128, 112, 112);
    ctx.textAlign = 'left'; ctx.fillStyle = '#172a49'; ctx.font = '800 42px Arial, sans-serif'; ctx.fillText('DAVONIUM TECHNOLOGIES', 355, 176);
    ctx.fillStyle = '#61748f'; ctx.font = '600 23px Arial, sans-serif'; ctx.fillText('USEFUL TECHNOLOGY, BUILT WITH CARE', 357, 221);
    ctx.textAlign = 'center'; ctx.fillStyle = '#2c70a6'; ctx.font = '800 26px Arial, sans-serif'; ctx.letterSpacing = '8px'; ctx.fillText('DEMO STUDIO  ·  DIGITAL EXPERIENCE PASSPORT', 1200, 350); ctx.letterSpacing = '0px';
    ctx.fillStyle = '#132b52'; ctx.font = '700 112px Georgia, "Times New Roman", serif'; ctx.fillText('Showcase Certificate', 1200, 490);
    ctx.fillStyle = '#61728d'; ctx.font = '32px Arial, sans-serif'; ctx.fillText('This records that', 1200, 575);
    const displayName = String(nameInput.value || '').trim().slice(0, 64) || 'A Digital Explorer';
    ctx.fillStyle = '#1a8da9'; ctx.font = `700 ${displayName.length > 28 ? 44 : 60}px Arial, sans-serif`; ctx.fillText(displayName, 1200, 665, 1800);
    const chosen = selectedItems();
    ctx.fillStyle = '#536580'; ctx.font = '30px Arial, sans-serif';
    const selectedDescription = selected() === 'all' ? 'explored all seven original Davonium Technologies sample experiences and their design directions.' : `explored the ${chosen[0]?.[2] || 'selected'} sample experience and its design direction.`;
    ctx.fillText(selectedDescription, 1200, 730, 1900);
    const rule = ctx.createLinearGradient(780, 0, 1620, 0); rule.addColorStop(0, '#2db5d3'); rule.addColorStop(.5, '#7661e5'); rule.addColorStop(1, '#e8b36e'); ctx.fillStyle = rule; roundedRect(ctx, 1100, 786, 200, 8, 4); ctx.fill();
    ctx.textAlign = 'left'; let yy = 875;
    ctx.fillStyle = '#6a7790'; ctx.font = '800 20px Arial, sans-serif'; ctx.fillText(selected() === 'all' ? 'SEVEN DISTINCT EXPERIENCES' : 'SELECTED EXPERIENCE', 250, 842);
    chosen.forEach((item, index) => {
      const col = index % 2; const row = Math.floor(index / 2); const x = 250 + col * 720; const y0 = yy + row * 105;
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#d6e1f0'; ctx.lineWidth = 2; roundedRect(ctx, x, y0, 660, 78, 14); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#3a80c3'; roundedRect(ctx, x + 17, y0 + 15, 48, 48, 10); ctx.fill();
      ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '800 20px Arial, sans-serif'; ctx.fillText(item[1], x + 41, y0 + 45);
      ctx.textAlign = 'left'; ctx.fillStyle = '#19345d'; ctx.font = '800 26px Arial, sans-serif'; ctx.fillText(item[2], x + 84, y0 + 34);
      ctx.fillStyle = '#62718a'; ctx.font = '19px Arial, sans-serif'; ctx.fillText(item[3], x + 84, y0 + 59, 540);
    });
    if (qr) { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#d1deed'; roundedRect(ctx, 1810, 845, 320, 320, 16); ctx.fill(); ctx.stroke(); ctx.drawImage(qr, 1830, 865, 280, 280); ctx.textAlign = 'center'; ctx.fillStyle = '#435775'; ctx.font = '800 18px Arial, sans-serif'; ctx.fillText('SCAN TO EXPLORE THE DEMO STUDIO', 1970, 1195); }
    ctx.strokeStyle = '#ccd9eb'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(230, 1280); ctx.lineTo(2170, 1280); ctx.stroke();
    ctx.textAlign = 'left'; ctx.fillStyle = '#19345d'; ctx.font = '700 27px Georgia, "Times New Roman", serif'; ctx.fillText('Davonium Technologies', 250, 1340); ctx.fillStyle = '#62718a'; ctx.font = '20px Arial, sans-serif'; ctx.fillText('Company showcase · Sample experiences', 250, 1377);
    ctx.fillStyle = '#19345d'; ctx.font = '700 27px Georgia, "Times New Roman", serif'; ctx.fillText(dateLabel.textContent, 1050, 1340); ctx.fillStyle = '#62718a'; ctx.font = '20px Arial, sans-serif'; ctx.fillText('Date prepared in this browser', 1050, 1377);
    ctx.textAlign = 'right'; ctx.fillStyle = '#506487'; ctx.font = '800 21px monospace'; ctx.fillText(serial, 2150, 1340);
    ctx.textAlign = 'center'; ctx.fillStyle = '#6a7890'; ctx.font = '18px Arial, sans-serif';
    wrapText(ctx, 'SELF-GENERATED, NON-OFFICIAL SHOWCASE RECORD. NOT AN ACCREDITED CERTIFICATE, ACADEMIC AWARD, PROFESSIONAL QUALIFICATION, OR VERIFICATION OF CUSTOMER WORK.', 1200, 1470, 1950, 26, 2);
    return canvas;
  }
  async function canvasBlob(canvas) { return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('The certificate image could not be encoded.')), 'image/png')); }
  function setStatus(message) { if (status) status.textContent = message; }
  async function makeFile() { const canvas = await renderCertificate(); const blob = await canvasBlob(canvas); return new File([blob], 'davonium-demo-studio-showcase.png', { type: 'image/png' }); }
  downloadButton.addEventListener('click', async () => {
    downloadButton.disabled = true; setStatus('Preparing your high-resolution showcase image…');
    try {
      const file = await makeFile(); const url = URL.createObjectURL(file); const link = document.createElement('a'); link.href = url; link.download = file.name; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 15000);
      setStatus('Certificate image downloaded. You can attach it to WhatsApp, email, or another sharing app.');
    } catch (error) { setStatus(error.message || 'Could not create the image. Try Print / Save as PDF instead.'); }
    finally { downloadButton.disabled = false; }
  });
  shareButton.addEventListener('click', async () => {
    shareButton.disabled = true; setStatus('Preparing your shareable showcase image…');
    try {
      const file = await makeFile();
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'Davonium Technologies Demo Studio Showcase', text: 'A personal, non-official showcase record of the DVNM demo experiences.', files: [file] });
        setStatus('The system share sheet has opened. Choose the app or person you want to share with.');
      } else if (navigator.share) {
        await navigator.share({ title: 'Davonium Technologies Demo Studio Showcase', text: 'A personal, non-official showcase record of the DVNM demo experiences.', url: 'https://www.davoniumtech.com/demos/certificate' });
        setStatus('Shared the certificate page link. Download the image to share the personalised certificate itself.');
      } else {
        const url = URL.createObjectURL(file); const link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 15000);
        setStatus('This browser has no share sheet, so the image was downloaded. Attach it to the app you want to share through.');
      }
    } catch (error) {
      if (error && error.name === 'AbortError') setStatus('Sharing was cancelled. Your certificate is unchanged.');
      else setStatus(error.message || 'Sharing is unavailable in this browser. Download the image instead.');
    } finally { shareButton.disabled = false; }
  });
  printButton.addEventListener('click', () => window.print());
})();
