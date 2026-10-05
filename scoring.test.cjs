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
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'type-catalog.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'type-results.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'profile.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'brief.js'), 'utf8'), context);
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
  assert.match(app.run('buildLeadershipBrief(calc()).strength.body'),/1つの強いリーダー像に絞れません/);
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
test('high autonomy with low coaching is not summarized as holding decisions', () => {
  const app=load();fill(app,3);
  app.run('sample=calc();sample.impacts.standards.index=90;sample.impacts.autonomy.index=90;sample.impacts.coaching.index=20');
  assert.match(app.run('buildLeadershipProfile(sample).lead'),/裁量を渡しつつ/);
  assert.doesNotMatch(app.run('buildLeadershipProfile(sample).lead'),/重要な判断は自分で持つ/);
});

test('the short reading changes its meaning and action when the score combination changes', () => {
  const app=load();fill(app,3);
  app.run('sample=calc();sample.factors.skeptical.index=95;sample.impacts.selfcorrect.index=90');
  const receptive=app.run('buildLeadershipBrief(sample)');
  assert.match(receptive.strength.body,/筋の通った指摘は自分にも/);
  app.run('sample.impacts.selfcorrect.index=20');
  const fixed=app.run('buildLeadershipBrief(sample)');
  assert.match(fixed.watch.body,/自分の案だけ検証/);
  assert.equal(fixed.action.key,'selfcorrect');
  assert.notEqual(fixed.strength.body,receptive.strength.body);
  app.run('sample=calc();sample.impacts.autonomy.index=95;sample.impacts.coaching.index=20');
  const delegation=app.run('buildLeadershipBrief(sample)');
  assert.match(delegation.watch.body,/裁量は渡す/);
  assert.doesNotMatch(delegation.watch.body,/判断を引き取る/);
  assert.equal(delegation.action.key,'coaching');
});

test('expanded explanations and advice follow individual score combinations', () => {
 const app=load();fill(app,3);
 app.run('sample=calc();sample.factors.skeptical.index=95;sample.impacts.selfcorrect.index=92;sample.factors.imaginative.index=85;sample.factors.diligent.index=75;sample.impacts.standards.index=92;sample.impacts.safety.index=92;sample.impacts.autonomy.index=67;sample.impacts.coaching.index=67');
 const first=app.run('buildLeadershipBrief(sample)');
 assert.match(first.strength.paragraphs[0].text,/新しい構想.*細部/);
 assert.match(first.watch.body,/苦手という判定ではありません/);
 assert.equal(first.action.key,'autonomy');
 assert.match(first.action.body,/高基準・精密さ75と自走支援67/);
 app.run('sample.impacts.autonomy.index=95;sample.impacts.coaching.index=20');
 const second=app.run('buildLeadershipBrief(sample)');
 assert.equal(second.action.key,'coaching');
 assert.match(second.strength.paragraphs[1].text,/裁量を渡しやすく/);
 assert.match(second.action.body,/すでに渡している裁量/);
 assert.notEqual(first.action.paragraphs[0].text,second.action.paragraphs[0].text);
});

test('all-neutral and endpoint summaries remain complete and safe to copy', () => {
 const app=load();
 for(const mode of ['neutral','low','high']){
  if(mode==='neutral')fill(app,3);
  else app.run(`answers=Object.fromEntries([...derailerQuestions,...impactQuestions].map((q,id)=>[id,q[2]===-1?${mode==='high'?1:5}:${mode==='high'?5:1}]))`);
  app.run('renderResults(calc())');
  const brief=app.run('buildLeadershipBrief(calc())');
  for(const p of [brief.strength,brief.watch,brief.action]){
   assert.ok(p.body.length>30);
   assert.ok(p.paragraphs.length>=1);
   assert.ok(p.paragraphs.every(x=>x.text.length>30));
  }
  const copied=app.run('buildSummary()');
  assert.doesNotMatch(copied,/undefined|NaN|MBTI|今週の1つを、仕事で試す/);
  assert.match(copied,/実際の仕事では、こう伝える/);
  if(mode==='neutral')assert.match(brief.action.body,/特定の弱点を選べない/);
 }
});

test('legacy optional data is ignored while saved 70 answers and order still resume', async () => {
 const answers=Object.fromEntries(Array.from({length:70},(_,id)=>[id,(id*7)%5+1]));
 const order=Array.from({length:70},(_,i)=>69-i);
 const app=load({derailer70Answers:JSON.stringify(answers),derailer70Order:JSON.stringify(order),derailer70MBTI:'ENTP',derailer70Practice:'{"private":"old journal"}',derailer70Name:'確認例'});
 app.run('renderQuestions();renderResults(calc());downloadJSON()');
 assert.equal(app.run('QUESTION_COUNT-missingAnswers().length'),70);
 assert.deepEqual(JSON.parse(app.run('JSON.stringify(ensureQuestionOrder())')),order);
 const data=JSON.parse(await app.downloadBlobs[0].text());
 assert.deepEqual(data.profile,{name:'確認例'});
 assert.deepEqual(data.answers,answers);
 assert.equal(data.version,'Leadership Derailer 70 v2.8');
 assert.equal('practice' in data,false);
 assert.equal('mbti' in data.leadershipSummary,false);
 assert.equal(data.brief.action.paragraphs.length,2);
 assert.doesNotMatch(app.run('buildSummary()'),/ENTP|MBTI|old journal/);
});

test('all 28 unordered pairs are unique and preserve Primary/Secondary order',()=>{
 const app=load();
 assert.equal(app.run('LEADERSHIP_TYPES.length'),28);
 assert.equal(app.run('new Set(LEADERSHIP_TYPES.map(t=>`${t.a}:${t.b}`)).size'),28);
 assert.equal(app.run('new Set(LEADERSHIP_TYPES.map(t=>t.id)).size'),28);
 for(let a=0;a<8;a++)for(let b=a+1;b<8;b++){
  const forward=app.run(`getCombinationType([{name:LEADERSHIP_BASES[${a}].name,fit:88},{name:LEADERSHIP_BASES[${b}].name,fit:81}])`);
  const reverse=app.run(`getCombinationType([{name:LEADERSHIP_BASES[${b}].name,fit:88},{name:LEADERSHIP_BASES[${a}].name,fit:81}])`);
  assert.equal(forward.id,reverse.id);
  assert.notEqual(forward.primary.name,reverse.primary.name);
  assert.equal(forward.primary.fit,88);
 }
 assert.equal(app.run('getCombinationType([{name:"Independent Strategist",fit:92},{name:"Team Multiplier",fit:86}]).id'),'autonomous-strategist');
});
test('every catalog type has complete, individually written mechanisms and working referenced names',()=>{
 const app=load();
 assert.equal(app.run('LEADERSHIP_TYPE_ROWS.every(t=>t[5].length===LEADERSHIP_TYPE_FIELDS.length)'),true);
 assert.equal(app.run('LEADERSHIP_TYPES.every(t=>LEADERSHIP_TYPE_FIELDS.every(k=>typeof t[k]==="string"&&t[k].length>10))'),true);
 for(const key of ['essence','success','pressure','process','derailer','growth'])assert.equal(app.run(`new Set(LEADERSHIP_TYPES.map(t=>t.${key})).size`),28);
 assert.equal(app.run('LEADERSHIP_TYPES.every(t=>[t.cooperate,t.friction].every(s=>LEADERSHIP_TYPES.some(other=>other.id!==t.id&&s.includes(other.jp))))'),true);
 assert.equal(app.run('LEADERSHIP_BASES.every(b=>LEADERSHIP_TYPES.filter(t=>t.a===b.index||t.b===b.index).length===7)'),true);
});
test('all 28 catalog pitfalls use plain Japanese in headings and descriptions',()=>{
 const app=load();
 assert.equal(app.run('LEADERSHIP_TYPES.every(t=>t.derailer.startsWith("最も気をつけたい落とし穴は、"))'),true);
 const catalogSource=fs.readFileSync(path.join(__dirname,'type-catalog.js'),'utf8');
 const rendererSource=fs.readFileSync(path.join(__dirname,'types.js'),'utf8');
 assert.doesNotMatch(catalogSource,/最大のDerailer候補/);
 assert.doesNotMatch(rendererSource,/最大のDerailer候補/);
 assert.match(rendererSource,/\['derailer','最も気をつけたい落とし穴'\]/);
});
test('individual highlights depend on score relationships, not the fixed type',()=>{
 const app=load();fill(app,3);
 const result=app.run('calc()');
 result.factors.skeptical.index=95;result.impacts.selfcorrect.index=100;
 const strong=JSON.parse(JSON.stringify(app.run(`buildPersonalHighlights(${JSON.stringify(result)})`)));
 assert.equal(strong.weapon.id,'question-update');
 assert.equal(strong.weapon.scores.length,2);
 result.impacts.selfcorrect.index=0;
 const low=app.run(`buildPersonalHighlights(${JSON.stringify(result)})`);
 assert.notEqual(low.weapon.id,strong.weapon.id);
 assert.equal(low.risk.id,'one-sided-test');
 assert.notEqual(low.advice.key,strong.advice.key);
 const reversed={...result,typeScores:[...result.typeScores].reverse()};
 assert.deepEqual(JSON.parse(JSON.stringify(app.run(`buildPersonalHighlights(${JSON.stringify(reversed)})`))),JSON.parse(JSON.stringify(low)));
});
test('neutral and extreme highlights are finite and acknowledge non-distinctive answers',()=>{
 const app=load();
 for(const high of [null,false,true]){
  if(high===null)fill(app,3);else app.run(`answers=Object.fromEntries([...derailerQuestions,...impactQuestions].map((q,i)=>[i,q[2]===-1?${high?1:5}:${high?5:1}]))`);
  const h=app.run('buildPersonalHighlights(calc())');
  assert.ok(Number.isFinite(h.weapon.priority));assert.ok(h.risk.priority>=0&&h.risk.priority<=100);
  assert.equal(h.weapon.id,'contextual');assert.equal(h.risk.id,'no-clear-risk');
 }
});
test('result title is the 28-type name and copy/JSON retain original and new layers',async()=>{
 const app=load();fill(app,3);app.run('renderResults(calc());downloadJSON()');
 const type=app.run('getCombinationType(calc().typeScores)');
 assert.equal(app.document.getElementById('summaryTitle').textContent,type.jp);
 assert.equal(app.document.getElementById('typeDetailLink').href,`./types.html#${type.id}`);
 const shareURL=new URL(app.document.getElementById('xShareLink').href);
 assert.equal(shareURL.origin,'https://twitter.com');
 assert.equal(shareURL.pathname,'/intent/tweet');
 assert.ok(shareURL.searchParams.get('text').includes(type.jp));
 assert.equal(shareURL.searchParams.get('url'),'https://unnkomoresoda.github.io/-leadership-derailer-70/');
 assert.ok(!shareURL.href.includes('確認例'));
 assert.ok(!shareURL.href.includes('50%2F100'));
 const copy=app.run('buildSummary()');assert.ok(copy.includes('あなたの場合'));assert.ok(copy.includes(type.jp));assert.ok(copy.includes('最大のリスク'));assert.ok(copy.includes('負荷が高いときの、周囲への伝わり方'));
 const payload=JSON.parse(await app.downloadBlobs[0].text());
 assert.equal(payload.combinationType.id,type.id);assert.equal(Object.keys(payload.results.factors).length,11);assert.equal(Object.keys(payload.results.impacts).length,5);assert.equal(payload.leadershipSummary.sections.length,5);assert.equal(Object.keys(payload.answers).length,70);
 assert.equal(app.document.getElementById('personalContexts').children.length,4);
 assert.equal(app.document.getElementById('personalHighlights').children.length,2);
});
test('printing opens details for the output then restores the previous state',()=>{
 const app=load();
 assert.equal(app.run(`(()=>{const a={open:false},b={open:true};document.querySelectorAll=()=>[a,b];let restore;window.addEventListener=(event,fn)=>{restore=fn};window.print=()=>{};printResults();const opened=a.open&&b.open;restore();return opened&&!a.open&&b.open})()`),true);
});
