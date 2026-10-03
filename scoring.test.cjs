const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// A minimal DOM keeps scoring/storage checks independent of browser automation.
function load(initialStorage = {}, blockedStorage = false) {
  const storage = new Map(Object.entries(initialStorage));
  const elements = new Map();
  const downloadBlobs = [];
  function element() {
    const classes = new Set();
    return {
      value: '', textContent: '', style: {}, children: [],
      get innerHTML() { return this.html ?? ''; },
      set innerHTML(value) { this.html = value; this.children = []; },
      classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x) },
      addEventListener() {}, setAttribute() {}, removeAttribute() {},
      focus() {}, scrollIntoView() {}, insertAdjacentHTML() {}, click() {}, remove() {},
      appendChild(child) { this.children.push(child); }
    };
  }
  const document = {
    getElementById(id) { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
    querySelectorAll() { return this.getElementById('questions').children; },
    createElement: element, body:element()
  };
  const localStorage = {
    getItem(k) { if (blockedStorage) throw Error('blocked'); return storage.get(k) ?? null; },
    setItem(k,v) { if (blockedStorage) throw Error('blocked'); storage.set(k,v); },
    removeItem(k) { if (blockedStorage) throw Error('blocked'); storage.delete(k); }
  };
  const context = vm.createContext({ document, window: {localStorage, scrollTo() {}}, location: {hash: ''}, confirm: () => true, setTimeout() {}, console, Blob, URL:{createObjectURL(blob){downloadBlobs.push(blob);return 'blob:test';},revokeObjectURL(){}} });
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'mbti.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'profile.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), context);
  return { run: script => vm.runInContext(script, context), storage, document, downloadBlobs };
}
function fill(app, value) { app.run(`answers=Object.fromEntries(Array.from({length:70},(_,i)=>[i,${value}]))`); }
function normalized(app, value) {
  return JSON.parse(JSON.stringify(app.run(`normalizeAnswers(${JSON.stringify(value)})`)));
}

test('70 distinct questions: 11 factors × 5 plus 5 impact axes × 3', () => {
  const app = load();
  assert.equal(app.run('QUESTION_COUNT'), 70);
  assert.equal(app.run('new Set([...derailerQuestions,...impactQuestions].map(q=>q[1])).size'), 70);
  assert.equal(app.run('Object.keys(factorInfo).every(k=>derailerQuestions.filter(q=>q[0]===k).length===5)'), true);
  assert.equal(app.run('Object.keys(impactInfo).every(k=>impactQuestions.filter(q=>q[0]===k).length===3)'), true);
});
test('neutral answers produce 50 on every factor, impact and weighted pattern', () => {
  const app = load(); fill(app, 3);
  const r = app.run('calc()');
  for (const x of [...Object.values(r.factors), ...Object.values(r.impacts)]) assert.equal(x.index, 50);
  assert.equal(r.multiplier, 50);
  for (const x of Object.values(r.patterns)) assert.equal(x, 50);
});
test('reverse scoring permits true 0 and 100 endpoints', () => {
  const app = load();
  for (const high of [false, true]) {
    app.run(`answers=Object.fromEntries([...derailerQuestions,...impactQuestions].map((q,i)=>[i,q[2]===-1?${high?1:5}:${high?5:1}]))`);
    const r = app.run('calc()');
    for (const x of [...Object.values(r.factors), ...Object.values(r.impacts)]) assert.equal(x.index, high ? 100 : 0);
    assert.equal(r.multiplier, high ? 100 : 0);
    assert.equal(r.patterns.micromanage, 50);
  }
});
test('all 5s differ from all 1s because reverse items remain active', () => {
  const app = load(); fill(app,5);
  const high = app.run('calc()');
  assert.equal(high.factors.excitable.index,80);
  assert.equal(high.impacts.autonomy.index,67);
  assert.equal(high.multiplier,84);
  fill(app,1);
  const low = app.run('calc()');
  assert.equal(low.factors.excitable.index,20);
  assert.equal(low.impacts.autonomy.index,33);
  assert.equal(low.multiplier,17);
});
test('invalid stored values cannot count as completed answers', () => {
  const app = load({'derailer70Answers':'null'});
  assert.equal(app.run('missingAnswers().length'),70);
  assert.deepEqual(normalized(app, {'0':5,'1':0,'2':6,'3':'5','4':2.5,'70':3,'-1':2,'01':2,'bad':4}), {'0':5});
  assert.deepEqual(normalized(app,[1,2,3]),{});
  assert.throws(() => app.run('calc()'), /70問/);
});
test('archetype ranking stays ordered and every score remains within range', () => {
  const app = load();
  for(let seed=0;seed<20;seed++) {
    app.run(`answers=Object.fromEntries(Array.from({length:70},(_,i)=>[i,(i*13+${seed})%5+1]))`);
    const r = app.run('calc()');
    assert.equal(r.typeScores.length,8);
    assert.ok(r.typeScores.every((x,i,a)=>x.fit>=0&&x.fit<=100&&(!i||a[i-1].fit>=x.fit)));
    assert.ok(Object.values(r.patterns).every(x=>x>=0&&x<=100));
  }
});
test('reset removes legacy answers so they cannot reappear on reload', () => {
  const app = load({'derailerAnswers':'{"0":4}', 'derailer70Answers':'{"1":5}'});
  app.run('resetQuiz()');
  assert.equal(app.storage.has('derailer70Answers'),false);
  assert.equal(app.storage.has('derailerAnswers'),false);
  assert.equal(app.run('Object.keys(loadAnswers()).length'),0);
  assert.equal(app.run('window._latest'),null);
});
test('answers still work when browser storage is unavailable', () => {
  const app = load({},true);
  app.run('saveAnswer(0,5)');
  assert.equal(app.run('answers[0]'),5);
  assert.equal(app.document.getElementById('progressText').textContent,'1 / 70');
  fill(app,3);
  assert.equal(app.run('calc().multiplier'),50);
});
test('full shuffle is a permutation and persists across resume and review', () => {
  const app=load();
  const order=JSON.parse(JSON.stringify(app.run('ensureQuestionOrder()')));
  assert.deepEqual([...order].sort((a,b)=>a-b),Array.from({length:70},(_,i)=>i));
  assert.notDeepEqual(order,Array.from({length:70},(_,i)=>i));
  assert.equal(app.run('JSON.stringify(ensureQuestionOrder())'),JSON.stringify(order));
  const resumed=load(Object.fromEntries(app.storage));
  assert.equal(resumed.run('JSON.stringify(ensureQuestionOrder())'),JSON.stringify(order));
  app.run('resetQuiz()');
  assert.equal(app.storage.has('derailer70Order'),false);
  assert.equal(app.run('questionOrder'),null);
});
test('malformed saved orders are replaced and question IDs survive shuffled display', () => {
  const app=load({'derailer70Order':'[0,0,1]'});
  app.run('renderQuestions()');
  const cards=app.document.getElementById('questions').children;
  assert.equal(cards.length,70);
  assert.equal(new Set(cards.map(c=>c.id)).size,70);
  assert.ok(cards.every((c,pos)=>c.innerHTML.includes(`<div class="qnum">${pos+1}</div>`)&&!c.innerHTML.includes('section-banner')));
  const id=Number(cards[0].id.replace('question-card-',''));
  assert.ok(cards[0].innerHTML.includes(`name="q${id}"`));
  app.run(`saveAnswer(${id},5)`);
  assert.equal(app.run(`answers[${id}]`),5);
});
test('order changes do not alter scoring and neutral results acknowledge ties', () => {
  const app=load();fill(app,3);
  const before=JSON.stringify(app.run('calc()'));
  app.run('questionOrder=shuffledOrder();renderResults(calc())');
  assert.equal(JSON.stringify(app.run('calc()')),before);
  assert.match(app.document.getElementById('summaryCopy').textContent,/すべて同じ得点/);
  assert.match(app.document.getElementById('types').innerHTML,/類似度/);
  assert.doesNotMatch(app.document.getElementById('types').innerHTML,/% fit/);
  assert.match(app.document.getElementById('development').innerHTML,/11項目が同点/);
});

function report(app) { return JSON.parse(JSON.stringify(app.run('buildLeadershipProfile(calc())'))); }
function words(result) { return result.lead+'\n'+result.sections.map(s=>s.body).join('\n'); }

test('the same archetype gets different prose when individual factors differ', () => {
  const app=load();fill(app,3);
  // Swap two factors within the same cluster: identical 8D type vector,
  // different actual behavior. Scoring IDs remain canonical.
  app.run('derailerQuestions.forEach((q,id)=>{if(["skeptical","reserved"].includes(q[0]))answers[id]=(q[0]==="skeptical")===(q[2]===1)?5:1})');
  const first=report(app),types=JSON.stringify(app.run('calc().typeScores'));
  app.run('derailerQuestions.forEach((q,id)=>{if(["skeptical","reserved"].includes(q[0]))answers[id]=6-answers[id]})');
  const second=report(app);
  assert.equal(JSON.stringify(app.run('calc().typeScores')),types);
  assert.notEqual(first.sections[1].body,second.sections[1].body);
  assert.notEqual(first.sections[3].body,second.sections[3].body);
});
test('all 16 scores affect interpretation, not only visible numbers', () => {
  const app=load();fill(app,3);
  app.run('baseline=calc()');
  const before=words(app.run('buildLeadershipProfile(baseline)'));
  for(const kind of ['factors','impacts']){
    const keys=app.run(`Object.keys(baseline.${kind})`);
    for(const key of keys){
      const after=words(app.run(`(()=>{const r=JSON.parse(JSON.stringify(baseline));r.${kind}[${JSON.stringify(key)}].index=80;return buildLeadershipProfile(r)})()`));
      assert.notEqual(after,before,`${kind}.${key} must change the narrative`);
    }
  }
});
test('high skepticism is read differently with high vs low self-correction', () => {
  const app=load();fill(app,3);
  app.run('sample=calc();sample.factors.skeptical.index=90;sample.impacts.selfcorrect.index=90');
  const receptive=app.run('buildLeadershipProfile(sample).sections[1].body');
  assert.match(receptive,/根拠があれば考えを変える/);
  app.run('sample.impacts.selfcorrect.index=20');
  const fixed=app.run('buildLeadershipProfile(sample).sections[1].body');
  assert.match(fixed,/自分の見方を更新する行動が控えめ/);
  assert.doesNotMatch(fixed,/根拠があれば考えを変える/);
});
test('relative support differences do not label midrange delegation as inability', () => {
  const app=load();fill(app,3);
  app.run('sample=calc();sample.impacts.autonomy.index=65;sample.impacts.coaching.index=65;sample.impacts.safety.index=95;sample.impacts.selfcorrect.index=95;sample.multiplier=80');
  const body=app.run('buildLeadershipProfile(sample).sections[2].body');
  assert.match(body,/相対的な差/);
  assert.match(body,/苦手だと断定する結果ではありません/);
  assert.match(body,/65・65/);
  assert.doesNotMatch(body,/自走支援の回答は少なめ/);
});
test('neutral and endpoint profiles are complete, finite and do not invent ranks', () => {
  const app=load();fill(app,3);
  const neutral=report(app);
  assert.match(neutral.lead,/言い切れません/);
  assert.match(neutral.sections[4].body,/すべて同じ得点/);
  const used=new Set(neutral.sections.flatMap(s=>s.scores.map(x=>x.kind+'.'+x.key)));
  assert.equal(used.size,16);
  for(const high of [false,true]){
    app.run(`answers=Object.fromEntries([...derailerQuestions,...impactQuestions].map((q,id)=>[id,q[2]===-1?${high?1:5}:${high?5:1}]))`);
    const result=report(app);
    assert.equal(result.sections.length,5);
    assert.ok(result.sections.every(s=>s.body.length>100));
    assert.doesNotMatch(words(result),/undefined|NaN/);
    assert.ok(result.sections.flatMap(s=>s.scores).every(s=>s.value===Number(high)*100));
  }
});
test('MBTI changes the displayed and copied explanation but preserves the base score narrative', () => {
  const app=load();fill(app,3);
  const before=JSON.stringify(report(app).sections);
  const copied=[];
  for(const mbti of ['ENTP','ISFJ','']){
    app.run(`profile.mbti=${JSON.stringify(mbti)};renderResults(calc())`);
    const full=app.run('buildLeadershipProfile(calc(),profile.mbti)');
    const copy=app.run('buildSummary()');copied.push(copy);
    assert.equal(JSON.stringify(full.sections),before);
    assert.equal(app.document.getElementById('summaryCopy').textContent,full.lead);
    assert.equal(app.document.getElementById('summaryDetails').children.length,5);
    assert.match(copy,/判断と、意見の受け止め方/);
    assert.equal(app.document.getElementById('mbtiDetails').classList.contains('hidden'),!mbti);
    if(mbti){
      assert.equal(app.document.getElementById('resultMbtiInput').value,mbti);
      assert.equal(app.document.getElementById('mbtiDetails').children.length,8);
      for(const part of full.mbti.sections)assert.ok(copy.includes(part.body));
    }else{
      assert.equal(full.mbti,null);
      assert.equal(app.document.getElementById('mbtiDetails').children.length,0);
      assert.doesNotMatch(copy,/今回の行動得点|MBTIだけで/);
    }
  }
  assert.equal(new Set(copied).size,3);
});
test('high autonomy with low coaching is not summarized as holding decisions', () => {
  const app=load();fill(app,3);
  app.run('sample=calc();sample.impacts.standards.index=90;sample.impacts.autonomy.index=90;sample.impacts.coaching.index=20');
  assert.match(app.run('buildLeadershipProfile(sample).lead'),/裁量を渡しつつ/);
  assert.doesNotMatch(app.run('buildLeadershipProfile(sample).lead'),/重要な判断は自分で持つ/);
});

test('all 16 MBTI types produce four distinct preference explanations with identical scoring', () => {
  const app=load();fill(app,5);
  const scores=JSON.stringify(app.run('calc()'));
  const reports=new Map();
  for(const type of app.run('mbtiValues')){
    app.run(`profile.mbti=${JSON.stringify(type)}`);
    const result=app.run('buildLeadershipProfile(calc(),profile.mbti)');
    assert.equal(result.mbti.type,type);
    assert.equal(result.mbti.sections.length,4);
    assert.ok(result.mbti.sections.every(s=>s.body.length>100&&s.scores.every(x=>Number.isFinite(x.value))));
    assert.doesNotMatch(result.lead+result.mbti.sections.map(s=>s.body).join(''),/undefined|NaN/);
    assert.equal(JSON.stringify(app.run('calc()')),scores);
    reports.set(type,result.mbti);
  }
  // Each changed preference must change prose, not just a type name or label.
  const base=reports.get('ENTP');
  for(const [type,index] of [['INTP',0],['ESTP',1],['ENFP',2],['ENTJ',3]]){
    assert.notEqual(base.sections[index].body,reports.get(type).sections[index].body);
  }
});

test('the same MBTI gets different prose as actual behavior combinations change', () => {
  const app=load();fill(app,3);
  app.run('sample=calc();sample.factors.imaginative.index=90;sample.factors.skeptical.index=95;sample.impacts.selfcorrect.index=90;sample.factors.diligent.index=90;sample.impacts.autonomy.index=90');
  const first=app.run('buildMBTIContext(sample,"ENTP")');
  assert.match(first.sections[2].body,/根拠のある指摘は自分の判断にも反映/);
  assert.match(first.sections[3].body,/複数の余地を残して任せる/);
  app.run('sample.factors.imaginative.index=20;sample.impacts.selfcorrect.index=20;sample.impacts.autonomy.index=20');
  const second=app.run('buildMBTIContext(sample,"ENTP")');
  assert.notEqual(first.lead,second.lead);
  assert.match(second.sections[1].body,/発想の飛躍の回答は少なめ/);
  assert.match(second.sections[2].body,/自分の判断を変える条件が対称/);
  assert.match(second.sections[3].body,/メンバーの方法は細かく確認/);
});

test('MBTI preference letters do not override contradictory actual behavior', () => {
  const app=load();fill(app,3);
  app.run('sample=calc();sample.factors.reserved.index=20;sample.factors.imaginative.index=90;sample.impacts.safety.index=90');
  const introvert=app.run('buildMBTIContext(sample,"ISTJ")');
  assert.match(introvert.sections[0].body,/Iだから距離を置く/);
  assert.match(introvert.sections[1].body,/Sだから新しい案を出さない/);
  assert.match(introvert.sections[2].body,/筋道を重視しながら異論を聞く/);
  app.run('sample.impacts.safety.index=20');
  assert.match(app.run('buildMBTIContext(sample,"ISFJ").sections[2].body'),/人への配慮を意識していても/);
});

test('unselected and invalid MBTI fall back to behavior-only results', () => {
  const app=load();fill(app,3);
  const base=JSON.stringify(app.run('buildLeadershipProfile(calc())'));
  for(const invalid of ['',null,undefined,123,'ENTP-A','enfp','ESTX','<script>']){
    const js=invalid===undefined?'undefined':JSON.stringify(invalid);
    assert.equal(app.run(`buildMBTIContext(calc(),${js})`),null);
    assert.equal(JSON.stringify(app.run(`buildLeadershipProfile(calc(),${js})`)),base);
  }
  assert.equal(load({'derailer70MBTI':'invalid'}).run('profile.mbti'),'');
  assert.match(app.run('buildLeadershipProfile(calc(),"ENTP").lead'),/MBTIだけでリーダー像を補って断定せず/);
});

test('changing MBTI persists without changing existing answers, question order or result scores', () => {
  const saved=Object.fromEntries(Array.from({length:70},(_,id)=>[id,(id*7)%5+1]));
  const app=load({'derailer70Answers':JSON.stringify(saved)});
  app.run('renderQuestions();renderResults(calc())');
  const order=app.run('JSON.stringify(ensureQuestionOrder())');
  const results=JSON.stringify(app.run('window._latest'));
  app.run('updateMBTI("ENTP")');
  assert.equal(app.storage.get('derailer70MBTI'),'ENTP');
  assert.equal(app.document.getElementById('mbtiInput').value,'ENTP');
  assert.equal(app.document.getElementById('resultMbtiInput').value,'ENTP');
  assert.equal(JSON.stringify(app.run('window._latest')),results);
  assert.equal(app.run('JSON.stringify(ensureQuestionOrder())'),order);
  assert.equal(app.storage.get('derailer70Answers'),JSON.stringify(saved));
  const resumed=load(Object.fromEntries(app.storage));
  assert.equal(resumed.run('profile.mbti'),'ENTP');
  assert.equal(JSON.stringify(resumed.run('calc()')),results);
  app.run('updateMBTI("not a type")');
  assert.equal(app.storage.get('derailer70MBTI'),'');
  assert.equal(app.document.getElementById('mbtiDetails').classList.contains('hidden'),true);
});

test('JSON export contains the selected MBTI, the exact displayed explanation and original scores', async () => {
  const app=load();fill(app,5);
  app.run('renderResults(calc());updateMBTI("ENTP");downloadJSON()');
  const data=JSON.parse(await app.downloadBlobs[0].text());
  assert.equal(data.version,'Leadership Derailer 70 v2.5');
  assert.equal(data.profile.mbti,'ENTP');
  assert.deepEqual(data.leadershipSummary,JSON.parse(JSON.stringify(app.run('buildLeadershipProfile(window._latest,profile.mbti)'))));
  assert.equal(data.leadershipSummary.lead,app.document.getElementById('summaryCopy').textContent);
  assert.deepEqual(data.results,JSON.parse(JSON.stringify(app.run('calc()'))));
  assert.equal(Object.keys(data.answers).length,70);
});
