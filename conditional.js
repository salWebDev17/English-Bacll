function normalize(s){
  return s.trim().toLowerCase().replace(/\s+/g,' ').replace(/’/g,"'");
}
function checkInput(input){
  const accepted = input.dataset.ans.split('|').map(normalize);
  const val = normalize(input.value);
  const isCorrect = val.length > 0 && accepted.includes(val);
  input.classList.remove('correct','wrong');
  const existingFeedback = input.nextElementSibling;
  if(existingFeedback && existingFeedback.classList.contains('feedback-answer')) existingFeedback.remove();
  if(isCorrect){
    input.classList.add('correct');
  } else {
    input.classList.add('wrong');
    const fb = document.createElement('span');
    fb.className = 'feedback-answer';
    fb.textContent = '(' + input.dataset.ans.split('|')[0] + ')';
    input.insertAdjacentElement('afterend', fb);
  }
  return isCorrect;
}
// An exercise counts as correct only if ALL of its blanks are correct.
// Score is now out of 100 exercises, not out of total blanks.
function checkExercise(exerciseDiv){
  const inputs = exerciseDiv.querySelectorAll('.blank-input');
  let allCorrect = true;
  inputs.forEach(inp => { if(!checkInput(inp)) allCorrect = false; });
  let indicator = exerciseDiv.querySelector('.ex-indicator');
  if(!indicator){
    indicator = document.createElement('span');
    indicator.className = 'ex-indicator';
    exerciseDiv.appendChild(indicator);
  }
  indicator.textContent = allCorrect ? '✓ 1/1' : '✗ 0/1';
  indicator.style.color = allCorrect ? 'var(--correct)' : 'var(--wrong)';
  indicator.style.fontWeight = '700';
  indicator.style.marginLeft = '8px';
  indicator.style.whiteSpace = 'nowrap';
  return allCorrect;
}
function checkSection(sectionId){
  const exercises = document.querySelectorAll('#' + sectionId + ' .exercise');
  let correct = 0;
  exercises.forEach(ex => { if(checkExercise(ex)) correct++; });
  document.getElementById('score-' + sectionId).textContent =
    'Section score: ' + correct + ' / ' + exercises.length;
  updateLiveScore();
}
function checkAll(){
  ['sec0','sec1','sec2','sec3','secm'].forEach(id => checkSection(id));
  showFinal();
}
function countCorrectExercises(){
  const exercises = document.querySelectorAll('.exercise');
  let correct = 0;
  exercises.forEach(ex => {
    const indicator = ex.querySelector('.ex-indicator');
    if(indicator && indicator.textContent.startsWith('✓')) correct++;
  });
  return { correct, total: exercises.length };
}
function updateLiveScore(){
  const { correct } = countCorrectExercises();
  document.getElementById('liveScore').textContent = correct;
}
function showFinal(){
  const { correct, total } = countCorrectExercises();
  const box = document.getElementById('finalResult');
  box.style.display = 'block';
  document.getElementById('finalScore').textContent = correct;
  let msg;
  if(correct >= total * 0.9) msg = "Excellent work! You've mastered the conditionals. 🌟";
  else if(correct >= total * 0.7) msg = "Good job! Review the ones you missed and try again. 👍";
  else if(correct >= total * 0.5) msg = "Solid effort — go back over the sections where you lost points. 📘";
  else msg = "Keep practicing! Re-read the structure notes above each section, then try again. 💪";
  document.getElementById('finalMsg').textContent = msg;
  box.scrollIntoView({behavior:'smooth', block:'center'});
}
function revealAll(){
  document.querySelectorAll('.blank-input').forEach(inp => {
    inp.value = inp.dataset.ans.split('|')[0];
  });
  ['sec0','sec1','sec2','sec3','secm'].forEach(id => checkSection(id));
  showFinal();
}

function resetAll(){
  document.querySelectorAll('.blank-input').forEach(inp => {
    inp.value = '';
    inp.classList.remove('correct','wrong');
    const fb = inp.parentElement.querySelector('.feedback-answer');
    if(fb) fb.remove();
  });
  document.querySelectorAll('.ex-indicator').forEach(ind => ind.remove());
  document.querySelectorAll('.section-score').forEach(p => p.textContent = '');
  document.getElementById('liveScore').textContent = '0';
  document.getElementById('finalResult').style.display = 'none';
}

/* ===== Sound effects, study music, per-exercise checking ===== */
(function(){
const AC=window.AudioContext||window.webkitAudioContext;
let ctx,master,sfxBus,musBus,noiseBuf,sfxOn=true,vol=.4,timer=null,step=0,next=0,rain=null,quiet=0;
const $=id=>document.getElementById(id);
const hz=n=>440*Math.pow(2,(n-69)/12);
function ensure(){
  if(!AC) return false;
  if(!ctx){
    ctx=new AC(); master=ctx.createGain(); master.connect(ctx.destination);
    sfxBus=ctx.createGain(); sfxBus.gain.value=.6; sfxBus.connect(master);
    musBus=ctx.createGain(); musBus.gain.value=vol*.8; musBus.connect(master);
    const d=ctx.createDelay(1),fb=ctx.createGain(),wet=ctx.createGain();
    d.delayTime.value=.37; fb.gain.value=.35; wet.gain.value=.3;
    musBus.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(master);
    noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
    const c=noiseBuf.getChannelData(0); for(let i=0;i<c.length;i++) c[i]=Math.random()*2-1;
  }
  if(ctx.state==='suspended') ctx.resume();
  return true;
}
function tone(f,t,d,type,v,bus,o){
  o=o||{};
  const os=ctx.createOscillator(),g=ctx.createGain(); let out=g;
  os.type=type; os.frequency.setValueAtTime(f,t);
  if(o.to) os.frequency.exponentialRampToValueAtTime(o.to,t+d);
  if(o.vib){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=o.vib;lg.gain.value=o.vd||30;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+d+.1);}
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(v,t+(o.a||.01)); g.gain.exponentialRampToValueAtTime(.0001,t+d);
  if(o.lp){const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;g.connect(fl);out=fl;}
  os.connect(g); out.connect(bus); os.start(t); os.stop(t+d+.1);
}
function noise(t,d,v,type,fr,bus){
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  s.buffer=noiseBuf; f.type=type; f.frequency.value=fr;
  g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+d);
  s.connect(f); f.connect(g); g.connect(bus); s.start(t); s.stop(t+d+.05);
}
const T=()=>ctx.currentTime;
const S={
  good:[
    ()=>tone(220,T(),.45,'sine',.5,sfxBus,{to:600,vib:22,vd:60}),                       // boing!
    ()=>{const t=T();[784,988,1319].forEach((f,i)=>tone(f,t+i*.08,.18,'triangle',.35,sfxBus));}, // coin
    ()=>tone(300,T(),.4,'sine',.35,sfxBus,{to:2000,vib:8,vd:80}),                       // slide whistle up
    ()=>{const t=T();tone(900,t,.07,'square',.18,sfxBus,{to:300,lp:2000});tone(1400,t+.08,.12,'sine',.3,sfxBus);} // bloop-pop
  ],
  bad:[
    ()=>{let t=T();[[233,.28],[220,.28],[208,.28],[196,.8]].forEach((n,i)=>{tone(n[0],t,n[1],'sawtooth',.3,sfxBus,{lp:700,vib:i==3?6:0,vd:8});t+=n[1]+.04;});}, // womp womp
    ()=>{const t=T();tone(520,t,.15,'sawtooth',.25,sfxBus,{to:300,lp:1500});tone(480,t+.2,.2,'sawtooth',.25,sfxBus,{to:250,lp:1500});}, // quack quack
    ()=>tone(900,T(),.55,'triangle',.35,sfxBus,{to:90})                                  // slide down
  ],
  fanfare:[()=>{const t=T();[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,t+i*.1,.25,'square',.2,sfxBus,{lp:3000}));
    [523,659,784,1047].forEach(f=>tone(f,t+.7,.9,'triangle',.3,sfxBus)); noise(t+.7,.6,.15,'bandpass',2500,sfxBus);}],
  peek:[()=>{const t=T();tone(400,t,.15,'sine',.3,sfxBus,{to:800});tone(800,t+.15,.25,'sine',.3,sfxBus,{to:300});}],
  whoosh:[()=>tone(1200,T(),.3,'sawtooth',.12,sfxBus,{to:150,lp:2500})]
};
function sfx(n){ if(!sfxOn||!ensure()) return; const a=S[n]; a[Math.random()*a.length|0](); }

/* Study music: generated live, so nothing to download and it works offline */
const CH=[[60,64,67,71],[57,60,64,67],[62,65,69,72],[55,59,62,65]],BS=[36,33,38,31],PE=[72,74,76,79,81,84];
const M={
  lofi:{spb:.4167,f(s,t){
    const b=s%8,bar=(s>>3)%4;
    if(b===0||b===5) CH[bar].forEach(n=>{tone(hz(n),t,1.4,'triangle',b?.05:.08,musBus,{a:.02,lp:1400});tone(hz(n),t,1.4,'sine',.04,musBus);});
    if(b===0||b===6) tone(hz(BS[bar]),t,.7,'sine',.22,musBus,{lp:300});
    if(b===0||b===5) tone(120,t,.18,'sine',.5,musBus,{to:40});
    if(b===2||b===6) noise(t,.14,.1,'bandpass',1800,musBus);
    noise(t+(s%2?.04:0),.04,.04,'highpass',7000,musBus);
    if(b%2===0&&Math.random()<.35) tone(hz(PE[Math.random()*6|0]),t,.6,'triangle',.06,musBus,{lp:2200});
  }},
  piano:{spb:.55,f(s,t){
    const b=s%8,bar=(s>>3)%4,n=CH[bar][[0,1,2,3,2,1,3,2][b]];
    tone(hz(n),t,2.2,'sine',.14,musBus,{a:.005}); tone(hz(n)*2,t,1,'sine',.04,musBus);
    if(b===0) tone(hz(BS[bar]+12),t,3,'sine',.12,musBus,{a:.1});
    if(Math.random()<.12) tone(hz(PE[Math.random()*6|0]),t+.2,1.5,'sine',.06,musBus);
  }}
};
function stopMusic(){
  clearInterval(timer); timer=null;
  if(rain){rain.forEach(n=>{try{n.stop();}catch(e){}}); rain=null;}
}
function startMusic(k){
  stopMusic(); $('audioBtn').classList.toggle('playing',!!k);
  if(!k||!ensure()) return;
  musBus.gain.setTargetAtTime(vol*.8,T(),.05);
  if(k==='rain'){
    const mk=(type,fr,v)=>{const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
      s.buffer=noiseBuf;s.loop=true;f.type=type;f.frequency.value=fr;g.gain.value=v;s.connect(f);f.connect(g);g.connect(musBus);s.start();return s;};
    rain=[mk('lowpass',1200,.35),mk('highpass',3500,.08)];
    timer=setInterval(()=>{if(Math.random()<.5) tone(hz(PE[Math.random()*6|0]-12),T(),2.5,'sine',.07,musBus,{a:.3});},2500);
    return;
  }
  const m=M[k]; step=0; next=T()+.1;
  timer=setInterval(()=>{while(next<T()+.6){m.f(step++,next);next+=m.spb;}},150);
}

/* Per-exercise, per-section and check-all feedback */
const _ce=checkExercise,_cs=checkSection,_ca=checkAll,_ra=revealAll,_rs=resetAll;
function shake(ex){ex.classList.remove('shake');void ex.offsetWidth;ex.classList.add('shake');}
function verdict(list){
  let ok=0; list.forEach(e=>{const i=e.querySelector('.ex-indicator'); if(i&&i.textContent.startsWith('✓')) ok++;});
  const r=ok/list.length; sfx(r>=.999?'fanfare':r>=.5?'good':'bad');
}
checkExercise=function(ex){
  const ok=_ce(ex); updateLiveScore();
  if(!quiet){ if(ok) sfx('good'); else {sfx('bad'); shake(ex);} }
  return ok;
};
checkSection=function(id){
  quiet++; try{_cs(id);}finally{quiet--;}
  if(!quiet) verdict(document.querySelectorAll('#'+id+' .exercise'));
};
checkAll=function(){
  quiet++; try{_ca();}finally{quiet--;}
  verdict(document.querySelectorAll('.exercise'));
};
revealAll=function(){ quiet++; try{_ra();}finally{quiet--;} sfx('peek'); };
resetAll=function(){ _rs(); sfx('whoosh'); };

/* Setup: Check button + mobile-friendly inputs on every exercise */
document.querySelectorAll('.exercise').forEach(ex=>{
  const num=ex.querySelector('.num').textContent.replace('.','');
  const btn=document.createElement('button');
  btn.type='button'; btn.className='ex-check'; btn.textContent='Check';
  btn.setAttribute('aria-label','Check exercise '+num);
  btn.onclick=()=>checkExercise(ex);
  ex.appendChild(btn);
  ex.querySelectorAll('.blank-input').forEach((inp,i,all)=>{
    inp.setAttribute('autocomplete','off'); inp.setAttribute('autocapitalize','none');
    inp.setAttribute('autocorrect','off'); inp.spellcheck=false;
    inp.setAttribute('aria-label','Exercise '+num+', answer '+(i+1));
    inp.setAttribute('enterkeyhint',all[i+1]?'next':'done');
    const L=inp.dataset.ans.split('|')[0].length; inp.style.width=Math.min(Math.max(L+3,9),28)+'ch';
    inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){e.preventDefault(); all[i+1]?all[i+1].focus():checkExercise(ex);} });
    inp.addEventListener('input',()=>{
      inp.classList.remove('correct','wrong');
      const fb=inp.nextElementSibling; if(fb&&fb.classList.contains('feedback-answer')) fb.remove();
      const ind=ex.querySelector('.ex-indicator'); if(ind){ind.remove(); updateLiveScore();}
    });
  });
});

/* Audio panel */
$('audioBtn').onclick=()=>{const p=$('audioPanel');p.hidden=!p.hidden;$('audioBtn').setAttribute('aria-expanded',String(!p.hidden));};
$('sfxToggle').onchange=e=>{sfxOn=e.target.checked; if(sfxOn) sfx('good');};
$('musicSel').onchange=e=>startMusic(e.target.value);
$('musicVol').oninput=e=>{vol=e.target.value/100; if(musBus) musBus.gain.setTargetAtTime(vol*.8,T(),.05);};
})();
