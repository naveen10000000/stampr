/* Stampr — PDF to Excel */
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

    const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Generate Excel (.xlsx)';
    btn.onclick = async ()=>{
      if(!checkLib('pdf.js', window.pdfjsLib, status) || !checkLib('SheetJS', window.XLSX, status)) return;
      if(!file){setStatus(status,'Choose a PDF file first.',true);return;}
      btn.disabled=true; setStatus(status,'Extracting data…');
      try{
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data:buf}).promise;
        const rows = [];
        for(let i=1;i<=pdf.numPages;i++){
          setStatus(status, `Page ${i}/${pdf.numPages}…`);
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          let lastY=null, cells=[];
          content.items.forEach(item=>{
            if(lastY!==null && Math.abs(item.transform[5]-lastY) > 4){
              rows.push(cells); cells=[];
            }
            const txt = item.str.trim();
            if(txt) cells.push(txt);
            lastY = item.transform[5];
          });
          if(cells.length) rows.push(cells);
        }
        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'});
        const blob = new Blob([wbout], {type:'application/octet-stream'});
        downloadBlob(blob, (file.name.replace(/\.pdf$/i,'')||'data')+'.xlsx', result, status);
      }catch(e){ setStatus(status,'Error: '+e.message, true); }
      btn.disabled=false;
    };

    panel.append(dropEl, list, wrapActions(btn), status, result,
      noteEl('Each line of text in the PDF becomes a row, and its individual words or values become separate columns. Works best on PDFs with clean tables, like statements or lists.'));
  }

  document.addEventListener('DOMContentLoaded', build);
})();
