// Additive interpretation only: never changes answers or calc().
function buildPersonalHighlights(r){
 const f=Object.fromEntries(Object.entries(r.factors).map(([k,v])=>[k,v.index]));
 const i=Object.fromEntries(Object.entries(r.impacts).map(([k,v])=>[k,v.index]));
 const value=k=>k in f?f[k]:i[k];
 const evidence=keys=>keys.map(k=>({key:k,label:(factorInfo[k]||impactInfo[k]).jp,value:value(k)}));
 const strength=(id,title,body,keys)=>({id,title,body,scores:evidence(keys),priority:Math.min(...keys.map(value))});
 const weapons=[
  strength('question-update','「疑う力」と「考えを変える力」の両立','前提を点検する回答と、自分の判断を更新する回答がともに高めです。相手の案だけでなく自分の案にも問いを向け、重要な判断の質を上げられる可能性があります。',['skeptical','selfcorrect']),
  strength('delegate-grow','「判断を渡す」と「成長を待つ」の両立','裁量を渡す行動と、本人が学ぶまで支える行動がともに高めです。今の実行だけでなく、次回は本人が判断できる状態を作る持ち味につながりそうです。',['autonomy','coaching']),
  strength('invent-build','新しい構想を、使える形まで詰める力','独創的な案を考える方向と、細部の精度を高める方向が重なっています。新しい仕組みを作る仕事で、発想と完成条件を往復できる可能性があります。',['imaginative','diligent']),
  strength('demand-delegate','高い期待と、方法の裁量を両立する力','成果への要求と、本人に判断を渡す行動がともに高めです。完成の条件は揃え、方法には別の正解を認める関わりが持ち味になりそうです。',['standards','autonomy']),
  strength('hear-update','異論を集め、判断へ取り込む力','反対意見や悪い報告を聞く行動と、判断を更新する行動がともに高めです。周囲の情報が結論を変える材料になる関わりが読み取れます。',['safety','selfcorrect']),
  strength('caution-update','下振れを見ながら、前提を修正する力','慎重に影響を点検する方向と、判断を更新する行動が重なっています。不安を抱えて止まるより、何が分かれば進めるかを整える場面で活かせる可能性があります。',['cautious','selfcorrect']),
  strength('signal-listen','場を動かしながら、異論を聞く力','発言で場を進める方向と、反対意見を聞く行動がともに高めです。メッセージを届ける力を、他者の根拠で磨く関わりが持ち味になりそうです。',['colorful','safety'])
 ].sort((a,b)=>b.priority-a.priority);
 const all=Object.values({...f,...i}),flat=Math.max(...all)-Math.min(...all)<=10;
 let weapon=weapons[0];
 if(flat||weapon.priority<70)weapon={id:'contextual',title:'場面による持ち味を、まだ一つに絞らない',body:'今回の回答だけでは、複数の傾向がともに高い「最大の武器」を強く選べません。下の個人解説を、うまく進んだ具体的な仕事と照らして読んでください。中間の得点は、弱さの判定ではありません。',scores:weapons[0].scores,priority:weapons[0].priority};
 else if(weapons[1]?.priority===weapon.priority)weapon={...weapon,body:weapon.body+' 同じ優先度の候補もあり、これだけが持ち味という意味ではありません。'};
 const risk=(id,title,body,keys,priority)=>({id,title,body,scores:evidence(keys),priority:Math.max(0,Math.min(100,priority))});
 const risks=[
  risk('one-sided-test','他者への点検が、自分の案には向かなくなる可能性','警戒・懐疑に比べ、自分の判断を更新する行動が少ない組み合わせです。反対意見が出たとき、自分の案だけ検証を免れていないかが確認ポイントです。',['skeptical','selfcorrect'],(f.skeptical+100-i.selfcorrect)/2),
  risk('quality-control','品質を守るために、判断まで引き取る可能性','細部を詰める方向と、判断を渡す行動の少なさを組み合わせています。完成条件から外れたのか、自分と方法が違うだけなのかを分けて確かめてください。',['diligent','autonomy'],r.patterns.micromanage),
  risk('pace-gap','判断速度に、周囲の成長速度が追いつかなくなる可能性','成果基準と感情反応、任せる行動と習熟を待つ行動の関係を見ています。未達が出たとき、学ぶ時間を減らして自分で引き取っていないかが確認ポイントです。支援の得点が高い場合は、支援不足と決めつけず、その場の反応がどう伝わったかを見ます。',['standards','excitable','autonomy','coaching'],i.standards*.30+f.excitable*.25+(100-i.autonomy)*.225+(100-i.coaching)*.225),
  risk('hear-handoff','「聞く姿勢」が、実際の判断権へつながりにくい可能性','異論を聞く・自分を修正する行動に比べ、任せる・育成する行動が控えめな組み合わせです。苦手の判定ではありません。意見を採用した後に、実行の判断も本人へ渡せているかを確認してください。',['safety','selfcorrect','autonomy','coaching'],50+Math.min(i.safety,i.selfcorrect)-Math.max(i.autonomy,i.coaching)),
  risk('unsupported-autonomy','裁量に対して、学ぶための支援が足りなくなる可能性','任せる行動に比べ、基準を説明して習熟を待つ行動が少ない組み合わせです。自分なりに進められる人と、まだ基準を学ぶ人で支援を変えられているかが確認ポイントです。',['autonomy','coaching'],(i.autonomy+100-i.coaching)/2),
  risk('voice-crowding','場を動かす発言が、他者の情報を減らす可能性','存在感と、異論を引き出す行動の関係を見ています。話す速さや量で相手の時間を埋め、反対がない状態を合意と見なしていないかを確かめてください。',['colorful','safety'],(f.colorful+100-i.safety)/2),
  risk('solo-dependency','成果を支えるほど、自分への依存が強まる可能性','成果基準、自己確信、説明の距離感に対し、任せる・育成する行動がどう重なるかを見ています。自分の不在時にも判断が進むかが確認ポイントです。',['standards','bold','reserved','autonomy','coaching'],r.patterns.lonehero)
 ].sort((a,b)=>b.priority-a.priority);
 let selected=risks[0];
 if(flat||selected.priority<60)selected={id:'no-clear-risk',title:'突出したリスクに、一つで決めつけない',body:'候補となる組み合わせに強い差がないため、最大のリスクを断定しません。忙しい日の説明、任せる範囲、反対意見への返答を、余裕のある日と比べてください。下の「空回りしやすい場面」が具体的な確認の手がかりです。',scores:selected.scores,priority:selected.priority};
 return {weapon,risk:selected,advice:buildLeadershipBrief(r).action,method:'複数得点の関係から選ぶ独自の振り返りルール。問題の発生確率や能力順位ではありません。'};
}
function appendScoreEvidence(root,scores){
 const p=document.createElement('p');p.className='brief-evidence';p.textContent=scores.map(x=>`${x.label} ${x.value}/100`).join(' × ');root.appendChild(p);
}
function renderTypeLayers(r){
 const type=getCombinationType(r.typeScores),highlights=buildPersonalHighlights(r),report=buildLeadershipProfile(r),team=type.team;
 const badge=document.getElementById('leaderTeamBadge');badge.textContent=`${team.jp} · ${team.en}`;badge.href=`./types.html#team-${team.id}`;badge.setAttribute('data-team',team.id);
 document.getElementById('leaderTypeHero').setAttribute('data-team',team.id);
 document.getElementById('summaryTitle').textContent=type.jp;
 document.getElementById('typeEnglish').textContent=type.en;
 document.getElementById('typeBases').textContent=type.bases.map(x=>x.jp).join(' × ');
 document.getElementById('typeCatch').textContent=type.theme;
 let portrait=document.getElementById('leaderResultImage');if(!portrait){portrait=document.createElement('img');portrait.id='leaderResultImage';portrait.className='leader-result-image';portrait.width=900;portrait.height=900;portrait.decoding='async';document.getElementById('typeCatch').after(portrait);}
 portrait.src=`./leader-${type.id}.webp?v=2.13.0`;portrait.alt=`${team.jp}の${type.jp}を表すキャラクター：${type.theme}`;
 const link=document.getElementById('typeDetailLink');link.href=`./types.html#${type.id}`;link.textContent=`${type.jp}を詳しく見る →`;
 document.getElementById('xShareLink').href=buildXShareURL(type);
 const boundary=r.typeScores[1].fit-r.typeScores[2].fit;
 document.getElementById('typeBasisNote').textContent=`Primary：${type.primary.jp}（類似度 ${type.primary.fit}/100）／Secondary：${type.secondary.jp}（${type.secondary.fit}/100）。${type.gap<4||boundary<4?'上位の差が小さく、別の組み合わせにも近い回答です。同点は元データの順で表示します。':'これは回答が近いリーダー像で、固定した性格分類ではありません。'}類似度は所属確率・偏差値ではありません。`;
 const contexts=document.getElementById('personalContexts');contexts.innerHTML='';
 report.sections.slice(0,4).forEach(part=>{const detail=document.createElement('details');detail.className='disclosure personal-context';const summary=document.createElement('summary');summary.textContent=part.title;detail.appendChild(summary);const body=document.createElement('div');body.className='disclosure-body';appendScoreEvidence(body,part.scores);const p=document.createElement('p');p.textContent=part.body;body.appendChild(p);detail.appendChild(body);contexts.appendChild(detail)});
 const root=document.getElementById('personalHighlights');root.innerHTML='';
 [['あなたの最大の武器',highlights.weapon],['あなたの最大のリスク',highlights.risk]].forEach(([label,part])=>{const card=document.createElement('section');card.className='card highlight-card';const k=document.createElement('div');k.className='kicker';k.textContent=label;card.appendChild(k);const h=document.createElement('h3');h.textContent=part.title;card.appendChild(h);const p=document.createElement('p');p.textContent=part.body;card.appendChild(p);appendScoreEvidence(card,part.scores);root.appendChild(card)});
 return {type,highlights};
}
function buildTypeSharePageURL(type){
 const site='https://unnkomoresoda.github.io/-leadership-derailer-70/';
 return type&&LEADERSHIP_TYPES.some(entry=>entry.id===type.id)?`${site}share/${type.id}.html`:site;
}
function buildXShareURL(type){
 const message=`LEADERSHIP LENS｜私のリーダータイプは「${type.jp}」。70問のセルフチェックで、仕事での関わり方を振り返りました。`;
 const site=buildTypeSharePageURL(type);
 return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(site)}`;
}
function combinationResultText(r){
 const type=getCombinationType(r.typeScores),p=buildPersonalHighlights(r),text=x=>`${x.title}\n${x.body}\n${x.scores.map(s=>`${s.label} ${s.value}/100`).join(' × ')}`;
 return `あなたのリーダータイプ：${type.jp}\n${type.team.jp} / ${type.team.en}\n${type.en}\n${type.bases.map(x=>x.jp).join(' × ')}\n${type.theme}\nPrimary：${type.primary.jp} ${type.primary.fit}/100\nSecondary：${type.secondary.jp} ${type.secondary.fit}/100\n類似度は所属確率ではありません。タイプは理解のための骨格で、個人分析は70問の得点で変わります。\n図鑑：https://unnkomoresoda.github.io/-leadership-derailer-70/types.html#${type.id}\n\nあなたの場合\n最大の武器\n${text(p.weapon)}\n\n最大のリスク\n${text(p.risk)}\n${p.method}`;
}
function printResults(){
 const closed=[...document.querySelectorAll('#results details')].filter(x=>!x.open);
 closed.forEach(x=>x.open=true);
 const restore=()=>closed.forEach(x=>x.open=false);
 window.addEventListener('afterprint',restore,{once:true});
 try{window.print()}catch(error){restore();throw error}
}
