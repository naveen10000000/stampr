/* Stampr — PDF to Word */
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

    const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Generate Word (.docx)';
    btn.onclick = async ()=>{
      if(!checkLib('pdf.js', window.pdfjsLib, status) || !checkLib('docx', window.docx, status)) return;
      if(!file){setStatus(status,'Choose a PDF file first.',true);return;}
      btn.disabled=true; setStatus(status,'Extracting text…');
      try{
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data:buf}).promise;
        const { Document, Packer, Paragraph, TextRun } = window.docx;
        const children = [];
        for(let i=1;i<=pdf.numPages;i++){
          setStatus(status, `Page ${i}/${pdf.numPages}…`);
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          let lastY=null, line='';
          content.items.forEach(item=>{
            if(lastY!==null && Math.abs(item.transform[5]-lastY) > 4){
              children.push(new Paragraph({children:[new TextRun(line)]}));
              line='';
            }
            line += item.str + (item.hasEOL?'':' ');
            lastY = item.transform[5];
          });
          if(line.trim()) children.push(new Paragraph({children:[new TextRun(line)]}));
          if(i<pdf.numPages) children.push(new Paragraph({children:[new TextRun('')], pageBreakBefore:false}));
        }
        const doc = new Document({ sections:[{ properties:{}, children }] });
        const blob = await Packer.toBlob(doc);
        downloadBlob(blob, (file.name.replace(/\.pdf$/i,'')||'document')+'.docx', result, status);
      }catch(e){ setStatus(status,'Error: '+e.message, true); }
      btn.disabled=false;
    };

    panel.append(dropEl, list, wrapActions(btn), status, result,
      noteEl('This is a basic text extraction — paragraph-by-paragraph text is carried into Word, but original formatting, images, and complex tables won\u2019t match exactly.'));
  }

  document.addEventListener('DOMContentLoaded', build);
})();
