// Web App: execute as owner; access Anyone. No data-reading API.
const LENS_SHEET_ID='10WGbfdflIQoN93z8G_DkQfNbgZeLcdgIHP1b27p469g';
const LENS_ORIGIN='https://unnkomoresoda.github.io';
const LENS_TAB='診断結果';
const LENS_FACTORS=['excitable','skeptical','cautious','reserved','leisurely','bold','mischievous','colorful','imaginative','diligent','dutiful'];
const LENS_IMPACTS=['standards','autonomy','safety','coaching','selfcorrect'];
const LENS_CLUSTERS=['away','against','toward'];
const LENS_PATTERNS=['impatient','brilliantjerk','micromanage','lonehero'];
const LENS_HEADERS=['保存日時（日本時間）','結果ID','診断バージョン','表示名','28タイプID','28タイプ名','Primary','Secondary','Primary類似度','Secondary類似度','感情反応','警戒・懐疑','慎重さ','距離・非情動','内的抵抗','自己確信','リスク選好','存在感','発想の飛躍','高基準・精密さ','上位者への適応','成果基準','自走支援','心理的安全性','育成・忍耐','自己修正','距離を取る反応','押し返す反応','合わせる反応','高基準・低忍耐','高基準と対人摩擦','マイクロマネジメント化','一人エース依存','チーム支援指数','行動傾向平均','最大の武器','最大のリスク','アドバイス'];
function doGet(e){
  const nonce=String(e&&e.parameter&&e.parameter.nonce||'');
  if(!/^[a-zA-Z0-9-]{12,80}$/.test(nonce))return HtmlService.createHtmlOutput('LEADERSHIP LENS result receiver');
  const html='<!doctype html><html><head><meta charset="utf-8"></head><body><script>'+ 
    'const nonce='+JSON.stringify(nonce)+',origin='+JSON.stringify(LENS_ORIGIN)+';let started=false;'+
    'function done(ok){window.top.postMessage({kind:"lens-sheet-done",nonce,ok},origin)}'+
    'window.addEventListener("message",function(e){if(started||e.origin!==origin||e.source!==window.top||!e.data||e.data.kind!=="lens-sheet-save"||e.data.nonce!==nonce)return;started=true;google.script.run.withSuccessHandler(function(r){done(r&&r.ok===true)}).withFailureHandler(function(){done(false)}).saveDiagnosis(e.data.payload)});'+
    'window.top.postMessage({kind:"lens-sheet-ready",nonce},origin);</script></body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function score_(v){if(!Number.isInteger(v)||v<0||v>100)throw new Error('Invalid score');return v;}
function text_(v,max,optional){if(typeof v!=='string'||v.length>max||(!optional&&!v.length))throw new Error('Invalid text');return /^[=+\-@\t\r\n]/.test(v)?"'"+v:v;}
function resultRow_(p){
  if(!p||JSON.stringify(p).length>12000||!/^[a-zA-Z0-9-]{12,80}$/.test(p.requestId))throw new Error('Invalid result');
  if(!/^[a-z-]{3,70}$/.test(p.typeId))throw new Error('Invalid type');
  const values=(group,keys)=>keys.map(k=>score_(p[group]&&p[group][k]));
  return [Utilities.formatDate(new Date(),"Asia/Tokyo","yyyy-MM-dd HH:mm:ss"),p.requestId,text_(p.version,50),text_(p.displayName,80,true),p.typeId,text_(p.typeName,80),text_(p.primary,80),text_(p.secondary,80),score_(p.primaryFit),score_(p.secondaryFit),...values('factors',LENS_FACTORS),...values('impacts',LENS_IMPACTS),...values('clusters',LENS_CLUSTERS),...values('patterns',LENS_PATTERNS),score_(p.multiplier),score_(p.overallDerailer),text_(p.weapon,200),text_(p.risk,200),text_(p.advice,200)];
}
function saveDiagnosis(p){
  const row=resultRow_(p),lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    const book=SpreadsheetApp.openById(LENS_SHEET_ID),sheet=book.getSheetByName(LENS_TAB)||book.insertSheet(LENS_TAB);
    if(sheet.getMaxColumns()<LENS_HEADERS.length)sheet.insertColumnsAfter(sheet.getMaxColumns(),LENS_HEADERS.length-sheet.getMaxColumns());
    if(sheet.getLastRow()===0){sheet.appendRow(LENS_HEADERS);sheet.setFrozenRows(1);sheet.getRange(1,1,1,LENS_HEADERS.length).setFontWeight('bold').setBackground('#eeeeee').setFontColor('#000000');}
    const headers=sheet.getRange(1,1,1,LENS_HEADERS.length).getValues()[0];
    if(JSON.stringify(headers)!==JSON.stringify(LENS_HEADERS))throw new Error('Header mismatch: existing data preserved');
    const last=sheet.getLastRow();
    if(last>1&&sheet.getRange(2,2,last-1,1).createTextFinder(p.requestId).matchEntireCell(true).findNext())return {ok:true};
    sheet.appendRow(row);sheet.getRange(sheet.getLastRow(),1).setNumberFormat('yyyy-mm-dd hh:mm:ss');SpreadsheetApp.flush();return {ok:true};
  }finally{lock.releaseLock();}
}
