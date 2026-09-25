  (function(){
    try{
      const page = location.pathname.split('/').pop().replace('.html','');
      const time = new Date().toLocaleString();
      let entries = JSON.parse(localStorage.getItem('visitLog') || '[]');
      entries.push({ page: page, time: time });
      // keep only the last 300 entries so storage doesn't grow forever
      if(entries.length > 300) entries = entries.slice(-300);
      localStorage.setItem('visitLog', JSON.stringify(entries));
    }catch(e){}
  })();
const wordBank = ["occupation","successful","embarrassment","hobby","failure","solution","secretarial","explanation","frozen","construction"];
const answers1 = {
  2:"secretarial", 3:"occupation", 4:"frozen", 5:"hobby", 6:"explanation",
  7:"solution", 8:"failure", 9:"successful", 10:"construction", 11:"embarrassment"
};

const grammarQs = [
  { q:"Girls, you ______ say those things about your teachers.",
    opts:{a:"mustn't", b:"haven't to", c:"haven't", d:"mustn't to"}, correct:"a" },
  { q:"Have another piece of cake. No, thanks, ______ too much.",
    opts:{a:"I've ate", b:"I ate", c:"I eaten", d:"I've eaten"}, correct:"d" },
  { q:"I was going to do the washing, but the machine ______ down.",
    opts:{a:"broke", b:"breaks", c:"broken", d:"break"}, correct:"a" },
  { q:"My secretary was late. She had never ______ late before.",
    opts:{a:"was", b:"had", c:"came", d:"been"}, correct:"d" },
  { q:"If you give me some money, I ______ to go shopping.",
    opts:{a:"can", b:"could", c:"will be able", d:"will can"}, correct:"c" },
];

const vocabQs = [
  { q:"Before you begin the exam paper, always read the ______ carefully.",
    opts:{a:"orders", b:"instructions", c:"rules", d:"answers"}, correct:"b" },
  { q:"If you put your money in the bank, it will earn ten percent ______ .",
    opts:{a:"interest", b:"profit", c:"deposit", d:"investment"}, correct:"a" },
  { q:"Most people in the town ______ the idea of a Green and Clean city.",
    opts:{a:"agree", b:"approve", c:"support", d:"believe"}, correct:"c" },
  { q:"The plane was delayed by fog, and so I ______ my connection.",
    opts:{a:"lost", b:"abandoned", c:"forget", d:"missed"}, correct:"d" },
  { q:"The fans climbed over the fence to ______ paying.",
    opts:{a:"avoid", b:"prevent", c:"abandon", d:"refuse"}, correct:"a" },
];

// ---------- BUILD WORD BOX ----------
const wordBoxEl = document.getElementById('wordBox');
function renderWordBox(){
  wordBoxEl.innerHTML = '<span style="font-family:Lora, serif; font-style:italic; color:var(--ink-soft);">(1) evening — done for you</span>';
  wordBank.forEach(w=>{
    const used = Object.values(currentSelections1).includes(w);
    const s = document.createElement('span');
    s.textContent = w;
    if(used) s.classList.add('used');
    wordBoxEl.appendChild(s);
  });
}

// ---------- BUILD GAP SELECTS ----------
const currentSelections1 = {};
document.querySelectorAll('select.gap[data-blank]').forEach(sel=>{
  const blank = sel.getAttribute('data-blank');
  const placeholder = document.createElement('option');
  placeholder.value = "";
  placeholder.textContent = "— choose —";
  sel.appendChild(placeholder);
  wordBank.forEach(w=>{
    const o = document.createElement('option');
    o.value = w; o.textContent = w;
    sel.appendChild(o);
  });
  sel.addEventListener('change', ()=>{
    currentSelections1[blank] = sel.value;
    renderWordBox();
    updateProgress();
  });
});

// ---------- BUILD MCQ BLOCKS ----------
function buildMCQ(container, list, prefix){
  list.forEach((item, idx)=>{
    const qn = idx+1;
    const wrap = document.createElement('div');
    wrap.className = 'qblock';
    const qtext = document.createElement('div');
    qtext.className = 'qtext';
    qtext.innerHTML = `<b>${qn}.</b> ${item.q.replace('______', '<span class="blank-line">&nbsp;</span>')}`;
    wrap.appendChild(qtext);
    const opts = document.createElement('div');
    opts.className = 'options';
    Object.entries(item.opts).forEach(([letter, text])=>{
      const label = document.createElement('label');
      label.className = 'opt';
      label.innerHTML = `<input type="radio" name="${prefix}${qn}" value="${letter}"><span class="letter">${letter}</span> ${text}`;
      const input = label.querySelector('input');
      input.addEventListener('change', ()=>{
        opts.querySelectorAll('.opt').forEach(o=>o.classList.remove('chosen'));
        label.classList.add('chosen');
        updateProgress();
      });
      opts.appendChild(label);
    });
    wrap.appendChild(opts);
    container.appendChild(wrap);
  });
}
buildMCQ(document.getElementById('grammarQuestions'), grammarQs, 'g');
buildMCQ(document.getElementById('vocabQuestions'), vocabQs, 'v');
renderWordBox();

// ---------- WORD COUNT ----------
const essayBox = document.getElementById('essayBox');
const wordCountEl = document.getElementById('wordCount');
essayBox.addEventListener('input', ()=>{
  const words = essayBox.value.trim().split(/\s+/).filter(Boolean);
  const n = words.length;
  wordCountEl.textContent = n + ' words (aim for 80+)';
  wordCountEl.classList.toggle('ok', n>=80);
  updateProgress();
});

// ---------- PROGRESS ----------
function updateProgress(){
  let filled = 0;
  const total = 10 + 5 + 5; // gaps + grammar + vocab (writing not counted toward %, just a nudge)
  Object.values(currentSelections1).forEach(v=>{ if(v) filled++; });
  document.querySelectorAll('input[type=radio]:checked').forEach(()=> filled++);
  const pct = Math.min(100, Math.round((filled/total)*100));
  document.getElementById('progressFill').style.width = pct + '%';
}

// ---------- CHECK ANSWERS ----------
document.getElementById('checkBtn').addEventListener('click', ()=>{
  let score = 0;
  const pointsPerReading = 10/10; // 10 pts across 10 scored blanks (blank 1 given free)
  let readingCorrect = 0;

  // Part 1
  document.querySelectorAll('select.gap[data-blank]').forEach(sel=>{
    const blank = sel.getAttribute('data-blank');
    sel.classList.remove('correct','incorrect');
    if(sel.value === answers1[blank]){
      sel.classList.add('correct');
      readingCorrect++;
    } else if(sel.value){
      sel.classList.add('incorrect');
    }
  });
  score += readingCorrect * pointsPerReading;

  // Part 2 & 3 helper
  function gradeMCQ(list, prefix){
    let correctCount = 0;
    list.forEach((item, idx)=>{
      const qn = idx+1;
      const radios = document.querySelectorAll(`input[name="${prefix}${qn}"]`);
      radios.forEach(r=>{
        const label = r.closest('.opt');
        label.classList.remove('correct','incorrect');
        if(r.value === item.correct){
          label.classList.add('correct');
        } else if(r.checked){
          label.classList.add('incorrect');
        }
      });
      const chosen = document.querySelector(`input[name="${prefix}${qn}"]:checked`);
      if(chosen && chosen.value === item.correct) correctCount++;
    });
    return correctCount;
  }

  const grammarCorrect = gradeMCQ(grammarQs, 'g');
  const vocabCorrect = gradeMCQ(vocabQs, 'v');
  score += grammarCorrect * 3; // 15 pts / 5 q
  score += vocabCorrect * 3;   // 15 pts / 5 q

  document.getElementById('scoreDisplay').style.display = 'block';
  document.getElementById('scoreNum').textContent = Math.round(score);
  document.getElementById('scoreBreakdown').innerHTML =
    `Reading: ${readingCorrect}/10 blanks → ${readingCorrect}/10 pts<br>` +
    `Grammar: ${grammarCorrect}/5 correct → ${grammarCorrect*3}/15 pts<br>` +
    `Vocabulary: ${vocabCorrect}/5 correct → ${vocabCorrect*3}/15 pts<br>` +
    `Writing: score it yourself against the 80-word, on-topic essay task (10 pts)`;

  document.getElementById('scoreDisplay').scrollIntoView({behavior:'smooth', block:'nearest'});
});

// ---------- RESET ----------
document.getElementById('resetBtn').addEventListener('click', ()=>{
  document.querySelectorAll('select.gap[data-blank]').forEach(sel=>{
    sel.value = "";
    sel.classList.remove('correct','incorrect');
  });
  Object.keys(currentSelections1).forEach(k=> delete currentSelections1[k]);
  renderWordBox();
  document.querySelectorAll('input[type=radio]').forEach(r=>{
    r.checked = false;
    r.closest('.opt').classList.remove('chosen','correct','incorrect');
  });
  essayBox.value = '';
  wordCountEl.textContent = '0 words (aim for 80+)';
  wordCountEl.classList.remove('ok');
  document.getElementById('scoreDisplay').style.display = 'none';
  updateProgress();
});
