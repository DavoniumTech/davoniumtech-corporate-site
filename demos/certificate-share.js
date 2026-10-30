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
    ['market', '02', 'DVNM Market', 'Commerce and product discovery'],
    ['creative', '03', 'DVNM Creative', 'Portfolio storytelling and motion'],
    ['skills', '04', 'DVNM Skills', 'Learning and guided practice'],
    ['digital', '05', 'DVNM Digital', 'Technology and digital products']
  ];
  const selected = () => demoSelect.value;
  const selectedItems = () => selected() === 'all' ? allSamples : allSamples.filter(item => item[0] === selected());
  function updatePreview() {
    const name = String(nameInput.value || '').trim().slice(0, 64) || 'A Digital Explorer';
    recipient.textContent = name;
    if (descriptionDetail) {
      descriptionDetail.textContent = selected() === 'all'
        ? 'explored all five original Davonium Technologies sample experiences and their design directions.'
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
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (_) {} }
    const canvas = document.createElement('canvas'); canvas.width = 2400; canvas.height = 1600;
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Your browser cannot create the certificate image.');
    const logo = await loadImage('../assets/images/davonium-d-icon.webp');
    const qr = await loadImage('../assets/images/qr-dvnm-demo-studio.png');
    const bg = ctx.createLinearGradient(0, 0, 2400, 1600);
    bg.addColorStop(0, '#050d18'); bg.addColorStop(.56, '#0a1c31'); bg.addColorStop(1, '#11172b');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Quiet star points and a fine geometric signal motif.
    for (let i = 0; i < 145; i++) {
      const x = (i * 173 + 91) % 2360 + 20, y = (i * 293 + 63) % 1560 + 20;
      const radius = i % 11 === 0 ? 3.0 : (i % 4 === 0 ? 1.8 : 1.1);
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fillStyle = i % 3 === 0 ? 'rgba(134,239,255,.68)' : 'rgba(220,249,255,.42)'; ctx.fill();
    }
    ctx.save(); ctx.globalAlpha = .16; ctx.strokeStyle = '#48d7ef'; ctx.lineWidth = 3;
    for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(2205, 210, 115 + i * 42, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    // Two-level frame and a restrained luminous signature line.
    ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(99,223,239,.75)'; roundedRect(ctx, 34, 34, 2332, 1532, 30); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(205,236,247,.32)'; roundedRect(ctx, 59, 59, 2282, 1482, 22); ctx.stroke();
    const edge = ctx.createLinearGradient(180, 0, 2220, 0); edge.addColorStop(0, '#2bc8dc'); edge.addColorStop(.5, '#8d8bff'); edge.addColorStop(1, '#e5bd81');
    ctx.fillStyle = edge; roundedRect(ctx, 190, 292, 2020, 5, 3); ctx.fill();
    if (logo) ctx.drawImage(logo, 170, 105, 126, 126);
    ctx.textAlign = 'left'; ctx.fillStyle = '#f4fbff'; ctx.font = '800 40px Manrope, Arial, sans-serif'; ctx.fillText('DAVONIUM TECHNOLOGIES', 330, 157);
    ctx.fillStyle = '#89a8bc'; ctx.font = '700 20px Manrope, Arial, sans-serif'; ctx.letterSpacing = '3px'; ctx.fillText('USEFUL TECHNOLOGY, BUILT WITH CARE', 332, 202); ctx.letterSpacing = '0px';
    ctx.textAlign = 'center'; ctx.fillStyle = '#66e6f4'; ctx.font = '800 23px Manrope, Arial, sans-serif'; ctx.letterSpacing = '5px'; ctx.fillText('DAVONIUM DEMO STUDIO  /  EXPERIENCE RECORD', 1200, 385); ctx.letterSpacing = '0px';
    ctx.fillStyle = '#f3f8ff'; ctx.font = '800 100px Manrope, Arial, sans-serif'; ctx.fillText('Showcase Certificate', 1200, 525);
    ctx.fillStyle = '#a7bdcb'; ctx.font = '500 30px Manrope, Arial, sans-serif'; ctx.fillText('Prepared as a record of exploration for', 1200, 610);
    const displayName = String(nameInput.value || '').trim().slice(0, 64) || 'A Digital Explorer';
    ctx.fillStyle = '#85eff8'; ctx.font = `800 ${displayName.length > 28 ? 48 : 66}px Manrope, Arial, sans-serif`; ctx.fillText(displayName, 1200, 710, 1850);
    ctx.fillStyle = '#c0d0dc'; ctx.font = '500 27px Manrope, Arial, sans-serif';
    const selectedDescription = selected() === 'all' ? 'explored all five original Davonium Technologies digital experiences.' : `explored the ${allSamples.find(item => item[0] === selected())?.[2] || 'selected'} Davonium digital experience.`;
    ctx.fillText(selectedDescription, 1200, 775, 1900);
    const chosen = selectedItems();
    ctx.textAlign = 'left'; ctx.fillStyle = '#76e3f0'; ctx.font = '800 19px Manrope, Arial, sans-serif'; ctx.letterSpacing = '3px'; ctx.fillText(selected() === 'all' ? 'FIVE CORE EXPERIENCES' : 'SELECTED EXPERIENCE', 215, 865); ctx.letterSpacing = '0px';
    chosen.forEach((item, index) => {
      const col = index % 2; const row = Math.floor(index / 2); const x = 205 + col * 710; const y0 = 905 + row * 112;
      ctx.fillStyle = 'rgba(240,250,255,.07)'; ctx.strokeStyle = 'rgba(134,216,232,.38)'; ctx.lineWidth = 2; roundedRect(ctx, x, y0, 650, 82, 16); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#45d9e9'; roundedRect(ctx, x + 17, y0 + 16, 48, 48, 12); ctx.fill();
      ctx.textAlign = 'center'; ctx.fillStyle = '#06202e'; ctx.font = '800 19px Manrope, Arial, sans-serif'; ctx.fillText(item[1], x + 41, y0 + 46);
      ctx.textAlign = 'left'; ctx.fillStyle = '#f2f8fc'; ctx.font = '800 25px Manrope, Arial, sans-serif'; ctx.fillText(item[2], x + 86, y0 + 35);
      ctx.fillStyle = '#a7bdcc'; ctx.font = '500 17px Manrope, Arial, sans-serif'; ctx.fillText(item[3], x + 86, y0 + 61, 525);
    });
    if (qr) {
      ctx.fillStyle = 'rgba(255,255,255,.96)'; ctx.strokeStyle = 'rgba(121,222,237,.54)'; ctx.lineWidth = 2; roundedRect(ctx, 1748, 895, 385, 385, 18); ctx.fill(); ctx.stroke();
      ctx.drawImage(qr, 1773, 920, 335, 335); ctx.textAlign = 'center'; ctx.fillStyle = '#d7f8ff'; ctx.font = '800 17px Manrope, Arial, sans-serif'; ctx.fillText('SCAN TO EXPLORE THE DEMO STUDIO', 1940, 1315);
    }
    ctx.strokeStyle = 'rgba(164,215,229,.32)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(190, 1390); ctx.lineTo(2210, 1390); ctx.stroke();
    ctx.textAlign = 'left'; ctx.fillStyle = '#f0f7fc'; ctx.font = '800 23px Manrope, Arial, sans-serif'; ctx.fillText('Davonium Technologies', 205, 1450);
    ctx.fillStyle = '#9bb3c2'; ctx.font = '500 17px Manrope, Arial, sans-serif'; ctx.fillText('Company showcase · Sample digital experiences', 205, 1483);
    ctx.fillStyle = '#e3f5fa'; ctx.font = '700 19px Manrope, Arial, sans-serif'; ctx.fillText(dateLabel.textContent, 1020, 1450);
    ctx.fillStyle = '#9bb3c2'; ctx.font = '500 17px Manrope, Arial, sans-serif'; ctx.fillText('Date prepared in this browser', 1020, 1483);
    ctx.textAlign = 'right'; ctx.fillStyle = '#9feef5'; ctx.font = '800 19px monospace'; ctx.fillText(serial, 2195, 1450);
    ctx.textAlign = 'center'; ctx.fillStyle = '#9db1c0'; ctx.font = '600 15px Manrope, Arial, sans-serif';
    wrapText(ctx, 'NON-OFFICIAL SHOWCASE RECORD. NOT AN ACCREDITED CERTIFICATE, ACADEMIC AWARD, PROFESSIONAL QUALIFICATION, OR VERIFICATION OF CUSTOMER WORK.', 1200, 1532, 1970, 20, 2);
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
