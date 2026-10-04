// One four-week experiment, with the action at the time of each reflection kept.
const PRACTICE_KEY='derailer70Practice';
const practiceOutcomes={'tried':'試せた','not-yet':'機会はあったが、まだ試せていない','no-opportunity':'試す場面がなかった'};
function cleanPracticeText(value,max){return typeof value==='string'?value.trim().slice(0,max):''}
function validPracticeDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(value)&&Number.isFinite(Date.parse(value))}
function normalizePractice(value){
  if(!value||value.version!==1||!Object.hasOwn(actionLibrary,value.actionKey)||!validPracticeDate(value.startedAt))return null;
  const plan={version:1,actionKey:value.actionKey,context:cleanPracticeText(value.context,240),signal:cleanPracticeText(value.signal,240),startedAt:value.startedAt,reflections:[]};
  if(!plan.context||!plan.signal)return null;
  const seen=new Set();
  if(Array.isArray(value.reflections))value.reflections.forEach(row=>{
    if(!row||!Number.isInteger(row.week)||row.week<1||row.week>4||seen.has(row.week)||!Object.hasOwn(practiceOutcomes,row.outcome)||!validPracticeDate(row.savedAt))return;
    seen.add(row.week);plan.reflections.push({week:row.week,outcome:row.outcome,note:cleanPracticeText(row.note,800),savedAt:row.savedAt,actionTitle:cleanPracticeText(row.actionTitle,100),context:cleanPracticeText(row.context,240),signal:cleanPracticeText(row.signal,240)});
  });
  plan.reflections.sort((a,b)=>a.week-b.week);return plan;
}
function loadPractice(){try{return normalizePractice(JSON.parse(safeGet(PRACTICE_KEY,'null')))}catch(e){return null}}
let practicePlan=null,practiceRendered=false;
function persistPractice(plan){
  practicePlan=normalizePractice(plan);
  try{window.localStorage.setItem(PRACTICE_KEY,JSON.stringify(practicePlan));return true}catch(e){return false}
}
function practiceDateLabel(value){return new Date(value).toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric'})}
function practiceReviewDate(plan,week){const date=new Date(plan.startedAt);date.setDate(date.getDate()+7*week);return date.toISOString()}
function setPracticeStatus(message){document.getElementById('practiceStatus').textContent=message}
function renderPractice(r){
  const selector=document.getElementById('practiceAction');
  const current=practiceRendered?selector.value:practicePlan?.actionKey;
  const brief=buildLeadershipBrief(r),candidates=brief.actions;
  if(current&&Object.hasOwn(actionLibrary,current)&&!candidates.some(a=>a.key===current))candidates.unshift({key:current,title:actionLibrary[current][0]});
  selector.innerHTML='';
  candidates.forEach(action=>{const option=document.createElement('option');option.value=action.key;option.textContent=action.title+(action.key===brief.action.key?'（提案）':'');selector.appendChild(option)});
  selector.value=current||candidates[0].key;
  if(!practiceRendered){
    document.getElementById('practiceContext').value=practicePlan?.context||'';
    document.getElementById('practiceSignal').value=practicePlan?.signal||'';
    document.getElementById('practiceWeek').value=String(practicePlan?[1,2,3,4].find(w=>!practicePlan.reflections.some(x=>x.week===w))||4:1);
    populatePracticeReflection();
  }
  practiceRendered=true;renderPracticeAction();renderPracticeHistory();
  document.getElementById('reflectionFields').classList[practicePlan?'remove':'add']('hidden');
  document.getElementById('clearPracticeBtn').classList[practicePlan?'remove':'add']('hidden');
  document.getElementById('savePracticeBtn').textContent=practicePlan?'取り組みを更新する':'この取り組みを保存する';
}
function renderPracticeAction(){
  const key=document.getElementById('practiceAction').value;
  document.getElementById('practiceActionCopy').textContent=Object.hasOwn(actionLibrary,key)?actionLibrary[key][1]:'';
}
function savePractice(){
  const key=document.getElementById('practiceAction').value;
  const context=cleanPracticeText(document.getElementById('practiceContext').value,240);
  const signal=cleanPracticeText(document.getElementById('practiceSignal').value,240);
  if(!Object.hasOwn(actionLibrary,key)||!context||!signal){setPracticeStatus('試す場面と、振り返るときに見る変化を入力してください。');document.getElementById(!context?'practiceContext':'practiceSignal').focus();return}
  const next={version:1,actionKey:key,context,signal,startedAt:practicePlan?.startedAt||new Date().toISOString(),reflections:practicePlan?.reflections||[]};
  const saved=persistPractice(next);
  renderPractice(window._latest);updatePracticeReviewLabel();
  setPracticeStatus(saved?'取り組みを保存しました。1週間後にこのページで振り返れます。':'このブラウザでは保存できません。この画面を閉じる前に「結果データを保存」で記録を手元に残してください。');
}
function updatePracticeReviewLabel(){
  const week=Number(document.getElementById('practiceWeek').value)||1;
  document.getElementById('practiceReviewDate').textContent=practicePlan?`${week}週目の振り返りの目安：${practiceDateLabel(practiceReviewDate(practicePlan,week))}（通知は届きません）`:'';
}
function populatePracticeReflection(){
  const week=Number(document.getElementById('practiceWeek').value)||1;
  const row=practicePlan?.reflections.find(x=>x.week===week);
  document.getElementById('practiceOutcome').value=row?.outcome||'';
  document.getElementById('practiceNote').value=row?.note||'';
  document.getElementById('reflectionContext').textContent=row?`この週に記録した取り組み：${row.actionTitle} ／ ${row.context}`:'保存した取り組みについて振り返ります。';
  updatePracticeReviewLabel();
}
function savePracticeReflection(){
  if(!practicePlan){setPracticeStatus('先に、試す取り組みを保存してください。');return}
  const week=Number(document.getElementById('practiceWeek').value);
  const outcome=document.getElementById('practiceOutcome').value;
  if(!Number.isInteger(week)||week<1||week>4||!Object.hasOwn(practiceOutcomes,outcome)){setPracticeStatus('今週、試せたかどうかを選んでください。');document.getElementById('practiceOutcome').focus();return}
  // Avoid silently recording a different plan from the unsaved fields on screen.
  if(document.getElementById('practiceAction').value!==practicePlan.actionKey||cleanPracticeText(document.getElementById('practiceContext').value,240)!==practicePlan.context||cleanPracticeText(document.getElementById('practiceSignal').value,240)!==practicePlan.signal){setPracticeStatus('取り組みの変更を、先に「取り組みを更新する」で保存してください。');return}
  const previous=practicePlan.reflections.find(x=>x.week===week);
  const row={week,outcome,note:cleanPracticeText(document.getElementById('practiceNote').value,800),savedAt:new Date().toISOString(),actionTitle:previous?.actionTitle||actionLibrary[practicePlan.actionKey][0],context:previous?.context||practicePlan.context,signal:previous?.signal||practicePlan.signal};
  const saved=persistPractice({...practicePlan,reflections:[...practicePlan.reflections.filter(x=>x.week!==week),row]});
  renderPracticeHistory();
  document.getElementById('reflectionContext').textContent=`この週に記録した取り組み：${row.actionTitle} ／ ${row.context}`;
  setPracticeStatus(saved?`${week}週目の振り返りを保存しました。${practicePlan.reflections.length===4?'4週間の記録が揃いました。役立った関わりを次の仕事にも取り入れてみてください。':'同じ週を選ぶと、記録を見直せます。'}`:'このブラウザでは保存できません。「結果データを保存」で記録を手元に残してください。');
}
function renderPracticeHistory(){
  const root=document.getElementById('practiceHistory');root.innerHTML='';
  if(!practicePlan)return;
  const progress=document.createElement('p');progress.className='note';progress.textContent=`開始：${practiceDateLabel(practicePlan.startedAt)} · 振り返り ${practicePlan.reflections.length} / 4週`;root.appendChild(progress);
  practicePlan.reflections.forEach(row=>{
    const card=document.createElement('article');card.className='practice-entry';
    const title=document.createElement('h4');title.textContent=`${row.week}週目：${practiceOutcomes[row.outcome]}`;card.appendChild(title);
    const context=document.createElement('p');context.className='note';context.textContent=`${row.actionTitle} ／ ${row.context}`;card.appendChild(context);
    const signal=document.createElement('p');signal.className='note';signal.textContent=`見る変化：${row.signal}`;card.appendChild(signal);
    const note=document.createElement('p');note.textContent=row.note||'メモなし';card.appendChild(note);
    root.appendChild(card);
  });
}
function practiceText(plan){
  if(!plan)return '';
  return ['4週間の取り組み',actionLibrary[plan.actionKey][0],`試す場面：${plan.context}`,`見る変化：${plan.signal}`,...plan.reflections.map(row=>`${row.week}週目：${practiceOutcomes[row.outcome]}\n${row.actionTitle} ／ ${row.context}\n見る変化：${row.signal}\n${row.note}`)].join('\n');
}
function clearPractice(){
  if(!practicePlan||!confirm('取り組みと4週分の振り返りを削除しますか？ この操作は元に戻せません。70問の回答と診断結果は残ります。'))return;
  try{window.localStorage.removeItem(PRACTICE_KEY)}catch(e){setPracticeStatus('記録を削除できませんでした。ブラウザの保存設定を確認してください。');return}
  practicePlan=null;practiceRendered=false;renderPractice(window._latest);
  setPracticeStatus('取り組みと振り返りを削除しました。');
}
function bindPractice(){
  practicePlan=loadPractice();
  document.getElementById('practiceAction').addEventListener('change',renderPracticeAction);
  document.getElementById('savePracticeBtn').addEventListener('click',savePractice);
  document.getElementById('practiceWeek').addEventListener('change',populatePracticeReflection);
  document.getElementById('saveReflectionBtn').addEventListener('click',savePracticeReflection);
  document.getElementById('clearPracticeBtn').addEventListener('click',clearPractice);
}
