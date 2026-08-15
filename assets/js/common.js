/* Stampr — shared helpers, loaded on every page */

/* ---------- ambient floating particles (decorative only) ---------- */
(function(){
  const host = document.getElementById('bgBlobs');
  if(!host) return;
  const count = 10;
  for(let i=0;i<count;i++){
    const p = document.createElement('div');
    p.className='particle';
    const size = 3 + Math.random()*4;
    p.style.width = size+'px';
    p.style.height = size+'px';
    p.style.left = (Math.random()*100)+'vw';
    p.style.top = (30 + Math.random()*60)+'vh';
    const dur = 9 + Math.random()*10;
    p.style.animationDuration = dur+'s';
    p.style.animationDelay = (Math.random()*dur)+'s';
    host.appendChild(p);
  }
})();

/* ---------- pdf.js worker setup (only runs if pdf.js is loaded on this page) ---------- */
if (window['pdfjsLib']) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

/* ---------- mobile nav toggle ---------- */
(function(){
  const btn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if(!btn || !nav) return;
  btn.addEventListener('click', ()=>{
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

/* ---------- highlight the current page in the nav ---------- */
(function(){
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.site-nav a, .nav-tools .dropdown a').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === here) a.classList.add('active');
  });
})();

/* ---------- escaping helper (guards against filename / HTML injection) ---------- */
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

/* ---------- generic helpers used by every tool ---------- */
function fmtSize(b){
  if(b<1024) return b+' B';
  if(b<1024*1024) return (b/1024).toFixed(1)+' KB';
  return (b/1024/1024).toFixed(2)+' MB';
}

function makeDrop(accept, multiple, onFiles){
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="drop">
      <span class="dic">📄</span>
      <strong>Drop files here, or tap to browse</strong>
      <span>${escapeHtml(accept.replaceAll(',', ' / '))}</span>
      <input type="file" accept="${escapeHtml(accept)}" ${multiple?'multiple':''}>
    </div>`;
  const drop = wrap.querySelector('.drop');
  const input = wrap.querySelector('input');
  drop.onclick = ()=>input.click();
  input.onchange = ()=>onFiles(Array.from(input.files));
  ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev, e=>{e.preventDefault();drop.classList.add('dragover');}));
  ['dragleave','drop'].forEach(ev=>drop.addEventListener(ev, e=>{e.preventDefault();drop.classList.remove('dragover');}));
  drop.addEventListener('drop', e=>{
    const files = Array.from(e.dataTransfer.files);
    onFiles(files);
  });
  return wrap;
}

function downloadBlob(blob, filename, resultEl, statusEl){
  const url = URL.createObjectURL(blob);
  const safeName = escapeHtml(filename);
  resultEl.innerHTML = `<span class="stamp-done">READY ✓ ${fmtSize(blob.size)}</span>
    <a class="dl" href="${url}" download="${safeName}">Download ${safeName}</a>`;
  resultEl.classList.add('show');
  statusEl.textContent = '';
}

function setStatus(el, msg, isErr){
  el.textContent = msg||'';
  el.classList.toggle('err', !!isErr);
}

function checkLib(name, obj, statusEl){
  if(!obj){
    setStatus(statusEl, `⚠ Library "${name}" failed to load — check your connection and reload the page.`, true);
    return false;
  }
  return true;
}

function wrapActions(btn){
  const div=document.createElement('div'); div.className='actions'; div.appendChild(btn); return div;
}

function noteEl(txt){
  const d=document.createElement('div'); d.className='note'; d.textContent=txt; return d;
}
