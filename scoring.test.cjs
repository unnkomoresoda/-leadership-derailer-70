const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// A minimal DOM keeps scoring/storage checks independent of browser automation.
function load(initialStorage = {}, blockedStorage = false) {
  const storage = new Map(Object.entries(initialStorage));
  const elements = new Map();
  function element() {
    const classes = new Set();
    return {
      value: '', textContent: '', innerHTML: '', style: {}, children: [],
      classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x) },
      addEventListener() {}, setAttribute() {}, removeAttribute() {},
      focus() {}, scrollIntoView() {}, insertAdjacentHTML() {},
      appendChild(child) { this.children.push(child); }
    };
  }
  const document = {
    getElementById(id) { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
    querySelectorAll() { return this.getElementById('questions').children; },
    createElement: element
  };
  const localStorage = {
    getItem(k) { if (blockedStorage) throw Error('blocked'); return storage.get(k) ?? null; },
    setItem(k,v) { if (blockedStorage) throw Error('blocked'); storage.set(k,v); },
    removeItem(k) { if (blockedStorage) throw Error('blocked'); storage.delete(k); }
  };
  const context = vm.createContext({ document, window: {localStorage, scrollTo() {}}, location: {hash: ''}, confirm: () => true, setTimeout() {}, console });
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), context);
  return { run: script => vm.runInContext(script, context), storage, document };
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
