/* Stampr — HEIC to JPG/PNG/PDF */
(function(){
  const { PDFDocument } = window.PDFLib || {};

  function build(){
    const panel = document.getElementById('tool-app');
    if(!panel) return;
    let files=[];
    const list = document.createElement('ul'); list.className='filelist';
    const status = document.createElement('div'); status.className='status';
    const result = document.createElement('div'); result.className='result';

    const dropEl = makeDrop('.heic,.heif', true, fs=>{files=files.concat(fs); list.innerHTML=files.map(f=>`<li><span class="fname">${escapeHtml(f.name)}</span><span>${fmtSize(f.size)}</span></li>`).join('');});

    const opts = document.createElement('div'); opts.className='opts';
    opts.innerHTML = `<div class="opt"><label>Convert to</label>
      <select id="hf"><option value="jpeg">JPG</option><option value="png">PNG</option><option value="pdf">PDF (single combined file)</option></select></div>`;

    const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Convert';
    btn.onclick = async ()=>{
      if(!checkLib('heic2any', window.heic2any, status)) return;
      if(files.length===0){setStatus(status,'Choose at least 1 HEIC file.',true);return;}
      btn.disabled=true; setStatus(status,'Converting…');
      try{
        const target = opts.querySelector('#hf').value;
        const outMime = target==='png' ? 'image/png' : 'image/jpeg';
        const converted = [];
        for(const f of files){
          setStatus(status, `Converting ${f.name}…`);
          const outBlob = await heic2any({blob:f, toType:outMime, quality:0.9});
          converted.push({name:f.name.replace(/\.(heic|heif)$/i,''), blob: Array.isArray(outBlob)?outBlob[0]:outBlob});
        }
        if(target==='pdf'){
          if(!checkLib('pdf-lib', window.PDFLib, status)) return;
          const doc = await PDFDocument.create();
          for(const c of converted){
            const bytes = await c.blob.arrayBuffer();
            const img = outMime==='image/png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
            const pg = doc.addPage([img.width, img.height]);
            pg.drawImage(img, {x:0,y:0,width:img.width,height:img.height});
          }
          const outBytes = await doc.save();
          downloadBlob(new Blob([outBytes],{type:'application/pdf'}), 'converted.pdf', result, status);
        } else if(converted.length===1){
          downloadBlob(converted[0].blob, converted[0].name+'.'+(target==='png'?'png':'jpg'), result, status);
        } else {
          if(!checkLib('JSZip', window.JSZip, status)) return;
          const zip = new JSZip();
          for(const c of converted){
            const buf = await c.blob.arrayBuffer();
            zip.file(c.name+'.'+(target==='png'?'png':'jpg'), buf);
          }
          const blob = await zip.generateAsync({type:'blob'});
          downloadBlob(blob, 'converted-images.zip', result, status);
        }
      }catch(e){ setStatus(status,'Error: '+e.message+' — some browsers have limited HEIC decode support.', true); }
      btn.disabled=false;
    };

    panel.append(dropEl, list, opts, wrapActions(btn), status, result,
      noteEl('Converts .heic/.heif photos from your iPhone into JPG, PNG, or PDF, right on this device.'));
  }

  document.addEventListener('DOMContentLoaded', build);
})();
