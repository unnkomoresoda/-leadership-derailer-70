const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function client(){
 const listeners=new Map(),timers=[],frames=[],storage=new Map(),elements=new Map();
 const element=()=>({textContent:'',classList:{add(){},remove(){}},remove(){this.removed=true}});
 const context=vm.createContext({window:{LEADERSHIP_SHEETS_URL:'https://script.google.com/macros/s/test123/exec',crypto:{randomUUID:()=> 'test-id-123456789'},addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k)},document:{getElementById:id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id)},createElement:element,body:{appendChild:e=>frames.push(e)}},safeGet:(k,f)=>storage.get(k)||f,safeSet:(k,v)=>storage.set(k,v),setTimeout:f=>{timers.push(f);return timers.length},clearTimeout(){},console});
 vm.runInContext(fs.readFileSync(__dirname+'/sheets-sync.js','utf8'),context);
 vm.runInContext('buildSheetResult=()=>({displayName:"テスト",multiplier:50})',context);
 return {send:()=>vm.runInContext('syncSheetResult({})',context),event:e=>listeners.get('message')?.(e),frames,storage,elements,timers};
}
test('only matching nonce and trusted origin can trigger delivery; response confirms storage',()=>{
 const c=client();c.send();const sent=[],peer={postMessage:(...x)=>sent.push(x)};
 const ready={kind:'lens-sheet-ready',nonce:'test-id-123456789'};
 c.event({origin:'https://evil.example',data:ready,source:peer});assert.equal(sent.length,0);
 c.event({origin:'https://n-test-script.googleusercontent.com',data:{...ready,nonce:'wrong'},source:peer});assert.equal(sent.length,0);
 c.event({origin:'https://n-test-script.googleusercontent.com',data:ready,source:peer});assert.equal(sent.length,1);assert.equal(sent[0][0].payload.displayName,'テスト');
 c.event({origin:'https://n-test-script.googleusercontent.com',data:{kind:'lens-sheet-done',nonce:ready.nonce,ok:true},source:{}});assert.equal(c.storage.values().next().value.includes('"saved":true'),false);
 c.event({origin:'https://n-test-script.googleusercontent.com',data:{kind:'lens-sheet-done',nonce:ready.nonce,ok:true},source:peer});assert.equal(c.frames[0].removed,true);
 assert.match(c.elements.get('sheetSaveStatus').textContent,/保存しました/);c.send();assert.equal(c.frames.length,1);
});
test('timeout allows retry with the same result ID',()=>{
 const c=client();c.send();const src=c.frames[0].src;c.timers[0]();assert.match(c.elements.get('sheetSaveStatus').textContent,/確認できません/);c.send();assert.equal(c.frames.length,2);assert.equal(c.frames[1].src,src);
});
function server(){
 const rows=[],lock={waitLock(){},releaseLock(){}},sheet={getMaxColumns:()=>38,getLastRow:()=>rows.length,appendRow:r=>rows.push(r),setFrozenRows(){},getRange(r,c,n,w){return {getValues:()=>[rows[r-1].slice(c-1,c-1+w)],setFontWeight(){return this},setBackground(){return this},setFontColor(){return this},setNumberFormat(){return this},createTextFinder:id=>({matchEntireCell(){return this},findNext:()=>rows.slice(1).some(x=>x[1]===id)})}}};
 const ctx=vm.createContext({LockService:{getScriptLock:()=>lock},SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush(){}},Utilities:{formatDate:()=> '2026-10-06 14:30:00'}});
 vm.runInContext(fs.readFileSync(__dirname+'/google-sheets.gs','utf8'),ctx);
 const payload=vm.runInContext(`({requestId:'test-id-123456789',version:'v2.11',displayName:'=IMPORTXML("x")',typeId:'autonomous-strategist',typeName:'自律型ストラテジスト',primary:'チーム増幅型',secondary:'独立戦略型',primaryFit:80,secondaryFit:79,factors:Object.fromEntries(LENS_FACTORS.map(k=>[k,50])),impacts:Object.fromEntries(LENS_IMPACTS.map(k=>[k,50])),clusters:Object.fromEntries(LENS_CLUSTERS.map(k=>[k,50])),patterns:Object.fromEntries(LENS_PATTERNS.map(k=>[k,50])),multiplier:50,overallDerailer:50,weapon:'武器',risk:'リスク',advice:'助言'})`,ctx);
 return {rows,payload,save:p=>ctx.saveDiagnosis(p)};
}
test('receiver prevents duplicate rows and spreadsheet formula injection',()=>{const s=server();assert.equal(s.save(s.payload).ok,true);assert.equal(s.rows.length,2);assert.equal(s.rows[1].length,38);assert.equal(s.rows[1][3][0],"'");s.save(s.payload);assert.equal(s.rows.length,2);});
test('invalid scores and overlong names cannot write rows',()=>{const s=server();s.payload.factors.bold=101;assert.throws(()=>s.save(s.payload));assert.equal(s.rows.length,0);s.payload.factors.bold=50;s.payload.displayName='x'.repeat(81);assert.throws(()=>s.save(s.payload));assert.equal(s.rows.length,0);});
