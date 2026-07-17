/* Form actions are explicit buttons so they remain dependable on touch and desktop. */
document.addEventListener('DOMContentLoaded',()=>{
  Farm.init();
  const modal=document.querySelector('#plant-modal'),form=document.querySelector('#task-form'),input=document.querySelector('#task-name'),noteInput=document.querySelector('#task-note'),farm=document.querySelector('#farm'),shovel=document.querySelector('#shovel-trigger'),empty=document.querySelector('#empty-state'),toast=document.querySelector('#toast'),priority=document.querySelector('#priority-value'),plantButton=document.querySelector('#plant-button'),journal=document.querySelector('#harvest-journal'),journalTrigger=document.querySelector('#harvest-journal-trigger'),harvestList=document.querySelector('#harvest-list'),noHarvests=document.querySelector('#no-harvests');
  const harvestRecords=[];let harvestFilter='all';const saveKey='veggie-do-farm-v1';
  function saveFarm(){try{localStorage.setItem(saveKey,JSON.stringify({vegetables:Farm.tasks.map(item=>({name:item.name,priority:item.priority,note:item.note,x:item.x,y:item.y})),harvests:harvestRecords}))}catch(error){}}
  function restoreFarm(){try{const saved=JSON.parse(localStorage.getItem(saveKey)||'null');if(!saved)return;(saved.harvests||[]).forEach(item=>harvestRecords.push(item));(saved.vegetables||[]).forEach(item=>{const t=Farm.makeTask(item.name,item.priority,item.note||'');t.el.querySelector('.sign').dataset.note=item.note||item.name;t.x=item.x;t.y=item.y;t.el.style.left=t.x+'vw';t.el.style.top=t.y+'vh'});if((saved.vegetables||[]).length)empty.classList.add('gone');Farm.setHarvestCount(harvestRecords.length)}catch(error){localStorage.removeItem(saveKey)}}
  const aboutModal=document.querySelector('#about-modal');aboutModal.classList.remove('hidden');
  const close=()=>modal.classList.add('hidden');
  document.querySelector('#plant-trigger').onclick=()=>{FarmAudio.pop();modal.classList.remove('hidden');setTimeout(()=>input.focus(),120)};
  document.querySelector('#about-trigger').onclick=()=>{FarmAudio.pop();aboutModal.classList.remove('hidden')};
  const closeAbout=()=>aboutModal.classList.add('hidden');
  document.querySelector('#about-ok').onclick=closeAbout;aboutModal.onclick=e=>e.target===aboutModal&&closeAbout();
  journalTrigger.onclick=()=>{const open=journal.classList.toggle('hidden');journalTrigger.setAttribute('aria-expanded',String(!open));};
  document.addEventListener('click',event=>{if(!journal.classList.contains('hidden')&&!journal.contains(event.target)&&!journalTrigger.contains(event.target)){journal.classList.add('hidden');journalTrigger.setAttribute('aria-expanded','false')}});
  function renderHarvests(){const visible=harvestFilter==='all'?harvestRecords:harvestRecords.filter(task=>task.priority===harvestFilter);harvestList.innerHTML='';visible.forEach(task=>{const item=document.createElement('li'),label=task.priority==='medium'?'Kinda urgent':task.priority[0].toUpperCase()+task.priority.slice(1),note=task.note?`<span class="harvest-note">${task.note}</span>`:'';item.innerHTML=`<span class="harvest-icon ${task.priority}">✓</span><span class="harvest-copy"><strong>${task.name}</strong>${note}</span><small>${label}</small>`;harvestList.append(item)});noHarvests.hidden=harvestRecords.length>0;document.querySelector('#all-count').textContent=harvestRecords.length;['urgent','medium','chill'].forEach(kind=>document.querySelector(`#${kind}-count`).textContent=harvestRecords.filter(task=>task.priority===kind).length)}
  restoreFarm();renderHarvests();
  document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{harvestFilter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(choice=>choice.classList.toggle('active',choice===button));renderHarvests()});
  modal.onclick=e=>e.target===modal&&close();
  document.querySelectorAll('[data-priority]').forEach(button=>button.onclick=()=>{
    priority.value=button.dataset.priority;
    document.querySelectorAll('[data-priority]').forEach(choice=>{const selected=choice===button;choice.classList.toggle('selected',selected);choice.setAttribute('aria-pressed',String(selected))});
  });
  let planting=false;
  function plant(){
    if(planting)return;
    const name=input.value.trim();
    if(!name){input.focus();show('Give your little seed a task name first!');return;}
    planting=true;plantButton.disabled=true;
    const p=priority.value,note=noteInput.value.trim(),x=18+Math.random()*65;
    try{FarmAudio.plant()}catch(error){/* Sound is optional; planting should always continue. */}
    const seed=document.createElement('i');seed.className='seed';seed.style.left=x+'vw';seed.style.top='36vh';farm.append(seed);
    setTimeout(()=>{const t=Farm.makeTask(name,p,note);t.el.querySelector('.sign').dataset.note=note||name;t.x=x;t.y=48+Math.random()*16;Farm.burst(t.x+4,t.y+5);seed.remove();saveFarm()},510);
    form.reset();priority.value='urgent';document.querySelectorAll('[data-priority]').forEach(choice=>{const selected=choice.dataset.priority==='urgent';choice.classList.toggle('selected',selected);choice.setAttribute('aria-pressed',String(selected))});close();empty.classList.add('gone');show('A tiny helper has sprouted!');setTimeout(()=>{planting=false;plantButton.disabled=false},650);
  }
  plantButton.onclick=plant;
  form.onsubmit=e=>{e.preventDefault();plant()};
  shovel.onclick=()=>{const on=Farm.toggleShovel();shovel.classList.toggle('active',on);farm.classList.toggle('shovel-mode',on);show(on?'Shovel ready — pick a task to harvest!':'Shovel tucked away.')};
  document.addEventListener('farm:update',event=>{harvestRecords.unshift(event.detail);saveFarm();renderHarvests();show('Lovely work! The farm feels happier.');if(!Farm.tasks.length)empty.classList.remove('gone')});
  document.querySelector('#reset-farm').onclick=()=>{if(!confirm('Start a fresh farm day? This clears the vegetables and harvest journal saved in this browser.'))return;localStorage.removeItem(saveKey);window.location.reload()};
  document.querySelectorAll('button').forEach(b=>b.addEventListener('mouseenter',()=>FarmAudio.hover()));
  let timer;function show(message){toast.textContent=message;toast.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),2200)}
});
