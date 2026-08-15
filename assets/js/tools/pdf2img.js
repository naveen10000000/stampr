/* Stampr — PDF to JPG/PNG */
(function(){
  function build(){
    const panel = document.getElementById('tool-app');
    if(!panel) return;
    let file=null;
    const list = document.createElement('ul'); list.className='filelist';
    const status = document.createElement('div'); status.className='status';
    const result = document.createElement('div'); result.className='result';

    const dropEl = makeDrop('.pdf', false, fs=>{
      if(fs[0]){file=fs[0]; list.innerHTML=`<li><span class="fname">${escapeHtml(file.name)}</span><span>${fmtSize(file.size)}</span></li>`;}
    });

    const opts = document.createElement('div'); opts.className='opts';
    opts.innerHTML = `<div class="opt"><label>Format</label>
        <select id="pf"><option value="jpeg">JPG</option><option value="png">PNG</option></select></div>
      <div class="opt"><label>Resolution</label>
        <select id="ps"><option value="1">Standard</option><option value="2" selected>High</option><option value="3">Very High</option></select></div>`;

    const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Export Images';
    btn.onclick = async ()=>{
      if(!checkLib('pdf.js', window.pdfjsLib, status) || !checkLib('JSZip', window.JSZip, status)) return;
      if(!file){setStatus(status,'Choose a PDF file first.',true);return;}
      btn.disabled=true; setStatus(status,'Rendering pages…');
      try{
        const fmt = opts.querySelector('#pf').value;
        const scale = parseFloat(opts.querySelector('#ps').value);
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data:buf}).promise;
        const zip = new JSZip();
        for(let i=1;i<=pdf.numPages;i++){
          setStatus(status, `Page ${i}/${pdf.numPages}…`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({scale});
          const canvas=document.createElement('canvas');
          canvas.width=viewport.width; canvas.height=viewport.height;
          await page.render({canvasContext:canvas.getContext('2d'), viewport}).promise;
          const mime = fmt==='png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(mime, 0.92);
          const b64 = dataUrl.split(',')[1];
          zip.file(`page-${String(i).padStart(2,'0')}.${fmt==='png'?'png':'jpg'}`, b64, {base64:true});
        }
        const blob = await zip.generateAsync({type:'blob'});
        downloadBlob(blob, 'pages.zip', result, status);
      }catch(e){ setStatus(status,'Error: '+e.message, true); }
      btn.disabled=false;
    };

    panel.append(dropEl, list, opts, wrapActions(btn), status, result,
      noteEl('All pages are delivered in a single .zip file — extract the images from it.'));
  }

  document.addEventListener('DOMContentLoaded', build);
})();
