/* Stampr — Merge PDF */
(function(){
  const { PDFDocument } = window.PDFLib || {};

  function build(){
    const panel = document.getElementById('tool-app');
    if(!panel) return;
    let files = [];
    const list = document.createElement('ul'); list.className='filelist';
    const status = document.createElement('div'); status.className='status';
    const result = document.createElement('div'); result.className='result';

    function render(){
      list.innerHTML='';
      files.forEach((f,i)=>{
        const li=document.createElement('li');
        li.innerHTML = `<span class="fname">${i+1}. ${escapeHtml(f.name)}</span>
          <span class="order">
            <button data-a="up" aria-label="Move up">↑</button><button data-a="down" aria-label="Move down">↓</button><button data-a="rm" aria-label="Remove">✕</button>
          </span>`;
        li.querySelector('[data-a=up]').onclick=()=>{if(i>0){[files[i-1],files[i]]=[files[i],files[i-1]];render();}};
        li.querySelector('[data-a=down]').onclick=()=>{if(i<files.length-1){[files[i+1],files[i]]=[files[i],files[i+1]];render();}};
        li.querySelector('[data-a=rm]').onclick=()=>{files.splice(i,1);render();};
        list.appendChild(li);
      });
    }
    const dropEl = makeDrop('.pdf', true, fs=>{files=files.concat(fs.filter(f=>f.type==='application/pdf'||f.name.toLowerCase().endsWith('.pdf')));render();});

    const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Merge PDFs';
    btn.onclick = async ()=>{
      if(!checkLib('pdf-lib', window.PDFLib, status)) return;
      if(files.length<2){setStatus(status,'Choose at least 2 PDF files.',true);return;}
      btn.disabled=true; setStatus(status,'Merging…');
      try{
        const merged = await PDFDocument.create();
        for(const f of files){
          const bytes = await f.arrayBuffer();
          const src = await PDFDocument.load(bytes, {ignoreEncryption:true});
          const pages = await merged.copyPages(src, src.getPageIndices());
          pages.forEach(p=>merged.addPage(p));
        }
        const outBytes = await merged.save();
        downloadBlob(new Blob([outBytes],{type:'application/pdf'}), 'merged.pdf', result, status);
      }catch(e){ setStatus(status,'Error: '+e.message, true); }
      btn.disabled=false;
    };

    panel.append(dropEl, list, wrapActions(btn), status, result,
      noteEl('Reorder files with the arrows above — that order is used in the final PDF.'));
  }

  document.addEventListener('DOMContentLoaded', build);
})();
