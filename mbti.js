// Optional, self-reported MBTI preferences are a reading lens, never score inputs.
// The score combinations below are original reflection prompts, not a validated
// MBTI/derailer crosswalk or a second personality assessment.
function buildMBTIContext(r, type) {
  if (typeof type !== "string" || !/^[EI][SN][TF][JP]$/.test(type)) return null;
  const f = Object.fromEntries(Object.entries(r.factors).map(([k, v]) => [k, v.index]));
  const i = Object.fromEntries(Object.entries(r.impacts).map(([k, v]) => [k, v.index]));
  const high = v => v >= 70, low = v => v < 40;
  const scores = (factorKeys = [], impactKeys = []) => [
    ...factorKeys.map(k => ({key:k, kind:"factor", label:factorInfo[k].jp, value:f[k]})),
    ...impactKeys.map(k => ({key:k, kind:"impact", label:impactInfo[k].jp, value:i[k]}))
  ];
  const preferences = {
    E:{label:"E：外の世界に意識を向ける", description:"人や出来事とのやり取りに意識を向ける"},
    I:{label:"I：内の世界に意識を向ける", description:"自分の内側で考えを深める"},
    S:{label:"S：具体的な事実を捉える", description:"具体的な事実や経験を手がかりにする"},
    N:{label:"N：全体像や可能性を捉える", description:"全体像や新しい可能性を手がかりにする"},
    T:{label:"T：筋道と基準から判断する", description:"筋道や一貫した基準を判断の起点にする"},
    F:{label:"F：価値観や人への影響から判断する", description:"価値観や人への影響を判断の起点にする"},
    J:{label:"J：決めて見通しをつける", description:"先に決めて見通しをつける"},
    P:{label:"P：新しい情報に開いておく", description:"新しい情報に応じて選択肢を残す"}
  };
  const [energy, information, decision, pace] = type;

  let interaction;
  if (energy === "E") {
    interaction = high(f.colorful)
      ? "存在感の回答も高めで、外とのやり取りを、発言で場を動かす形で表している可能性があります。"
      : low(f.colorful)
        ? "存在感を強く求める回答は少なめです。外に関心を向けることと、会議で主役になったり話を引き取ったりすることは分けて読む組み合わせです。"
        : "存在感は中間付近です。外とのやり取りを好んでも、いつも自分が議論を引き取るとは限らず、話す場面と聞く場面の違いが確認点です。";
    interaction += high(f.reserved)
      ? " 距離・非情動は高めなので、普段はやり取りを好んでも、負荷が高いと説明や共感が短くなる場面があるかを見てください。"
      : " 距離・非情動の得点からは、負荷時に背景説明をどこまで保てるかを確かめると、普段の交流との違いが見えます。";
  } else {
    interaction = high(f.reserved)
      ? "距離・非情動の回答は高めです。内側で考えを整理する時間と、負荷時に周囲への説明を減らす行動を分け、結論だけでなく理由を共有できているかを確認してください。"
      : low(f.reserved)
        ? "距離・非情動の回答は少なめです。内側で考えを深めながらも、忙しいときに意図や背景を伝える方向が見えます。Iだから距離を置く、という読み方にはなりません。"
        : "距離・非情動は中間付近です。考えを整理する時間が必要なことと、周囲への説明を減らすことを分け、いつ共有すると伝わりやすいかを振り返ってください。";
    interaction += high(f.colorful)
      ? " 存在感は高めなので、一人で考える時間を持ちながら、必要な場面では発言で議論を動かす組み合わせも考えられます。"
      : " 存在感の得点も合わせると、発言量だけでなく、整理した考えや問いをどの場面で共有するかが確認点です。";
  }
  interaction += high(i.safety)
    ? " 異論を聞く行動は高めで、考えを外に出すときにも相手の根拠を取り込む方向が回答されています。"
    : low(i.safety)
      ? " 異論を引き出す行動は少なめなので、E・Iのどちらでも、反対意見を求めてから結論を伝えることが実践の候補です。"
      : " 異論を聞く行動は中間付近です。会話の多さや一人で考える時間より、反対意見が実際に出ているかを見てください。";

  let ideas, ideaGist;
  if (information === "N") {
    if (high(f.imaginative)) {
      ideaGist = high(f.mischievous) ? "可能性を広げて早めに試す" : high(f.cautious) ? "構想を広げ、確かめてから進める" : "既存の枠を広げて構想する";
      ideas = "Nの全体像・可能性への関心に、発想の飛躍の高い回答が重なっています。既存の前提を変える案を考える場面があるかを振り返ってください。";
    } else {
      ideaGist = low(f.imaginative) ? "可能性への関心を、説明の通る形で扱う" : "可能性と実行条件を行き来する";
      ideas = low(f.imaginative)
        ? "Nを選んでいても、発想の飛躍の回答は少なめです。可能性への関心があっても、常識から離れた構想や説明を省く行動には直結しない組み合わせです。創造性の低さを示す得点ではありません。"
        : "発想の飛躍は中間付近です。Nの可能性への関心が、いつも大きな構想として表れるとは限らず、新しい案と実行条件をどう行き来するかが確認点です。";
    }
  } else {
    ideaGist = high(f.imaginative) ? "具体的な根拠と新しい構想をつなぐ" : high(f.diligent) ? "具体的な条件と品質を詰める" : "事実を手がかりに進め方を選ぶ";
    ideas = high(f.imaginative)
      ? "Sの具体的な事実・経験への関心と、発想の飛躍の高い回答が併存しています。事実を足場にしながら新しい構想も出す、という両方の面を確かめてください。Sだから新しい案を出さない、という読み方にはなりません。"
      : high(f.diligent)
        ? "Sの事実・経験への関心に、高基準・精密さの高い回答が重なっています。具体的な条件や不備を押さえて進める持ち味として読めます。"
        : "Sの事実・経験への関心を起点に、どの事実を優先して進めるかが確認点です。発想の飛躍や精密さの得点も見ながら、具体的な情報を好むことと、細部をすべて確認することは分けて読んでください。";
  }
  ideas += high(f.mischievous)
    ? " リスク選好は高めなので、案を出す段階と実行する段階を分け、試す範囲と撤退条件を先に共有することが候補です。"
    : high(f.cautious)
      ? " 慎重さは高めで、機会に関心を持っても検討を重ねる方向があります。何が揃えば検討を終えるかを決めると、周囲が判断を理解しやすくなります。"
      : " 実行するかどうかは、S・Nだけでなくリスク選好と慎重さの回答から、検証の量や決定までの時間を確かめてください。";

  let judgment, judgmentGist;
  if (high(f.skeptical)) {
    judgmentGist = high(i.selfcorrect) ? "前提を厳しく確認し、根拠があれば自分も更新する" : low(i.selfcorrect) ? "前提を厳しく確認する一方、自分の判断の更新は控えめ" : "前提を厳しく確認し、見直す条件を確かめる";
    judgment = high(i.selfcorrect)
      ? "警戒・懐疑と自己修正がともに高く、相手の説明を点検しながら、根拠のある指摘は自分の判断にも反映する組み合わせです。"
      : low(i.selfcorrect)
        ? "警戒・懐疑は高い一方、自己修正の回答は少なめです。他者に求める検証と、自分の判断を変える条件が対称になっているかが確認点です。"
        : "警戒・懐疑は高め、自己修正は中間付近です。相手の前提を点検した後、自分の前提も見直しているかを確かめてください。";
  } else {
    judgmentGist = high(i.selfcorrect) ? "指摘を受けて判断を更新する" : low(i.selfcorrect) ? "判断を変える条件を明確にする余地がある" : "場面に応じて前提を確認し、判断を見直す";
    judgment = high(i.selfcorrect)
      ? "自己修正は高めで、前提を常に強く疑うというより、反対データや指摘を受け取って判断を更新する方向が見えます。"
      : low(i.selfcorrect)
        ? "自己修正の回答は少なめなので、何が変わったら判断を見直すかを先に決めることが候補です。"
        : "警戒・懐疑と自己修正の得点から、どんな説明を受け入れやすいか、どの条件で判断を見直すかを具体的に振り返ってください。";
  }
  judgment = (decision === "T"
    ? "Tの筋道・基準を起点にする見方と合わせると、根拠の扱い方が判断スタイルを具体化します。 "
    : "Fの価値観・人への影響を起点にする見方と合わせると、配慮する対象と、根拠によって判断を見直す場面を両方見ると特徴が具体化します。 ") + judgment;
  judgment += high(i.safety)
    ? decision === "T" ? " 心理的安全性の行動も高めで、筋道を重視しながら異論を聞く方向が回答されています。Tであることと、人の意見を軽く扱うことは同じではありません。" : " 心理的安全性の行動も高めで、人への影響を考えることを、異論や悪い報告を聞く行動にもつなげているかが確認点です。"
    : low(i.safety)
      ? decision === "F" ? " 心理的安全性の行動は少なめです。人への配慮を意識していても、反対意見が出やすい関わりになっているかは別に確認する必要があります。" : " 心理的安全性の行動は少なめです。理由の正しさを説明する前に、相手が懸念を話し終えられる時間を置くことが候補です。"
      : " 心理的安全性の行動は中間付近です。T・Fの見方に加え、忙しいときに異論を聞く余地があるかを確かめてください。";

  let execution;
  if (pace === "J") {
    execution = high(f.diligent)
      ? high(i.autonomy)
        ? "Jの見通しをつける見方に、精密さと自走支援の高い回答が重なっています。品質条件を先に決め、方法や判断はメンバーに渡す進め方が候補です。"
        : low(i.autonomy)
          ? "Jの先に決める見方に、精密さの高さと自走支援の少なさが重なっています。道筋を明確にする持ち味が、細かな方法まで自分で持つ形になっていないかを見てください。任せる範囲と確認条件を先に決めることが候補です。"
          : "Jの見通しをつける見方と、精密さの高い回答を合わせると、完成条件を明確にして進める方向が候補です。自走支援は中間付近なので、どの判断まで渡すかを明示すると使いやすくなります。"
      : "Jを選んでいても、精密さの得点だけで細部をすべて管理するとは読めません。先に決める対象を、納期・完成条件・相談のタイミングのどれに置いているかを確かめてください。";
  } else {
    execution = high(f.diligent)
      ? high(i.autonomy)
        ? "Pの選択肢を残す見方に、精密さと自走支援の高い回答が重なっています。品質条件は明確にしながら、到達方法には複数の余地を残して任せる進め方が候補です。"
        : low(i.autonomy)
          ? "Pを選んでいても、精密さは高く、自走支援の回答は少なめです。自分の計画には変更の余地を残しても、メンバーの方法は細かく確認する場面がないかを見てください。完成条件と、本人が選べる範囲を分けることが候補です。"
          : "Pの変更に開いた見方と、精密さの高い回答が併存しています。品質を守る条件と、途中で変更してよい方法を分けると、柔軟さを周囲と共有しやすくなります。"
      : "Pの新しい情報に開く見方を活かすには、途中で変えてよい部分と、固定する納期・完成条件を共有することが候補です。精密さの得点だけで、計画性や実行力の低さを決めるものではありません。";
  }
  execution += high(i.standards)
    ? " 成果基準は高めなので、J・Pのどちらでも『要求水準を保つこと』と『相手の方法を指定すること』を分けて確認してください。"
    : " 成果基準の得点も合わせ、いつまでに何ができれば完了かを伝えているかを振り返ってください。";

  const neutral = Object.values(f).every(v => v === 50) && Object.values(i).every(v => v === 50);
  const lead = neutral
    ? `${type}の選好を参考にできますが、70問の得点はすべて中間です。MBTIだけでリーダー像を補って断定せず、下の4つの視点から実際の場面を確かめてください。`
    : `${type}の「${preferences[information].description}」「${preferences[decision].description}」という見方と合わせると、今回は「${ideaGist}」進め方と、「${judgmentGist}」判断の仕方を確かめる結果です（発想の飛躍 ${f.imaginative}、警戒・懐疑 ${f.skeptical}、自己修正 ${i.selfcorrect}/100）。`;
  return {
    type, title:`${type} × 今回の行動得点`, lead,
    description:`${type}は、${[energy, information, decision, pace].map(k => preferences[k].description).join("／")}という4つの選好として扱います。`,
    note:"入力したMBTIの選好と、70問で回答した行動を照らし合わせる独自の解説です。MBTIの再判定・一致率の測定ではありません。異なる面が出た場合も、場面や経験による違いとして確かめてください。得点とリーダーシップのタイプ判定は70問だけで計算します。",
    source:"https://www.myersbriggs.org/my-mbti-personality-type/myers-briggs-overview/",
    sections:[
      {title:preferences[energy].label, body:interaction, scores:scores(["colorful", "reserved"], ["safety"])},
      {title:preferences[information].label, body:ideas, scores:scores(["imaginative", "diligent", "mischievous", "cautious"])},
      {title:preferences[decision].label, body:judgment, scores:scores(["skeptical"], ["selfcorrect", "safety"])},
      {title:preferences[pace].label, body:execution, scores:scores(["diligent"], ["autonomy", "standards"])}
    ]
  };
}
