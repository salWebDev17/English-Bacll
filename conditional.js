function normalize(s){
  return s.trim().toLowerCase().replace(/\s+/g,' ').replace(/’/g,"'");
}
function checkInput(input){
  const accepted = input.dataset.ans.split('|').map(normalize);
  const val = normalize(input.value);
  const isCorrect = val.length > 0 && accepted.includes(val);
  input.classList.remove('correct','wrong');
  const existingFeedback = input.parentElement.querySelector('.feedback-answer');
  if(existingFeedback) existingFeedback.remove();
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
  indicator.style.marginLeft = 'auto';
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