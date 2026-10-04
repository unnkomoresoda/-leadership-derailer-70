// Interpret the actual factor/impact scores, independently of the nearest type.
// These are reflection prompts, not validated cutoffs or population comparisons.
function buildLeadershipProfile(r) {
  const f=Object.fromEntries(Object.entries(r.factors).map(([k,v])=>[k,v.index]));
  const i=Object.fromEntries(Object.entries(r.impacts).map(([k,v])=>[k,v.index]));
  const high=v=>v>=70, low=v=>v<40;
  const choose=(v,h,m,l)=>high(v)?h:low(v)?l:m;
  const scores=(factorKeys=[],impactKeys=[])=>[
    ...factorKeys.map(k=>({key:k,kind:"factor",label:factorInfo[k].jp,value:f[k]})),
    ...impactKeys.map(k=>({key:k,kind:"impact",label:impactInfo[k].jp,value:i[k]}))
  ];
  const supports=["autonomy","safety","coaching","selfcorrect"];
  const supportMin=Math.min(...supports.map(k=>i[k]));
  const supportMax=Math.max(...supports.map(k=>i[k]));
  const allFactorsEqual=new Set(Object.values(f)).size===1;
  const allNeutral=Object.values(f).every(v=>v===50)&&Object.values(i).every(v=>v===50);

  let stance;
  if(high(i.standards)){
    stance=high(i.autonomy)&&low(i.coaching)
      ?"高い要求水準のもとで裁量を渡しつつ、習熟を待つ関わりは控えめなリーダー像"
      :low(i.autonomy)&&high(i.coaching)
        ?"高い要求水準を示して成長を支えながら、重要な判断は自分で持つリーダー像"
      :low(i.autonomy)||low(i.coaching)
        ?"高い要求水準を起点に、自分が関与して仕事を進める場面も多いリーダー像"
      :high(i.autonomy)&&high(i.coaching)
        ?"高い要求水準を示しながら、判断と成長の機会をメンバーに渡すリーダー像"
        :"高い要求水準を示し、任せる場面と自分が関与する場面を使い分けるリーダー像";
  }else{
    stance=high(i.autonomy)&&high(i.coaching)
      ?"要求の強さより、メンバーの判断と成長を支える関わりを前に出すリーダー像"
      :low(i.autonomy)&&low(i.coaching)
        ?"任せることや育成より、自分が判断・対応する場面の多いリーダー像"
        :"要求水準と支援の仕方に、場面ごとの違いがあるリーダー像";
  }
  let lead=allNeutral
    ?"今回の回答では11の行動傾向も5つの支援・要求行動もすべて同じ得点（50/100）です。この回答だけで、特定のリーダー像が強く表れているとは言い切れません。以下は、仕事の場面による違いを確かめるための読み方です。"
    :`今回の回答からは、${stance}が読み取れます。チームの自走を支える行動指数は${r.multiplier}/100ですが、総合指数だけでなく、何を任せ、どう意見を聞き、負荷がかかったときにどう反応するかを合わせて見ると、あなたの特徴が具体的になります。`;

  const work=[];
  work.push(choose(i.standards,
    "成果基準の回答は高めで、品質・速度・完成条件への期待をはっきり示して進める傾向があります。",
    "成果基準の回答は中間付近で、常に高い水準を求めるというより、仕事ごとに期待や優先順位を変える可能性があります。",
    "成果基準を高く設定するという回答は少なめです。柔軟な進め方になりうる一方、何をもって完成とするかが周囲に伝わっているかが確認点です。"));
  work.push(choose(f.diligent,
    high(i.autonomy)?"精密さも高めですが、自走支援も高いため、細部への関心を『全部自分で直す』より、品質条件を共有して任せる方向に使える組み合わせです。":"高基準・精密さも高めで、細かな不備に気づき、仕上がりを確かめようとする傾向があります。自走支援との組み合わせでは、確認が相手の判断を奪っていないかを見てください。",
    "精密さの回答は中間付近です。どこまで細部を詰めるかは、仕事の重要度や相手への信頼によって変わる可能性があります。",
    "細部の確認や完璧さを強く求める回答は少なめです。必要な精度をどこまで確保するかを決めておくと、進めやすさと品質を両立しやすくなります。"));
  work.push(choose(f.imaginative,
    high(f.mischievous)?"発想の飛躍とリスク選好がともに高く、既存の前提を変える案を思いつき、検証が完了する前から動く傾向が重なっています。案の面白さと、実行条件・損失の上限を分けて確認することが鍵です。":"発想の飛躍は高めで、定型的な進め方より、新しい接続や構想に意識が向きやすい回答です。リスク選好との違いを見ると、アイデアを出すことと、検証前に実行することは分けて考えられます。",
    "発想の飛躍は中間付近です。新しい案と既存の方法のどちらを使うかは、課題によって変わる可能性があります。",
    "発想の飛躍に関する回答は少なめです。常識から離れた構想より、説明や実行条件を揃えて進める場面が多いかを確かめてください。"));
  if(!(high(f.imaginative)&&high(f.mischievous)))work.push(choose(f.mischievous,
    "リスク選好は高めで、魅力的な機会には検証途中でも動き始めやすい回答です。撤退条件を先に決めると、突破力を保ちやすくなります。",
    "リスク選好は中間付近で、機会の魅力と検証の必要性を場面ごとに見ている可能性があります。",
    "検証前に動く・ルールを越えるといった回答は少なめです。機会を試す場合は、小さく戻せる範囲から着手する方法が候補になります。"));

  const judgment=[];
  judgment.push(choose(f.skeptical,
    high(i.selfcorrect)?"警戒・懐疑と自己修正がともに高く、相手の説明や前提を厳しく点検しつつ、筋が通る指摘があれば自分の判断も更新する組み合わせです。『簡単には納得しないが、根拠があれば考えを変える』判断スタイルとして読めます。":low(i.selfcorrect)?"警戒・懐疑は高い一方、自己修正の回答は少なめです。他者の前提を点検する強さに比べ、自分の見方を更新する行動が控えめな組み合わせです。自分の案にも同じ反証条件を置けているかが確認点です。":"警戒・懐疑は高めで、説明の根拠や相手の意図を丁寧に点検する傾向があります。自己修正は中間付近のため、相手への疑問と自分の見方の見直しを両方行えているかが確認点です。",
    high(i.selfcorrect)?"警戒・懐疑は中間付近で、自己修正は高めです。前提を確認しながらも、反対データや筋の通った指摘を判断の更新に使う回答が多くなっています。":low(i.selfcorrect)?"警戒・懐疑は中間付近ですが、自己修正の回答は少なめです。確認した前提が変わったとき、どの条件で自分の判断を変えるかを明確にすると使いやすくなります。":"前提を疑うことも自分の判断を変えることも、回答は中間付近です。誰の意見なら採用しやすいか、どんな証拠なら判断を変えるかを振り返ると特徴が見えます。",
    high(i.selfcorrect)?"警戒・懐疑の回答は少なめで、自己修正は高めです。まず説明を受け取り、必要に応じて自分の見方を更新する方向が読み取れます。重要な前提まで無確認になっていないかは別に確かめてください。":low(i.selfcorrect)?"前提を疑うことと自分の判断を更新することは、どちらも回答が少なめです。既存の見方を続ける場面で、確認すべき根拠や見直しのタイミングがあるかを振り返ってください。":"前提や意図を強く疑う回答は少なめで、自己修正は中間付近です。まず受け取って進め、必要な場面で根拠を確認することが多いかを確かめてください。"));
  judgment.push(choose(f.cautious,
    high(f.mischievous)?"慎重さもリスク選好も高く、慎重に検討する動きと、機会に飛び込む動きが併存しています。どの条件で切り替わるかを決めると、周囲が判断を理解しやすくなります。":"慎重さは高めで、不確実な決定ほど情報や安全性を確かめる回答が多くなっています。検討を終える条件と期限を決めることが、停滞を防ぐ候補です。",
    "慎重さは中間付近です。決定の影響や戻しやすさによって、確認にかける時間を変えている可能性があります。",
    "慎重さの回答は少なめで、情報が揃いきる前でも期限に合わせて決める方向が読み取れます。戻せない決定では、確認の省略がないかを見てください。"));
  judgment.push(choose(f.bold,
    high(i.selfcorrect)?"自己確信は高めですが自己修正も高いため、前に出て決める姿勢と、誤りを認めて修正する姿勢が同居しています。":"自己確信は高めで、自分の判断や裁量を強く信頼する回答です。助言を受けた際に、内容を検討する前に軽く扱っていないかが確認点です。",
    "自己確信は中間付近で、自分の見方をどこまで押し出すかは、経験や場面によって変わる可能性があります。",
    "自己確信を強く押し出す回答は少なめです。これは判断能力の低さを意味せず、自分の裁量や正しさを強く主張する場面が少ないという読み方です。"));
  judgment.push(choose(f.dutiful,
    "上位者への適応は高めで、組織との整合や確認を重視する回答です。必要な異論を伝えることと、決定後に協力することを分けられているかを見てください。",
    "上位者への適応は中間付近で、方針に合わせることと独立して判断することを、場面によって使い分ける可能性があります。",
    "上位者に合わせたり確認を求めたりする回答は少なめです。独立して判断する際に、関係者への理由の共有が足りているかが確認点です。"));

  const delegation=[];
  delegation.push(choose(i.autonomy,
    high(i.coaching)?"自走支援と育成・忍耐がともに高く、進め方や判断を渡すことと、習熟するまで支えることが重なっています。自分が答えを出すだけでなく、相手が次回も判断できるように関わる方向です。":low(i.coaching)?"自走支援は高い一方、育成・忍耐の回答は少なめです。裁量は渡すものの、学習途中の相手を待ったり基準を説明したりする支援が少なくなる可能性があります。任せることが、説明不足のまま離れることになっていないかを確認してください。":"自走支援は高めですが、育成・忍耐は中間付近です。任せる姿勢はあり、相手の習熟差や説明に必要な時間によって、支え方が変わる組み合わせです。",
    high(i.coaching)?"自走支援は中間付近で、育成・忍耐は高めです。成長を支える回答は多い一方、重要な判断は自分で持つ場面もありえます。教える機会と、本人が決める機会を分けて渡せているかを見てください。":low(i.coaching)?"自走支援は中間付近で、育成・忍耐の回答は少なめです。任せる余地はあっても、進み方が遅い場面では説明を待つより、自分で進める動きが出る可能性があります。":"自走支援と育成・忍耐はどちらも中間付近です。任せる場面も、自分が関与する場面もありうるため、期限・難易度・相手の習熟によって切り替えているかが確認点です。",
    high(i.coaching)?"自走支援の回答は少なめですが、育成・忍耐は高めです。丁寧に教えながらも、最終判断を自分に残しやすい組み合わせです。育成した相手に、どの判断まで渡すかを明示すると次の成長機会になります。":low(i.coaching)?"自走支援と育成・忍耐は、どちらも回答が少なめです。判断や実行を自分で引き受ける方向が読み取れるため、自分が不在でも進む仕事を1つ作ることが候補になります。":"自走支援の回答は少なめで、育成・忍耐は中間付近です。説明や支援はしていても、重要な判断を自分が持つ場面が多いかを確かめてください。"));
  delegation.push(choose(i.safety,
    "心理的安全性に関する行動は高めで、異論や悪い報告を聞き、根拠を確認する回答が多くなっています。周囲にも同じように伝わっているかは、実際の反対意見や報告の出方で確かめられます。",
    "心理的安全性に関する行動は中間付近です。異論を聞ける場面と、忙しさや立場の違いで聞きにくくなる場面を分けて振り返ると改善点が具体的になります。",
    "異論や悪い報告を引き出す行動の回答は少なめです。反対意見や失敗報告への最初の返答が、次の報告をためらわせていないかを確認してください。"));
  if(supportMax-supportMin>=20){
    const relational=Math.min(i.safety,i.selfcorrect);
    const practical=Math.max(i.autonomy,i.coaching);
    if(relational-practical>=20)delegation.push(`意見を聞く・自分を修正する行動（${i.safety}・${i.selfcorrect}）に比べ、判断を渡す・習熟を待つ行動（${i.autonomy}・${i.coaching}）は控えめです。意見には開かれていても、実務では自分が引き取る場面があるかを確かめてください。${supportMin>=40?"相対的な差であり、任せることや育成が苦手だと断定する結果ではありません。":""}`);
    else delegation.push(`4つの支援行動には${supportMax-supportMin}点の幅があります。総合指数${r.multiplier}だけで一様に得意・不得意と捉えず、各行動の違いを見てください。`);
  }else delegation.push(`4つの支援行動の差は${supportMax-supportMin}点です。${supportMin>=70?"いずれも高めに回答されており、特定の1項目だけを弱点と捉える必要はありません。":supportMax<40?"いずれも回答が少なめなので、まず1つの支援行動を具体的な場面で試す方法が候補です。":"大きな偏りより、場面によって支援の仕方が変わるかを確かめてください。"}`);
  if(high(i.standards)&&low(i.coaching))delegation.push("成果への要求と、習熟を待つ行動の間に差があります。期待を下げる前に、必要な判断基準と再提案の期限を伝えたかを振り返ってください。");

  const pressure=[];
  pressure.push(choose(f.excitable,
    "感情反応は高めで、期待外れや強い負荷が、熱意・評価・態度の変化につながりやすい回答です。熱量を保ちながら、人や案件の見切りをその場で決めない工夫が候補になります。",
    "感情反応は中間付近です。期待が外れたときに態度が変わる場面と、一定に保てる場面の違いを振り返ってください。",
    "感情反応の回答は少なめで、失望があっても態度や評価を急に変えることは少ないと回答しています。これは感情がないことや、常に冷静であることを意味しません。"));
  pressure.push(choose(f.reserved,
    high(i.safety)?"距離・非情動は高めで、負荷が上がると説明や共感が減る傾向が見られます。心理的安全性の回答は高くても、忙しいときの短い返答が冷たく受け取られることはありえます。反対意見を聞く姿勢と、背景を伝える量を別に確認してください。":"距離・非情動は高めで、余裕がないときほど、一人で考えたり説明を短くしたりする回答が多くなっています。周囲が結論だけでなく理由や期待も理解できるかが確認点です。",
    "距離・非情動は中間付近です。必要な説明を保てる場面と、忙しさで短くなる場面の違いを見てください。",
    "距離・非情動の回答は少なめで、忙しいときにも意図や背景を伝える方向が読み取れます。周囲が相談しやすいか、実際のやり取りで確かめてください。"));
  pressure.push(choose(f.colorful,
    high(i.safety)?"存在感は高めで、議論を引き取り発言で前進させやすい回答です。異論を聞く行動も高いため、発言の多さと、他の人が話せる余地の両方を見ると持ち味が分かります。":"存在感は高めで、発言や印象で場を動かす方向が読み取れます。自分が話を引き取る前に、他の人の根拠を聞く時間があるかを確認してください。",
    "存在感は中間付近で、発言で前に出るか、他の人の発言を待つかは場面によって変わる可能性があります。",
    "存在感を強く求める回答は少なめです。発言量で場を動かす以外に、問いや判断基準を通じて働きかける場面があるかを振り返ってください。"));
  pressure.push(choose(f.leisurely,
    "内的抵抗は高めで、納得していない依頼を表面上受け、後から距離を置いたり自分のやり方に戻したりする回答が多くなっています。自分の基準を守りながら、合意前に懸念や条件を言葉にできるかが確認点です。",
    "内的抵抗は中間付近です。納得できない依頼に、その場で懸念を伝えるか、実行段階で抵抗するかを振り返ると特徴が見えます。",
    "内的抵抗の回答は少なめで、納得していないことを後から抵抗するより、率直に伝える方向が読み取れます。"));

  const focus=[];
  const ranked=Object.entries(f).sort((a,b)=>b[1]-a[1]);
  if(allFactorsEqual)focus.push(`11の行動傾向はすべて同じ得点（${ranked[0][1]}/100）です。順位をつけて特定の1つだけを特徴とするより、上の場面別の説明から実際に当てはまる部分を拾ってください。`);
  else{
    const prominent=ranked.filter(([,v])=>v>=70).slice(0,2);
    if(prominent.length)focus.push(`高めに回答された項目には${prominent.map(([k,v])=>`「${factorInfo[k].jp}」（${v}/100）`).join("と")}などがあります。強みとして出ると、${prominent.map(([k])=>factorInfo[k].strength).join("")} この方向が強く出るときは、上の説明にある他の得点との組み合わせで、周囲への伝わり方が変わります。`);
    else focus.push("11の行動傾向に70以上の項目はありません。相対的な順位だけで強い特徴を決めず、得点の近い項目を含めて場面ごとの違いを見る結果です。");
  }
  const weakest=supports.filter(k=>i[k]===supportMin);
  if(supportMin<40){
    focus.push(`まず試す候補は「${weakest.map(k=>impactInfo[k].jp).join("・")}」（${supportMin}/100）に関する行動です。${actionLibrary[weakest[0]][1]} 一度に全部を変えず、1つの仕事で4週間試してください。`);
  }else if(Math.min(i.safety,i.selfcorrect)-Math.max(i.autonomy,i.coaching)>=20){
    focus.push("伸ばす候補は、意見を受け入れる姿勢を、実際に判断を任せること・習熟を待つことにつなげる工夫です。本人が決める範囲、完成条件、相談するタイミングを先に共有し、基準を満たす間は自分の方法に直さず任せることを4週間試してください。");
  }else if(supportMin>=70&&ranked[0][1]>=70&&!allFactorsEqual){
    focus.push(`支援に関する4項目はいずれも高めです。支援を一律に増やすより、「${factorInfo[ranked[0][0]].jp}」が負荷の高い場面で過剰にならない工夫が候補です。${actionLibrary[ranked[0][0]][1]}`);
  }else{
    focus.push("伸ばす候補は、場面によって変わる関わり方を言葉にすることです。1つの仕事で『本人が決める範囲・相談の条件・次の確認日』を共有し、忙しさで途中から判断を引き取っていないかを4週間振り返ってください。");
  }
  return {lead,sections:[
    {title:"仕事の進め方",body:work.join(" "),scores:scores(["diligent","imaginative","mischievous"],["standards"])},
    {title:"判断と、意見の受け止め方",body:judgment.join(" "),scores:scores(["skeptical","cautious","bold","dutiful"],["selfcorrect"])},
    {title:"任せ方と、チームを育てる関わり",body:delegation.join(" "),scores:scores([],["autonomy","coaching","safety","selfcorrect"])},
    {title:"負荷が高いときの、周囲への伝わり方",body:pressure.join(" "),scores:scores(["excitable","reserved","colorful","leisurely"])},
    {title:"持ち味と、次に伸ばすポイント",body:focus.join(" "),scores:[]}
  ]};
}

function leadershipProfileText(report){
  const sectionText=s=>`${s.title}\n${s.scores.map(x=>`${x.label} ${x.value}/100`).join(" / ")}\n${s.body}`;
  return [report.lead,...report.sections.map(sectionText)].join("\n\n");
}
function appendLeadershipSection(root,part,headingLevel="h3"){
  const section=document.createElement("section");section.className="profile-section";
  const heading=document.createElement(headingLevel);heading.textContent=part.title;section.appendChild(heading);
  if(part.scores.length){
    const list=document.createElement("ul");list.className="profile-evidence";list.setAttribute("aria-label","説明に用いた得点");
    part.scores.forEach(score=>{const item=document.createElement("li");item.textContent=`${score.label} ${score.value}/100`;list.appendChild(item)});
    section.appendChild(list);
  }
  const body=document.createElement("p");body.textContent=part.body;section.appendChild(body);root.appendChild(section);
}
function renderLeadershipProfile(r){
  const report=buildLeadershipProfile(r);
  document.getElementById("summaryCopy").textContent=report.lead;
  const root=document.getElementById("summaryDetails");
  root.innerHTML="";
  report.sections.forEach(part=>appendLeadershipSection(root,part));
  return report;
}
