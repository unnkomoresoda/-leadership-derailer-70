// A short, behavior-first reading. MBTI and archetype labels do not select it.
function buildLeadershipBrief(r){
  const f=Object.fromEntries(Object.entries(r.factors).map(([k,v])=>[k,v.index]));
  const i=Object.fromEntries(Object.entries(r.impacts).map(([k,v])=>[k,v.index]));
  const evidence=(...keys)=>keys.map(k=>({label:(factorInfo[k]||impactInfo[k]).jp,value:k in f?f[k]:i[k]}));
  const part=(title,body,...keys)=>({title,body,scores:evidence(...keys)});
  const ranked=Object.entries(f).sort((a,b)=>b[1]-a[1]);
  const supports=['autonomy','safety','coaching','selfcorrect'].sort((a,b)=>i[a]-i[b]);
  const high=v=>v>=70,low=v=>v<40;
  let strength,watch,actionKey;
  if(high(f.skeptical)&&high(i.selfcorrect))strength=part('根拠を問い、自分の判断も更新する',
    '前提をそのまま受け取らず、納得できる根拠を探すリーダー像です。筋の通った指摘は自分にも取り入れる回答で、重要な判断の質を上げる場面に持ち味がありそうです。','skeptical','selfcorrect');
  else if(high(i.autonomy)&&high(i.coaching))strength=part('任せながら、成長を支える',
    '自分が答えを出すだけでなく、相手に判断を渡し、習熟するまで支える回答です。メンバーが次回は自分で決められるように関わることが、持ち味として読み取れます。','autonomy','coaching');
  else if(high(f.imaginative))strength=part('新しい可能性を、仕事に持ち込む',
    high(f.diligent)?'新しい構想を考えることと、細部の質を高めることが重なっています。アイデアを出して終わらせず、形にするための条件も詰めたいリーダー像です。':'既存のやり方を問い直し、離れたアイデアを結びつける回答が多めです。行き詰まった仕事に別の選択肢を持ち込む場面で、持ち味が出そうです。','imaginative','diligent');
  else if(high(f.diligent)||high(i.standards))strength=part('仕事の基準を、はっきりさせる',
    high(i.autonomy)?'完成の水準を重視しながら、進め方は相手に任せる回答です。何を達成するかを揃え、方法の違いを活かす関わりが持ち味になりそうです。':'成果や品質に目を向け、仕上がりを曖昧にしない回答です。仕事の期待値や確認点を具体的にして、チームの目線を揃える場面で持ち味が出そうです。','diligent','standards','autonomy');
  else if(high(i.safety))strength=part('異論を聞き、判断の材料を増やす',
    '反対意見や悪い報告を引き出す行動が多めです。周囲が気づいた問題を判断に取り込む関わりが読み取れます。実際に声が上がっているかも確かめてみてください。','safety','selfcorrect');
  else if(ranked[0][1]>=70&&ranked[0][1]>ranked.at(-1)[1]){
    const key=ranked[0][0];strength=part(`${factorInfo[key].jp}を活かして進める`,
      `${factorInfo[key].strength} 今回はこの方向の回答が多めです。どんな仕事でこの持ち味が役立っているかを振り返ってみてください。`,key);
  }else strength=part('場面ごとの関わり方を見つける',
    'この回答だけでは、1つの強いリーダー像に絞れません。任せる・意見を聞く・育てる場面を思い出し、うまくいった関わりを1つ言葉にするところから始めてください。','autonomy','safety','coaching');

  if(high(f.skeptical)&&low(i.selfcorrect)){
    watch=part('相手への問いを、自分の案にも向ける',
      '他者の前提を疑う回答に比べ、自分の判断を更新する行動は少なめです。意見がぶつかったとき、自分の案だけ検証を免れていないかが確認点です。','skeptical','selfcorrect');actionKey='selfcorrect';
  }else if(high(f.diligent)&&low(i.autonomy)){
    watch=part('品質を守ろうとして、判断まで引き取る',
      '細部を詰める回答が多い一方、相手に判断を渡す行動は少なめです。任せた仕事を自分のやり方に直し続けて、相手の判断機会を減らしていないかを確かめてください。','diligent','autonomy');actionKey='autonomy';
  }else if(high(i.autonomy)&&low(i.coaching)){
    watch=part('任せた後の、学ぶ時間が足りなくなる',
      '裁量は渡す一方、基準を説明して習熟を待つ行動は少なめです。任せた相手が迷っているとき、必要な支援まで手放していないかを確認してみてください。','autonomy','coaching');actionKey='coaching';
  }else if(high(i.standards)&&low(i.coaching)){
    watch=part('期待の高さに、習熟の時間が追いつかない',
      '成果への要求に比べ、相手の習熟を待つ行動は少なめです。仕事が遅いと感じたとき、見切る前に判断基準と再提案の機会を渡せているかが確認点です。','standards','coaching');actionKey='coaching';
  }else if(i[supports[0]]<40){
    actionKey=supports[0];
    const checks={autonomy:['任せたはずの仕事が、自分に戻ってくる','判断を渡す行動の回答は少なめです。忙しいとき、重要な決定を自分が抱え込みやすくなっていないかを振り返ってください。'],safety:['悪い知らせが、後から届く','異論や失敗報告を引き出す行動の回答は少なめです。報告を受けた最初の返答で、相手が話し続けられているかを見てください。'],coaching:['説明を急いで、学ぶ機会を飛ばす','習熟を待つ行動の回答は少なめです。すぐに自分で直したくなる場面で、相手が次回も判断できる説明になっているかを確かめてください。'],selfcorrect:['前提が変わっても、判断が残る','自分の判断を更新する行動の回答は少なめです。何が分かったら判断を変えるかを、決める前に言葉にできているかが確認点です。']};
    watch=part(...checks[actionKey],actionKey);
  }else if(Math.min(i.safety,i.selfcorrect)-Math.max(i.autonomy,i.coaching)>=20){
    watch=part('聞く姿勢を、任せる行動につなげる',
      '意見を聞く・判断を更新する行動に比べ、任せる・習熟を待つ行動は控えめです。苦手という判定ではありません。相手の意見を採用した後、実行の判断も渡せているかを確かめてください。','safety','selfcorrect','autonomy','coaching');actionKey=i.autonomy<=i.coaching?'autonomy':'coaching';
  }else if(ranked[0][1]>=70&&ranked[0][1]>ranked.at(-1)[1]){
    actionKey=ranked[0][0];watch=part('得意な進め方が、強く出すぎるとき',
      `${factorInfo[actionKey].watch} 特に忙しい日や意見が対立した場面で、実際に起きているか確かめてください。`,actionKey);
  }else{
    watch=part('忙しい日に、関わり方が変わるとき',
      'この回答から特定の落とし穴を強く決めつける必要はありません。余裕のある日と忙しい日で、任せる範囲や相談への返答が変わっていないかを見てみてください。','autonomy','coaching');actionKey='autonomy';
  }
  const candidates=[actionKey,...supports,...ranked.filter(([,v])=>v>=70).map(([k])=>k)];
  const actions=[...new Set(candidates)].slice(0,5).map(key=>({key,title:actionLibrary[key][0],body:actionLibrary[key][1]}));
  return {strength,watch,action:actions[0],actions};
}
function leadershipBriefText(brief){
  return [['あなたの持ち味',brief.strength],['空回りしやすい場面',brief.watch],['今週試すこと1つ',brief.action]].map(([label,p])=>`${label}：${p.title}\n${p.body}${p.scores?'\n'+p.scores.map(s=>`${s.label} ${s.value}/100`).join(' / '):''}`).join('\n\n');
}
function renderLeadershipBrief(r){
  const brief=buildLeadershipBrief(r);
  document.getElementById('summaryTitle').textContent=brief.strength.title;
  const root=document.getElementById('briefCards');root.innerHTML='';
  [['あなたの持ち味',brief.strength],['空回りしやすい場面',brief.watch],['今週試すこと1つ',brief.action]].forEach(([label,p],n)=>{
    const card=document.createElement('section');card.className='brief-card';
    const labelEl=document.createElement('div');labelEl.className='kicker';labelEl.textContent=`0${n+1}  ${label}`;card.appendChild(labelEl);
    const title=document.createElement('h3');title.textContent=p.title;card.appendChild(title);
    const body=document.createElement('p');body.textContent=p.body;card.appendChild(body);
    if(p.scores){const note=document.createElement('p');note.className='brief-evidence';note.textContent=p.scores.map(s=>`${s.label} ${s.value}/100`).join(' ・ ');card.appendChild(note)}
    root.appendChild(card);
  });
  return brief;
}
