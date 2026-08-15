/* Stampr — Compress PDF */
(function(){
  const { PDFDocument } = window.PDFLib || {};

  function build(){
    const panel = document.getElementById('tool-app');
    if(!panel) return;
    let file=null;
    const list = document.createElement('ul'); list.className='filelist';
    const status = document.createElement('div'); status.className='status';
    const result = document.createElement('div'); result.className='result';

    const dropEl = makeDrop('.pdf', false, fs=>{
      if(fs[0]){ file=fs[0]; list.innerHTML=`<li><span class="fname">${escapeHtml(file.name)}</span><span>${fmtSize(file.size)}</span></li>`; }
    });

    const opts = document.createElement('div'); opts.className='opts';
    opts.innerHTML = `<div class="opt"><label>Quality</label>
      <select id="cq"><option value="0.4">High compression (smaller size)</option>
      <option value="0.65" selected>Balanced</option>
      <option value="0.85">Best quality (larger size)</option></select></div>`;

    const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Compress PDF';
    btn.onclick = async ()=>{
      if(!checkLib('pdf.js', window.pdfjsLib, status) || !checkLib('pdf-lib', window.PDFLib, status)) return;
      if(!file){setStatus(status,'Choose a PDF file first.',true);return;}
      btn.disabled=true; setStatus(status,'Compressing… this may take a moment');
      try{
        const quality = parseFloat(opts.querySelector('#cq').value);
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data:buf}).promise;
        const outDoc = await PDFDocument.create();
        for(let i=1;i<=pdf.numPages;i++){
          setStatus(status, `Processing page ${i}/${pdf.numPages}…`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({scale:1.5});
          const canvas = document.createElement('canvas');
          canvas.width=viewport.width; canvas.height=viewport.height;
          await page.render({canvasContext:canvas.getContext('2d'), viewport}).promise;
          const jpegUrl = canvas.toDataURL('image/jpeg', quality);
          const jpegBytes = await (await fetch(jpegUrl)).arrayBuffer();
          const img = await outDoc.embedJpg(jpegBytes);
          const pg = outDoc.addPage([viewport.width, viewport.height]);
          pg.drawImage(img, {x:0,y:0,width:viewport.width,height:viewport.height});
        }
        const outBytes = await outDoc.save();
        const origKB = file.size, newKB = outBytes.byteLength;
        downloadBlob(new Blob([outBytes],{type:'application/pdf'}), 'compressed.pdf', result, status);
        setStatus(status, `${fmtSize(origKB)} → ${fmtSize(newKB)}`);
      }catch(e){ setStatus(status,'Error: '+e.message, true); }
      btn.disabled=false;
    };

    panel.append(dropEl, list, opts, wrapActions(btn), status, result,
      noteEl('This method renders each page as an image and rebuilds the PDF — great for shrinking scanned or photo-based PDFs. Text-heavy PDFs will lose selectable text, since pages become images.'));
  }

  document.addEventListener('DOMContentLoaded', build);
})();
