// A behavior-first reading: the actual scores and their relationships select it.
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
  return expandLeadershipBrief({strength,watch,actionKey},f,i,evidence);
}
function expandLeadershipBrief(base,f,i,evidence){
  const high=v=>v>=70,low=v=>v<40;
  const neutral=[...Object.values(f),...Object.values(i)].every(v=>v===50);
  const degree=v=>v>=85?'特に多い':v>=70?'多めの':v>=40?'中間付近の':v>=15?'少なめの':'かなり少ない';
  const paragraph=(label,text,...keys)=>({label,text,scores:evidence(...keys)});
  const strength=base.strength,watch=base.watch,key=base.actionKey;

  let work;
  if(high(f.imaginative)&&high(f.diligent))work=`発想の飛躍${f.imaginative}と高基準・精密さ${f.diligent}が重なり、新しい構想を出すことと、形にするために細部を詰めることの両方に向かう回答です。${high(i.standards)?`成果基準も${i.standards}と高めで、案の面白さだけでなく、完成度やスピードも求める進め方が読み取れます。`:`成果基準は${i.standards}なので、細部へのこだわりと、チーム全体への要求の強さは分けて見ると特徴がつかめます。`}`;
  else if(high(f.imaginative))work=`発想の飛躍${f.imaginative}に対し、高基準・精密さは${f.diligent}です。${high(f.mischievous)?`リスク選好も${f.mischievous}と高めなので、案を思いつくことから試すことまで、動きが速くなる組み合わせです。`:`リスク選好は${f.mischievous}で、新しい案を考えることと、検証前に動くことは同じ強さではありません。`}構想の意図を、相手が着手できる最初の一歩まで言葉にすると、発想が仕事につながりやすくなります。`;
  else if(high(f.cautious)&&high(f.mischievous))work=`慎重さ${f.cautious}とリスク選好${f.mischievous}がともに高めです。下振れを確かめたい動きと、魅力的な機会には踏み出したい動きが同居しています。案件の重要度や興味によって判断速度が変わる場面があるかを振り返ると、あなたの使い分けが見えてきます。`;
  else if(high(f.diligent)||high(i.standards))work=`高基準・精密さ${f.diligent}、成果基準${i.standards}という組み合わせです。${high(f.diligent)&&high(i.autonomy)?`自走支援も${i.autonomy}と高く、品質を重視しながら方法は相手に任せる方向が読み取れます。`:high(f.diligent)&&low(i.autonomy)?`自走支援${i.autonomy}との違いから、品質を守るために自分で確認・修正する場面が多い可能性があります。`:'完成の条件を揃え、曖昧な仕上がりを減らす場面で、この方向を活かせそうです。'}基準を求める強さと、基準を相手に伝えられているかは、分けて確かめてみてください。`;
  else work=`発想の飛躍${f.imaginative}、高基準・精密さ${f.diligent}、成果基準${i.standards}です。${neutral?'すべて中間の回答なので、「構想型」「品質重視型」と固定せず、仕事による違いを見てください。':high(f.cautious)?`慎重さ${f.cautious}は高めで、新しい案を押し出すことより、判断の条件や安全性を揃える場面に特徴が出そうです。`:'この3項目だけで1つの進め方に決めるより、新しい案を出す仕事と、決まった仕事を仕上げるときの関わりを比べてみてください。'}`;
  const workKeys=high(f.cautious)&&high(f.mischievous)&&!high(f.imaginative)?['cautious','mischievous']:['imaginative','diligent','standards'];
  if(high(f.imaginative)&&!high(f.diligent))workKeys.push('mischievous');
  if(high(f.diligent)||high(i.standards))workKeys.push('autonomy');
  if(high(f.cautious)&&!workKeys.includes('cautious'))workKeys.push('cautious');

  let relationship;
  if(high(i.autonomy)&&high(i.coaching))relationship=`自走支援${i.autonomy}と育成・忍耐${i.coaching}はともに高めです。進め方を任せるだけでなく、本人が判断できるようになるまで関わる回答で、メンバーの成長と日々の実行を両立させる持ち味が読み取れます。`;
  else if(high(i.autonomy)&&low(i.coaching))relationship=`自走支援${i.autonomy}は高く、育成・忍耐${i.coaching}は少なめです。自分なりに進められる人には裁量を渡しやすく、まだ基準を学んでいる相手には、支え方の工夫が必要になる組み合わせです。`;
  else if(low(i.autonomy)&&high(i.coaching))relationship=`育成・忍耐${i.coaching}は高い一方、自走支援${i.autonomy}は少なめです。丁寧に教えることが持ち味になりやすく、その先で本人が決める範囲を広げることが、次の成長機会になりそうです。`;
  else relationship=`自走支援${i.autonomy}は${degree(i.autonomy)}回答、育成・忍耐${i.coaching}は${degree(i.coaching)}回答です。${Math.min(i.safety,i.selfcorrect)-Math.max(i.autonomy,i.coaching)>=20?`意見を聞く心理的安全性${i.safety}や自己修正${i.selfcorrect}に比べると、裁量を渡すことや習熟を待つことには場面による差がありそうです。`:low(i.autonomy)&&low(i.coaching)?'自分で判断・対応して進める場面が多いかを確かめると、仕事を引き受ける力と、チームへの渡し方を整理できます。':'相手の経験や期限に応じて、任せる場面と自分が関わる場面を使い分けているかを振り返ってみてください。'}`;
  strength.paragraphs=[paragraph('仕事の進め方',work,...workKeys),paragraph('周囲への関わり',relationship,'autonomy','coaching','safety','selfcorrect')];
  strength.advice=high(f.skeptical)&&high(i.selfcorrect)?'問いを向ける前に「今の案で良いと思う点」と「一緒に確かめたい前提」を1つずつ伝えてみてください。厳しく点検する姿勢に、相手と判断を作る意図が加わりやすくなります。':high(f.imaginative)?'新しい案を出すときに「何を変える案か・何を変えないか・最初に試す範囲」を添えてみてください。相手があなたの発想を、自分の仕事として受け取りやすくなります。':high(i.autonomy)&&high(i.coaching)?'任せる前に相手の考えを聞き、すでに判断できる部分は任せ、迷う部分だけ一緒に整理してみてください。相手の習熟に合わせて支援の量を変えると、任せる力を活かしやすくなります。':high(f.diligent)||high(i.standards)?'完成の条件を3つ以内で先に共有してみてください。自分の頭の中にある品質基準を、メンバーも使える判断材料にすることが、持ち味を伝える助けになります。':'最近うまく進んだ仕事を1つ選び、自分が何をしたことで相手が動きやすくなったかを言葉にしてみてください。今回の回答と照らすと、実際に役立っている関わりを見つけやすくなります。';

  const pressures=[['excitable',f.excitable],['reserved',f.reserved],['colorful',f.colorful],['leisurely',f.leisurely]].sort((a,b)=>b[1]-a[1]);
  const pronounced=pressures.filter(([,v])=>high(v));
  const pressureDescriptions={
    excitable:`感情反応${f.excitable}は高めで、期待が外れたときに評価や態度を変える動きが出やすい回答です。${high(i.coaching)?'育成を支える回答も高いので、支える姿勢と、その場の失望が相手にどう伝わるかを分けて見てください。':'成果への評価を、相手そのものへの評価に広げていないかが確認点です。'}`,
    reserved:`距離・非情動${f.reserved}は高めです。${high(i.safety)?`心理的安全性${i.safety}も高いので、普段は異論を聞いていても、忙しいときに背景の説明が短くなることがないかを確かめてください。`:'一人で考えて結論を出す場面で、周囲に理由や期待も伝わっているかが確認点です。'}`,
    colorful:`存在感${f.colorful}は高めで、発言で場を前進させる方向があります。${high(i.safety)?`異論を聞く行動${i.safety}も高いため、聞くつもりでいても発言量で相手の時間を埋めていないかを見てください。`:'議論を引き取る前に、相手が考えを話し終える余地があるかを確認してみてください。'}`,
    leisurely:`内的抵抗${f.leisurely}は高めです。納得できない依頼をいったん受け、後で自分のやり方に戻す場面があるかを振り返ってください。合意前に懸念と条件を伝えると、基準を守りながら相手との認識を揃えやすくなります。`
  };
  let pressure=pronounced.length?pronounced.slice(0,2).map(([k])=>pressureDescriptions[k]).join(' '):high(f.skeptical)&&f.skeptical-Math.max(f.excitable,f.reserved)>=20?`警戒・懐疑${f.skeptical}に対し、感情反応は${f.excitable}、距離・非情動は${f.reserved}です。前提を厳しく点検することが、そのまま態度の大きな変化や説明の省略になるとは限らない組み合わせです。問いの内容だけでなく、相手が「一緒に検討している」と受け取れているかに目を向けてみてください。`:`感情反応${f.excitable}、距離・非情動${f.reserved}、存在感${f.colorful}、内的抵抗${f.leisurely}には70以上の項目がありません。これだけで負荷時の反応を強く決めつけず、忙しい日と余裕のある日で、説明や返答がどう変わるかを比べてみてください。`;
  const pressureKeys=pronounced.length?pronounced.slice(0,2).map(([k])=>k):['excitable','reserved','colorful','leisurely'];
  if(pronounced.some(([k])=>['reserved','colorful'].includes(k)))pressureKeys.push('safety');
  if(pronounced.some(([k])=>k==='excitable'))pressureKeys.push('coaching');
  if(!pronounced.length&&high(f.skeptical))pressureKeys.push('skeptical');
  const checks=[];
  if(high(f.bold))checks.push(high(i.selfcorrect)?`自己確信${f.bold}と自己修正${i.selfcorrect}が高く、決める自信と見直す姿勢が同居しています。反対の情報が出た場面で、判断を変えた理由まで共有できているかを見てください。`:`自己確信${f.bold}に対して自己修正は${i.selfcorrect}です。自信を持って決めた案ほど、何が分かったら見直すかを先に置くと、助言を検討しやすくなります。`);
  if(high(f.dutiful))checks.push(`上位者への適応${f.dutiful}は高めです。メンバーには率直に意見を言えても、上位者には懸念を控える場面がないかを確かめてください。`);
  else if(low(f.dutiful)&&high(f.bold))checks.push(`上位者への適応${f.dutiful}は少なめなので、独立して決める際の理由と、関係者への共有のタイミングも確認点になります。`);
  if(high(f.cautious)&&!high(f.mischievous))checks.push(`慎重さ${f.cautious}は高めです。重要な判断を丁寧に扱う一方、小さく戻せる判断まで同じ量の情報を待っていないかを見てください。`);
  watch.paragraphs=[paragraph('負荷がかかったとき',pressure,...pressureKeys)];
  if(checks.length)watch.paragraphs.push(paragraph('あなたの場合に確かめたいこと',checks.slice(0,2).join(' '),...[...(high(f.bold)?['bold','selfcorrect']:[]),...((high(f.dutiful)||low(f.dutiful)&&high(f.bold))?['dutiful']:[]),...(high(f.cautious)&&!high(f.mischievous)?['cautious']:[])]));
  watch.advice=key==='autonomy'?'途中で手を出したくなったら、「完成条件から外れているのか、自分と方法が違うだけなのか」を一度分けてみてください。条件を満たしている範囲では、本人に次の判断を戻す問いが役立ちます。':key==='coaching'?'伝わらないと感じたときは、同じ説明を繰り返す前に、相手がどの基準で考えたかを聞いてみてください。理解が止まっている箇所に合わせて説明すると、相手の判断機会を保ちやすくなります。':key==='selfcorrect'?'反論を受けたら、賛否を決める前に「その情報が正しければ、自分の案のどこが変わるか」を一度言葉にしてみてください。相手を点検する姿勢を、自分の案にも向ける助けになります。':key==='safety'?'悪い報告を聞いた最初の一言を「早く知らせてくれてありがとう」にしてみてください。その後で、起きた事実と次に必要な判断を一緒に整理します。':actionLibrary[key][1];

  const advice={
    autonomy:{reason:high(f.diligent)?`高基準・精密さ${f.diligent}と自走支援${i.autonomy}を合わせて読むと、品質への目線を相手が使える基準に変えることが助言の焦点です。${i.autonomy>=40?'任せる力がないという意味ではありません。どこまで本人が決めるかを、案件ごとに明確にする工夫です。':'確認する場所を先に決めると、細部のたびに判断を引き取る場面を減らせそうです。'}`:`自走支援${i.autonomy}と育成・忍耐${i.coaching}から、本人が決める範囲と、助けを求める条件を揃えることを提案します。${neutral?'得点から特定の弱点を選べないため、実際の場面で自分の関わりを確かめるための例です。':'相手にすべて任せきる必要はなく、判断権と相談の機会を一緒に渡す工夫です。'}`,say:'「完成の条件はこの3つです。進め方はあなたが決めてください。この条件に届かない見込みになったら相談しましょう。まず、どう進めたいですか？」',observe:'本人から進め方や選択肢が出るか、自分の確認なしでも次の一歩に進めるかを見てみてください。品質が下がる場合は、判断をすべて戻す前に、基準や相談の条件を補います。',keys:['diligent','autonomy','coaching']},
    coaching:{reason:`育成・忍耐${i.coaching}と自走支援${i.autonomy}の組み合わせから、${high(i.autonomy)?'すでに渡している裁量を活かせるよう、判断基準と相談機会を添えることを提案します。':high(i.standards)?`成果基準${i.standards}という期待を、相手が段階的に満たせる説明にすることを提案します。`:'相手が次も自分で判断できるように、考える基準を一緒に確かめることを提案します。'}`,say:'「今回は、何を基準にその案を選びましたか？ 私が見ている条件はこの2つです。それを踏まえると、次はどう変えられそうですか？」',observe:'同じ指示への返答より、次の案件で本人が基準を説明して提案できるかを見てみてください。難しければ、説明量を増やすだけでなく、最初に任せる範囲を小さくして支え方を調整します。',keys:['coaching','autonomy','standards']},
    selfcorrect:{reason:`自己修正${i.selfcorrect}に対し、警戒・懐疑${f.skeptical}、自己確信${f.bold}という回答です。相手の案を検証するときと同じように、自分の案にも「判断を変える条件」を先に用意すると、判断の質を保ちやすくなります。`,say:'「今はAを選びます。前提はこの2つです。もしBという情報が出たら見直します。この前提に反する材料はありますか？」',observe:'反対意見が出たとき、相手の立場ではなく根拠を確かめられたか、必要な修正を周囲に説明できたかを見てみてください。毎回意見を変えることが目的ではなく、見直す条件を共有する工夫です。',keys:['selfcorrect','skeptical','bold']},
    safety:{reason:`心理的安全性に関する行動は${i.safety}です。${high(f.colorful)?`存在感${f.colorful}の発言力を活かしながら、他の人が話す順番も意識して作ることを提案します。`:high(i.standards)?`成果基準${i.standards}という期待を保ちつつ、問題が小さいうちに知らせてもらえる返し方を提案します。`:'意見を求める言葉に加え、反対意見や悪い報告を受けた後の返答を整えることを提案します。'}`,say:'「この案がうまくいかないとしたら、どこが気になりますか？ 私と違う見方を先に聞きたいです」——聞いた後に、採用する点と保留する理由を伝えます。',observe:'賛成だけでなく、懸念や途中の失敗が早い段階で出るかを見てみてください。意見をすべて採用する必要はなく、聞いた内容をどう扱ったかが相手に伝わることが確認点です。',keys:['safety','colorful','standards']}
  };
  const factorScripts={
    excitable:['「いま確認できている事実は何ですか。人や案件の評価は一度持ち帰り、次の確認時点で判断します」','強い返答をした後も相手が報告を続けられるか、評価を戻す余地を残せたかを見てください。'],
    skeptical:['「意図はまだ分からないので、まず事実を確かめたいです。この情報をどう判断したか、背景を教えてもらえますか？」','相手の意図を推測する前に事実を聞けたか、自分の前提にも同じ問いを向けられたかを見てください。'],
    cautious:['「これは戻せる決定です。今ある情報でここまで試し、この日付で続けるか判断しましょう」','判断を早めたこと自体より、小さな検証から次に必要な情報が得られたかを見てください。'],
    reserved:['「結論はAです。理由はBで、あなたにはCを期待しています。分かりにくいところはありますか？」','相手が結論だけでなく理由も説明できるか、相談の往復が減ったかを確かめてください。'],
    leisurely:['「この条件には懸念があります。ここを変えられるなら進められます。どちらを優先しますか？」','合意後に進め方を変える前に、条件の違いを相手と話せたかを見てください。'],
    bold:['「私はAがよいと考えています。この案を見直すべき根拠があるなら、先に聞かせてください」','自分の案への異論が出たか、その根拠を肩書きに関係なく検討できたかを見てください。'],
    mischievous:['「この機会は試したいです。使う時間と費用はここまでにし、この条件なら止めます」','成果だけでなく、決めた上限や中止の条件を実際に守れたかを見てください。'],
    colorful:['「先に皆さんの案を聞かせてください。私は最後に、共通点と違いを整理して話します」','自分の発言時間だけでなく、今まで出なかった意見が判断に加わったかを見てください。'],
    imaginative:['「構想はAです。まずBだけを試し、担当と期限を決めたいです。実行上の懸念はどこですか？」','相手が最初の一歩を説明できるか、案の面白さと実行条件を分けて検討できたかを見てください。'],
    diligent:['「今回は、この条件を満たせば完了です。細部まで確認するのはこの部分に絞ります」','修正した回数より、相手が完了を判断できるか、重要な品質を保ちながら仕事が進んだかを見てください。'],
    dutiful:['「方針は理解しています。現場の事実はAで、懸念はBです。代案としてCを提案します」','賛成・反対の結果より、判断前に必要な事実と懸念を伝えられたかを見てください。']
  };
  const specific=advice[key]||{reason:`「${factorInfo[key].jp}」は${f[key]}/100で、${degree(f[key])}回答です。${high(i.safety)&&high(i.selfcorrect)?`異論を聞く行動${i.safety}と自己修正${i.selfcorrect}も高いため、その開かれた姿勢を使い、得意な進め方が強く出た場面を相手と確かめることを提案します。`:`支援行動では自走支援${i.autonomy}、育成・忍耐${i.coaching}という違いもあります。自分が前に進める力に、相手が判断できる説明や確認の機会を添える工夫です。`}`,say:factorScripts[key][0],observe:factorScripts[key][1],keys:[key,'autonomy','coaching','safety','selfcorrect']};
  const action={key,title:actionLibrary[key][0],body:specific.reason,scores:evidence(...specific.keys),paragraphs:[paragraph('実際の仕事では、こう伝える',specific.say),paragraph('相手の反応で確かめる',specific.observe)]};
  return {strength,watch,action};
}
function leadershipBriefText(brief){
  const scores=p=>(p.scores||[]).map(s=>`${s.label} ${s.value}/100`).join(' / ');
  return [['あなたの持ち味',brief.strength],['空回りしやすい場面',brief.watch],['持ち味を活かすアドバイス',brief.action]].map(([label,p])=>[
    `${label}：${p.title}`,p.body,scores(p),...(p.paragraphs||[]).map(x=>`${x.label}\n${x.text}\n${scores(x)}`),...(p.advice?[`ここで意識したいこと\n${p.advice}`]:[])
  ].filter(Boolean).join('\n\n')).join('\n\n');
}
function renderLeadershipBrief(r){
  const brief=buildLeadershipBrief(r);
  document.getElementById('summaryTitle').textContent=brief.strength.title;
  const root=document.getElementById('briefCards');root.innerHTML='';
  [['あなたの持ち味',brief.strength],['空回りしやすい場面',brief.watch],['持ち味を活かすアドバイス',brief.action]].forEach(([label,p],n)=>{
    const card=document.createElement('section');card.className='brief-card';
    const heading=document.createElement('header');heading.className='brief-heading';
    const labelEl=document.createElement('div');labelEl.className='kicker';labelEl.textContent=`0${n+1}  ${label}`;heading.appendChild(labelEl);
    const title=document.createElement('h2');title.textContent=p.title;heading.appendChild(title);card.appendChild(heading);
    const content=document.createElement('div');content.className='brief-content';card.appendChild(content);
    const addScores=part=>{if(part.scores?.length){const note=document.createElement('p');note.className='brief-evidence';note.textContent=part.scores.map(s=>`${s.label} ${s.value}/100`).join(' ・ ');content.appendChild(note)}};
    const body=document.createElement('p');body.textContent=p.body;content.appendChild(body);addScores(p);
    (p.paragraphs||[]).forEach(part=>{const subtitle=document.createElement('h3');subtitle.textContent=part.label;content.appendChild(subtitle);const paragraph=document.createElement('p');paragraph.textContent=part.text;content.appendChild(paragraph);addScores(part)});
    if(p.advice){const advice=document.createElement('div');advice.className='brief-advice';const label=document.createElement('h3');label.textContent='ここで意識したいこと';advice.appendChild(label);const copy=document.createElement('p');copy.textContent=p.advice;advice.appendChild(copy);content.appendChild(advice)}
    root.appendChild(card);
  });
  return brief;
}
