/* Collection is separate from scoring. It must never block result display. */
function buildSheetResult(r){
  const type=getCombinationType(r.typeScores),h=buildPersonalHighlights(r);
  return {version:'LEADERSHIP LENS v2.11',displayName:profile.name||'',typeId:type.id,typeName:type.jp,
    primary:r.typeScores[0].jp,secondary:r.typeScores[1].jp,primaryFit:r.typeScores[0].fit,secondaryFit:r.typeScores[1].fit,
    factors:Object.fromEntries(Object.entries(r.factors).map(([k,v])=>[k,v.index])),
    impacts:Object.fromEntries(Object.entries(r.impacts).map(([k,v])=>[k,v.index])),
    clusters:r.clusters,patterns:r.patterns,multiplier:r.multiplier,overallDerailer:r.overallDerailer,
    weapon:h.weapon.title,risk:h.risk.title,advice:h.advice.title};
}
const sheetRequests=new Map();
function syncSheetResult(r){
  const endpoint=window.LEADERSHIP_SHEETS_URL||'';
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint))return;
  const payload=buildSheetResult(r),signature=JSON.stringify(payload),status=document.getElementById('sheetSaveStatus'),retry=document.getElementById('sheetRetryBtn');
  if(sheetRequests.has(signature)){status.textContent=sheetRequests.get(signature).saved?'診断結果を保存しました。':'診断結果を保存しています…';return;}
  let records={};try{const x=JSON.parse(safeGet('leadershipLensSheetReceipts','{}'));if(x&&typeof x==='object'&&!Array.isArray(x))records=x}catch(e){}
  const old=records[signature];
  if(old?.saved){status.textContent='この診断結果は保存済みです。';retry.classList.add('hidden');return;}
  const id=old?.id||(window.crypto?.randomUUID?.()||`lens-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  records[signature]={id,saved:false};safeSet('leadershipLensSheetReceipts',JSON.stringify(Object.fromEntries(Object.entries(records).slice(-20))));
  const frame=document.createElement('iframe');frame.hidden=true;frame.title='診断結果の保存';frame.src=endpoint+'?nonce='+encodeURIComponent(id);frame.referrerPolicy='no-referrer';
  const entry={saved:false};sheetRequests.set(signature,entry);status.textContent='診断結果を保存しています…';retry.classList.add('hidden');
  let peer=null,finished=false;
  const finish=ok=>{
    if(finished)return;finished=true;clearTimeout(timer);window.removeEventListener('message',receive);frame.remove();
    if(ok){entry.saved=true;let latest={};try{const x=JSON.parse(safeGet('leadershipLensSheetReceipts','{}'));if(x&&typeof x==='object'&&!Array.isArray(x))latest=x}catch(e){}latest[signature]={id,saved:true};safeSet('leadershipLensSheetReceipts',JSON.stringify(Object.fromEntries(Object.entries(latest).slice(-20))));}
    else sheetRequests.delete(signature);
    status.textContent=ok?'診断結果を保存しました。':'結果は表示できますが、自動保存を確認できませんでした。';
    if(!ok)retry.classList.remove('hidden');
  };
  function receive(event){
    const data=event.data;
    if(!/^https:\/\/(?:[a-z0-9-]+-script|script|[a-z0-9-]+\.script)\.googleusercontent\.com$/.test(event.origin)||!data||data.nonce!==id)return;
    if(data.kind==='lens-sheet-ready'&&!peer&&event.source){peer=event.source;peer.postMessage({kind:'lens-sheet-save',nonce:id,payload:{...payload,requestId:id}},event.origin);}
    else if(data.kind==='lens-sheet-done'&&event.source===peer&&peer)finish(data.ok===true);
  }
  window.addEventListener('message',receive);const timer=setTimeout(()=>finish(false),45000);document.body.appendChild(frame);retry.onclick=()=>syncSheetResult(r);
}
function updateSheetNotice(){
  const enabled=/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(window.LEADERSHIP_SHEETS_URL||'');
  const note=document.getElementById('sheetCollectionNotice');if(note&&!enabled)note.textContent='表示名と回答は、このブラウザに保存されます。';
}
