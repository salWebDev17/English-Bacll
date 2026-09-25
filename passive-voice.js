  (function(){
    function detectDeviceName(){
      const ua = navigator.userAgent;
      let os = 'Unknown';
      if(/android/i.test(ua)) os = 'Android';
      else if(/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
      else if(/windows/i.test(ua)) os = 'Windows';
      else if(/mac os/i.test(ua)) os = 'macOS';
      else if(/linux/i.test(ua)) os = 'Linux';

      let browser = 'Browser';
      if(/vivo/i.test(ua)) browser = 'ViVo';
      else if(/samsung/i.test(ua)) browser = 'Samsung';
      else if(/edg/i.test(ua)) browser = 'Edge';
      else if(/chrome/i.test(ua)) browser = 'Chrome';
      else if(/firefox/i.test(ua)) browser = 'Firefox';
      else if(/safari/i.test(ua)) browser = 'Safari';

      return `${browser}-${os}`;
    }

    function saveEntry(ip){
      try{
        const page = location.pathname.split('/').pop().replace('.html','');
        const time = new Date().toLocaleString();
        const device = detectDeviceName();
        let entries = JSON.parse(localStorage.getItem('visitLog') || '[]');
        entries.push({ page: page, time: time, device: device, ip: ip });
        if(entries.length > 300) entries = entries.slice(-300);
        localStorage.setItem('visitLog', JSON.stringify(entries));
      }catch(e){}
    }

    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(data => saveEntry(data.ip))
      .catch(() => saveEntry('unknown'));
  })();

// ---------- vocabulary ----------
const VERBS = [
  {base:"clean", s:"cleans", past:"cleaned", pp:"cleaned", ing:"cleaning"},
  {base:"write", s:"writes", past:"wrote", pp:"written", ing:"writing"},
  {base:"build", s:"builds", past:"built", pp:"built", ing:"building"},
  {base:"cook", s:"cooks", past:"cooked", pp:"cooked", ing:"cooking"},
  {base:"paint", s:"paints", past:"painted", pp:"painted", ing:"painting"},
  {base:"teach", s:"teaches", past:"taught", pp:"taught", ing:"teaching"},
  {base:"deliver", s:"delivers", past:"delivered", pp:"delivered", ing:"delivering"},
  {base:"repair", s:"repairs", past:"repaired", pp:"repaired", ing:"repairing"},
  {base:"invite", s:"invites", past:"invited", pp:"invited", ing:"inviting"},
  {base:"catch", s:"catches", past:"caught", pp:"caught", ing:"catching"},
  {base:"feed", s:"feeds", past:"fed", pp:"fed", ing:"feeding"},
  {base:"wash", s:"washes", past:"washed", pp:"washed", ing:"washing"},
  {base:"send", s:"sends", past:"sent", pp:"sent", ing:"sending"},
  {base:"buy", s:"buys", past:"bought", pp:"bought", ing:"buying"},
  {base:"make", s:"makes", past:"made", pp:"made", ing:"making"},
  {base:"break", s:"breaks", past:"broke", pp:"broken", ing:"breaking"},
  {base:"plant", s:"plants", past:"planted", pp:"planted", ing:"planting"},
  {base:"sing", s:"sings", past:"sang", pp:"sung", ing:"singing"},
  {base:"drive", s:"drives", past:"drove", pp:"driven", ing:"driving"},
  {base:"read", s:"reads", past:"read", pp:"read", ing:"reading"}
];
const SUBJECTS = [
  {full:"The manager", by:"the manager", plural:false},
  {full:"The students", by:"the students", plural:true},
  {full:"She", by:"her", plural:false},
  {full:"The engineers", by:"the engineers", plural:true},
  {full:"Tom", by:"Tom", plural:false},
  {full:"The children", by:"the children", plural:true},
  {full:"The company", by:"the company", plural:false},
  {full:"They", by:"them", plural:true},
  {full:"The chef", by:"the chef", plural:false},
  {full:"My brother", by:"my brother", plural:false}
];
const OBJECTS = [
  {text:"the office", cap:"The office", plural:false},
  {text:"a new bridge", cap:"A new bridge", plural:false},
  {text:"a letter", cap:"A letter", plural:false},
  {text:"the cars", cap:"The cars", plural:true},
  {text:"dinner", cap:"Dinner", plural:false},
  {text:"the windows", cap:"The windows", plural:true},
  {text:"a song", cap:"A song", plural:false},
  {text:"the reports", cap:"The reports", plural:true},
  {text:"the house", cap:"The house", plural:false},
  {text:"the packages", cap:"The packages", plural:true}
];
const MODALS = ["can","must","should","may"];

// ---------- 10 tense builders ----------
const TENSE_BUILDERS = [
// 0 Present simple
(s,o,v,i)=>{
  const beIA = o.plural?"are":"is";
  const beIAflip = o.plural?"is":"are";
  return {
    active:`${s.full} ${s.plural?v.base:v.s} ${o.text} every day.`,
    correct:`${o.cap} ${beIA} ${v.pp} by ${s.by} every day.`,
    wrongs:[
      `${o.cap} ${beIA} ${v.base} by ${s.by} every day.`,
      `${o.cap} ${beIAflip} ${v.pp} by ${s.by} every day.`,
      `${o.cap} ${v.pp} by ${s.by} every day.`
    ]
  };
},
// 1 Past simple
(s,o,v,i)=>{
  const be = o.plural?"were":"was";
  const beFlip = o.plural?"was":"were";
  return {
    active:`${s.full} ${v.past} ${o.text} yesterday.`,
    correct:`${o.cap} ${be} ${v.pp} by ${s.by} yesterday.`,
    wrongs:[
      `${o.cap} ${be} ${v.base} by ${s.by} yesterday.`,
      `${o.cap} ${beFlip} ${v.pp} by ${s.by} yesterday.`,
      `${o.cap} ${o.plural?"are":"is"} ${v.pp} by ${s.by} yesterday.`
    ]
  };
},
// 2 Present continuous
(s,o,v,i)=>{
  const be = o.plural?"are":"is";
  const beFlip = o.plural?"is":"are";
  return {
    active:`${s.full} ${s.plural?"are":"is"} ${v.ing} ${o.text} now.`,
    correct:`${o.cap} ${be} being ${v.pp} by ${s.by} now.`,
    wrongs:[
      `${o.cap} ${be} ${v.pp} by ${s.by} now.`,
      `${o.cap} ${beFlip} being ${v.pp} by ${s.by} now.`,
      `${o.cap} ${be} being ${v.base} by ${s.by} now.`
    ]
  };
},
// 3 Past continuous
(s,o,v,i)=>{
  const be = o.plural?"were":"was";
  const beFlip = o.plural?"was":"were";
  return {
    active:`${s.full} ${s.plural?"were":"was"} ${v.ing} ${o.text} at 8 p.m. yesterday.`,
    correct:`${o.cap} ${be} being ${v.pp} by ${s.by} at 8 p.m. yesterday.`,
    wrongs:[
      `${o.cap} ${be} ${v.pp} by ${s.by} at 8 p.m. yesterday.`,
      `${o.cap} ${beFlip} being ${v.pp} by ${s.by} at 8 p.m. yesterday.`,
      `${o.cap} ${be} being ${v.base} by ${s.by} at 8 p.m. yesterday.`
    ]
  };
},
// 4 Present perfect
(s,o,v,i)=>{
  const have = o.plural?"have":"has";
  const haveFlip = o.plural?"has":"have";
  return {
    active:`${s.full} ${s.plural?"have":"has"} ${v.pp} ${o.text} recently.`,
    correct:`${o.cap} ${have} been ${v.pp} by ${s.by} recently.`,
    wrongs:[
      `${o.cap} ${have} ${v.pp} by ${s.by} recently.`,
      `${o.cap} ${haveFlip} been ${v.pp} by ${s.by} recently.`,
      `${o.cap} ${have} been ${v.base} by ${s.by} recently.`
    ]
  };
},
// 5 Past perfect
(s,o,v,i)=>{
  return {
    active:`${s.full} had ${v.pp} ${o.text} before the meeting.`,
    correct:`${o.cap} had been ${v.pp} by ${s.by} before the meeting.`,
    wrongs:[
      `${o.cap} had ${v.pp} by ${s.by} before the meeting.`,
      `${o.cap} have been ${v.pp} by ${s.by} before the meeting.`,
      `${o.cap} had been ${v.base} by ${s.by} before the meeting.`
    ]
  };
},
// 6 Future simple
(s,o,v,i)=>{
  return {
    active:`${s.full} will ${v.base} ${o.text} tomorrow.`,
    correct:`${o.cap} will be ${v.pp} by ${s.by} tomorrow.`,
    wrongs:[
      `${o.cap} will ${v.pp} by ${s.by} tomorrow.`,
      `${o.cap} would be ${v.pp} by ${s.by} tomorrow.`,
      `${o.cap} will be ${v.base} by ${s.by} tomorrow.`
    ]
  };
},
// 7 Modal
(s,o,v,i)=>{
  const modal = MODALS[i%4];
  const otherModal = MODALS[(i+1)%4];
  return {
    active:`${s.full} ${modal} ${v.base} ${o.text}.`,
    correct:`${o.cap} ${modal} be ${v.pp} by ${s.by}.`,
    wrongs:[
      `${o.cap} ${modal} ${v.pp} by ${s.by}.`,
      `${o.cap} ${modal} be ${v.base} by ${s.by}.`,
      `${o.cap} ${otherModal} be ${v.pp} by ${s.by}.`
    ]
  };
},
// 8 Future perfect
(s,o,v,i)=>{
  return {
    active:`${s.full} will have ${v.pp} ${o.text} by next week.`,
    correct:`${o.cap} will have been ${v.pp} by ${s.by} by next week.`,
    wrongs:[
      `${o.cap} will have ${v.pp} by ${s.by} by next week.`,
      `${o.cap} will have been ${v.base} by ${s.by} by next week.`,
      `${o.cap} has been ${v.pp} by ${s.by} by next week.`
    ]
  };
},
// 9 Going-to future
(s,o,v,i)=>{
  const be = o.plural?"are":"is";
  const beFlip = o.plural?"is":"are";
  return {
    active:`${s.full} ${s.plural?"are":"is"} going to ${v.base} ${o.text} next month.`,
    correct:`${o.cap} ${be} going to be ${v.pp} by ${s.by} next month.`,
    wrongs:[
      `${o.cap} ${be} going to ${v.pp} by ${s.by} next month.`,
      `${o.cap} ${beFlip} going to be ${v.pp} by ${s.by} next month.`,
      `${o.cap} ${be} going to be ${v.base} by ${s.by} next month.`
    ]
  };
}
];

function mulberry32(a){
  return function(){
    a|=0; a=(a+0x6D2B79F5)|0;
    let t=Math.imul(a^(a>>>15),1|a);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}

// ---------- build 100 items ----------
const itemsData = [];
for(let p=0;p<10;p++){
  for(let i=0;i<10;i++){
    const subj = SUBJECTS[i];
    const obj = OBJECTS[(i+p)%10];
    const verb = VERBS[(i+p*3)%20];
    const built = TENSE_BUILDERS[p](subj,obj,verb,i);
    const opts = [built.correct, ...built.wrongs];
    const rnd = mulberry32((p*10+i)+7);
    for(let k=opts.length-1;k>0;k--){
      const j = Math.floor(rnd()*(k+1));
      [opts[k],opts[j]]=[opts[j],opts[k]];
    }
    itemsData.push({
      id:p*10+i,
      page:p,
      active:built.active,
      options:opts,
      correctIndex:opts.indexOf(built.correct)
    });
  }
}

// ---------- state ----------
const selected = new Array(100).fill(null);
const checkedPage = new Array(10).fill(false);
const revealedPage = new Array(10).fill(false);
let currentPage = 0;

const cardsEl = document.getElementById('cards');
const pagerTopEl = document.getElementById('pagerTop');
const totalScoreEl = document.getElementById('totalScore');
const progressFillEl = document.getElementById('progressFill');
const pageLabelEl = document.getElementById('pageLabel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function computeTotalScore(){
  let score=0;
  for(const item of itemsData){
    if(checkedPage[item.page] && selected[item.id]===item.correctIndex) score++;
  }
  return score;
}

function updateScoreUI(){
  const score = computeTotalScore();
  totalScoreEl.textContent = score;
  progressFillEl.style.width = score+"%";
}

function renderPagerTop(){
  pagerTopEl.innerHTML="";
  for(let p=0;p<10;p++){
    const b=document.createElement('button');
    b.textContent = p+1;
    if(p===currentPage) b.classList.add('active');
    if(checkedPage[p]) b.classList.add('done');
    b.addEventListener('click',()=>{ currentPage=p; renderAll(); });
    pagerTopEl.appendChild(b);
  }
}

function selectOption(itemId, optIndex){
  if(checkedPage[Math.floor(itemId/10)]) return;
  selected[itemId]=optIndex;
  renderCards();
}

function renderCards(){
  cardsEl.innerHTML="";
  const pageItems = itemsData.filter(it=>it.page===currentPage);
  const isChecked = checkedPage[currentPage];
  const isRevealed = revealedPage[currentPage];

  pageItems.forEach((item,idx)=>{
    const card=document.createElement('div');
    card.className='card';
    const sel = selected[item.id];
    if(isChecked){
      card.classList.add(sel===item.correctIndex ? 'correct' : 'incorrect');
    }

    const head=document.createElement('div');
    head.className='card-head';
    const num=document.createElement('span');
    num.className='card-num';
    num.textContent = (item.id+1)+'.';
    const sentence=document.createElement('span');
    sentence.className='active-sentence';
    sentence.textContent=item.active;
    head.appendChild(num);
    head.appendChild(sentence);
    card.appendChild(head);

    const optsWrap=document.createElement('div');
    optsWrap.className='options';

    item.options.forEach((optText,oi)=>{
      const label=document.createElement('label');
      label.className='option';
      if(isChecked){
        if(oi===item.correctIndex) label.classList.add('opt-correct');
        else if(oi===sel) label.classList.add('opt-wrong');
      } else if(isRevealed && oi===item.correctIndex){
        label.classList.add('opt-reveal');
      }
      const input=document.createElement('input');
      input.type='radio';
      input.name='q'+item.id;
      input.checked = sel===oi;
      input.disabled = isChecked;
      input.addEventListener('change',()=>selectOption(item.id,oi));
      const span=document.createElement('span');
      span.textContent=optText;
      label.appendChild(input);
      label.appendChild(span);
      if(isChecked && oi===sel){
        const icon=document.createElement('span');
        icon.className='feedback-icon '+(sel===item.correctIndex?'ok':'no');
        icon.textContent = sel===item.correctIndex ? '✓' : '✗';
        label.appendChild(icon);
      }
      optsWrap.appendChild(label);
    });

    card.appendChild(optsWrap);

    if(isRevealed && !isChecked){
      const note=document.createElement('div');
      note.className='answer-note';
      note.textContent='Correct: '+item.options[item.correctIndex];
      card.appendChild(note);
    }

    cardsEl.appendChild(card);
  });
}

function renderFooter(){
  pageLabelEl.textContent = `Page ${currentPage+1} of 10`;
  prevBtn.disabled = currentPage===0;
  nextBtn.disabled = currentPage===9;
}

function renderAll(){
  renderPagerTop();
  renderCards();
  renderFooter();
  updateScoreUI();
}

document.getElementById('checkBtn').addEventListener('click',()=>{
  checkedPage[currentPage]=true;
  renderAll();
});
document.getElementById('showBtn').addEventListener('click',()=>{
  revealedPage[currentPage]=true;
  renderCards();
});
prevBtn.addEventListener('click',()=>{ if(currentPage>0){currentPage--; renderAll();}});
nextBtn.addEventListener('click',()=>{ if(currentPage<9){currentPage++; renderAll();}});
document.getElementById('resetBtn').addEventListener('click',()=>{
  selected.fill(null);
  checkedPage.fill(false);
  revealedPage.fill(false);
  currentPage=0;
  renderAll();
});

renderAll();
