/* Stampr — Image (JPG/PNG) to PDF */
(function(){
  const { PDFDocument } = window.PDFLib || {};

  function build(){
    const panel = document.getElementById('tool-app');
    if(!panel) return;
    let files=[];
    const list = document.createElement('ul'); list.className='filelist';
    const status = document.createElement('div'); status.className='status';
    const result = document.createElement('div'); result.className='result';

    function render(){
      list.innerHTML='';
      files.forEach((f,i)=>{
        const li=document.createElement('li');
        li.innerHTML = `<span class="fname">${i+1}. ${escapeHtml(f.name)}</span><span class="order"><button data-a="up" aria-label="Move up">↑</button><button data-a="down" aria-label="Move down">↓</button><button data-a="rm" aria-label="Remove">✕</button></span>`;
        li.querySelector('[data-a=up]').onclick=()=>{if(i>0){[files[i-1],files[i]]=[files[i],files[i-1]];render();}};
        li.querySelector('[data-a=down]').onclick=()=>{if(i<files.length-1){[files[i+1],files[i]]=[files[i],files[i+1]];render();}};
        li.querySelector('[data-a=rm]').onclick=()=>{files.splice(i,1);render();};
        list.appendChild(li);
      });
    }
    const dropEl = makeDrop('.jpg,.jpeg,.png', true, fs=>{files=files.concat(fs);render();});

    const btn=document.createElement('button'); btn.className='btn'; btn.textContent='Create PDF';
    btn.onclick=async ()=>{
      if(!checkLib('pdf-lib', window.PDFLib, status)) return;
      if(files.length===0){setStatus(status,'Choose at least 1 image.',true);return;}
      btn.disabled=true; setStatus(status,'Building PDF…');
      try{
        const doc = await PDFDocument.create();
        for(const f of files){
          const bytes = await f.arrayBuffer();
          let img;
          if(f.type.includes('png')) img = await doc.embedPng(bytes);
          else img = await doc.embedJpg(bytes);
          const pg = doc.addPage([img.width, img.height]);
          pg.drawImage(img, {x:0,y:0,width:img.width,height:img.height});
        }
        const outBytes = await doc.save();
        downloadBlob(new Blob([outBytes],{type:'application/pdf'}), 'images.pdf', result, status);
      }catch(e){ setStatus(status,'Error: '+e.message+' (only JPG/PNG supported — convert WEBP to JPG first)', true); }
      btn.disabled=false;
    };

    panel.append(dropEl, list, wrapActions(btn), status, result,
      noteEl('Each image becomes a new page, in the same order shown in the list.'));
  }

  document.addEventListener('DOMContentLoaded', build);
})();
