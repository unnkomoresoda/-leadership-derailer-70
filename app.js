const factorInfo={excitable:{jp:"感情反応",en:"Excitable",cluster:"away",strength:"熱量があり、期待や問題に素早く反応できる。",watch:"失望や苛立ちが強いと、人・案件への評価やコミットメントを急に下げやすい。"},skeptical:{jp:"警戒・懐疑",en:"Skeptical",cluster:"away",strength:"前提を疑い、リスクや他者の意図を鋭く読む。",watch:"警戒が過剰になると、批判を攻撃と捉えたり、相手の善意を疑いすぎたりする。"},cautious:{jp:"慎重さ",en:"Cautious",cluster:"away",strength:"失敗確率や下振れを丁寧に検討できる。",watch:"不確実性が高い場面で、判断・発言・挑戦が遅れやすい。"},reserved:{jp:"距離・非情動",en:"Reserved",cluster:"away",strength:"感情に流されず、冷静かつ独立して考えられる。",watch:"負荷が高いと説明や共感が減り、周囲から『何を考えているか分からない』と見られやすい。"},leisurely:{jp:"内的抵抗",en:"Leisurely",cluster:"away",strength:"自分のペースや基準を守り、外圧に安易に流されない。",watch:"納得していない要求に表面上合わせつつ、実行段階で抵抗や先延ばしが出やすい。"},bold:{jp:"自己確信",en:"Bold",cluster:"against",strength:"自信を持って前に出て、大きな責任を引き受けやすい。",watch:"確信が過剰になると、自分の限界や誤りを過小評価し、助言を軽く扱いやすい。"},mischievous:{jp:"リスク選好",en:"Mischievous",cluster:"against",strength:"機会を見つけたら大胆に動き、既存ルールを越えて突破できる。",watch:"刺激や成功可能性に引かれると、検証不足・ルール軽視・過大な賭けにつながりやすい。"},colorful:{jp:"存在感",en:"Colorful",cluster:"against",strength:"場を動かし、人を惹きつけ、メッセージを強く届けられる。",watch:"存在感が過剰になると、話しすぎ・遮り・自己演出が増え、他者の声を取りこぼしやすい。"},imaginative:{jp:"発想の飛躍",en:"Imaginative",cluster:"against",strength:"常識に縛られず、新しい接続やアイデアを生み出せる。",watch:"発想が先行しすぎると、実行条件や周囲の理解を置き去りにしやすい。"},diligent:{jp:"高基準・精密さ",en:"Diligent",cluster:"toward",strength:"品質基準が高く、細部まで精度を上げられる。",watch:"基準が過剰になると、細部への介入・任せにくさ・修正過多が起こりやすい。"},dutiful:{jp:"上位者への適応",en:"Dutiful",cluster:"toward",strength:"組織方針を尊重し、上位者やチームとの整合を取りやすい。",watch:"合わせすぎると、必要な反対意見や独立判断を控えやすい。"}};
const clusterInfo={away:{title:"距離を取る反応",en:"Moving Away",desc:"負荷が高いと、感情反応・警戒・慎重・距離・内的抵抗として出やすい領域。"},against:{title:"押し返す反応",en:"Moving Against",desc:"負荷が高いと、自信・大胆さ・存在感・独創性を強く押し出しやすい領域。"},toward:{title:"合わせる反応",en:"Moving Toward",desc:"負荷が高いと、高基準や上位者への適応によって安定を作ろうとしやすい領域。"}};
const impactInfo={standards:{jp:"成果基準",desc:"結果・品質・スピードへの要求水準"},autonomy:{jp:"自走支援",desc:"自分が答えを出さず、判断権を渡す力"},safety:{jp:"心理的安全性",desc:"反論・異論・失敗報告を引き出す力"},coaching:{jp:"育成・忍耐",desc:"理解速度や習熟差を越えて成長を支える力"},selfcorrect:{jp:"自己修正",desc:"自分の誤りを認め、判断を更新する力"}};
const impactExamples={standards:"例：着手前に、完成の条件と優先順位を具体的に伝える。高いほど要求水準が高いことを示し、実際の成果の高さを意味しません。",autonomy:"例：成果条件を共有したら、進め方と判断を本人に任せる。",safety:"例：反対意見や悪い報告に、まず『知らせてくれてありがとう』と返して根拠を聞く。",coaching:"例：すぐに代わりに直さず、判断基準を伝えて再提案を待つ。",selfcorrect:"例：判断を変えた理由や自分の誤りを、具体的に共有する。"};
const derailerQuestions=[
["excitable","期待していた成果が出ないと、その仕事への熱意が急に下がることがある。",1],["excitable","一度誰かに失望すると、その人への評価を戻すのに時間がかかる。",1],["excitable","プレッシャーが強いほど、気分や態度の振れ幅が大きくなる。",1],["excitable","見込みがないと感じた案件や関係を、比較的早く見切る方だ。",1],["excitable","嫌な出来事があっても、周囲への態度はかなり一定に保てる。",-1],
["skeptical","相手の発言の裏にある意図を考えることが多い。",1],["skeptical","批判を受けると、『なぜ今それを言うのか』まで考える。",1],["skeptical","重要な情報ほど、誰かの都合で切り取られている可能性を疑う。",1],["skeptical","周囲が当然だと思っている前提でも、根拠が弱ければ疑う。",1],["skeptical","まずは相手に悪意がない前提で受け取ることが多い。",-1],
["cautious","失敗したときの影響が大きい決定ほど、最後の一押しに時間がかかる。",1],["cautious","情報が足りない状態で決めるより、追加情報を待ちたい。",1],["cautious","不確実な案件では、発言する前にかなり安全性を確認する。",1],["cautious","新しいやり方より、実績のある方法を選びたくなることがある。",1],["cautious","十分な情報がなくても、必要なら期限内に割り切って決められる。",-1],
["reserved","忙しいときほど、人への説明や雑談が減る。",1],["reserved","仕事上の判断では、相手の気持ちより事実や結果を優先しやすい。",1],["reserved","ストレスが高いときは、一人で考えた方が楽だと感じる。",1],["reserved","難しい話ほど、必要最低限だけ伝えて終わらせることがある。",1],["reserved","余裕がないときでも、自分の意図や背景を周囲に説明するようにしている。",-1],
["leisurely","納得できない依頼でも、その場では反論せず受けることがある。",1],["leisurely","他人にペースを決められると、内心かなり抵抗を感じる。",1],["leisurely","合意した後でも、自分のやり方に戻して進めることがある。",1],["leisurely","不満を直接言うより、距離を置いたり反応を遅らせたりすることがある。",1],["leisurely","納得していないことは、関係が悪くならない形で率直に伝えられる。",-1],
["bold","自分の判断は、平均的な人より正確な方だと思う。",1],["bold","自分の弱点を指摘されても、実際には大きな問題ではないと思うことがある。",1],["bold","責任が大きい仕事では、自分により大きな裁量が与えられるべきだと思う。",1],["bold","大きな成果を出したとき、自分の判断力が主要因だったと考えることが多い。",1],["bold","経験の浅い人の指摘でも筋が通っていれば、すぐ自分の判断を変えられる。",-1],
["mischievous","成果のためなら、形骸化したルールを越える判断も必要だと思う。",1],["mischievous","退屈な状況が続くと、新しい刺激や勝負を入れたくなる。",1],["mischievous","魅力的な機会を見つけると、完全な検証前でも動き始めることがある。",1],["mischievous","多少問題が起きても、自分ならリカバリーできると思うことが多い。",1],["mischievous","面白い案件ほど、あえて失敗時の損失を先に確認する。",-1],
["colorful","会議では自然と発言量が多くなる。",1],["colorful","周囲から『面白い・有能・印象的な人』と思われたい気持ちはある。",1],["colorful","議論が遅いと、自分が話を引き取って前に進めたくなる。",1],["colorful","自分より別の人に注目が集まり続けると、少し物足りなく感じる。",1],["colorful","自分が答えを持っていても、意図的に黙って他の人の発言を待てる。",-1],
["imaginative","人があまり結びつけないもの同士をつなげて考えることが多い。",1],["imaginative","定型作業より、新しい仕組みや構想を考える方が明らかに好きだ。",1],["imaginative","追い込まれるほど、一般的ではない打ち手を思いつくことがある。",1],["imaginative","自分の説明について、『話が飛んでいる』と言われることがある。",1],["imaginative","面白いアイデアでも、実装条件と現実性を確認してから推す。",-1],
["diligent","自分にも他人にも、仕事の品質基準は高い方だ。",1],["diligent","仕上がりに不安がある相手には、任せきるより途中で確認したくなる。",1],["diligent","他の人が気づかない細かなミスが目につく。",1],["diligent","細部を詰めるために、完成や意思決定が遅れることがある。",1],["diligent","重要度が低い仕事なら、80点程度で終えることに抵抗はない。",-1],
["dutiful","上司と違う意見を持っていても、強く反対するのはためらう。",1],["dutiful","重要な判断では、独断より上位者の確認を取ってから動きたい。",1],["dutiful","組織では、自分の正しさより期待される役割を果たす方が大切だと思うことがある。",1],["dutiful","データが自分の考えを支持していても、権限のある人に異論を唱えるのは難しい。",1],["dutiful","相手が上司でも、必要ならはっきり反対意見を言える。",-1]];
const impactQuestions=[["standards","成果物の質が低いまま『とりあえず完了』にすることには強い抵抗がある。",1],["standards","チームには、平均より高いスピードと成果水準を求める方だ。",1],["standards","重要な仕事では、期待値を曖昧にせず高めに設定する。",1],["autonomy","部下が自分と違う方法を選んでも、成果条件を満たすなら任せられる。",1],["autonomy","自分が答えを知っていても、相手に考えさせる余地を意図的に残す。",1],["autonomy","重要な判断ほど、自分が最終的に決めたくなる。",-1],["safety","部下や同僚が『それは違うと思います』と言える空気を作れている。",1],["safety","悪い報告ほど早く持ってきてほしい、と明確に伝えている。",1],["safety","反対意見を受けると、論破するより先に相手の根拠を聞く。",1],["coaching","理解が遅い相手にも、判断基準を分解して説明することができる。",1],["coaching","自分でやった方が早くても、育成価値が高ければ任せ続けられる。",1],["coaching","同じことを何度か説明しても伝わらないと、見切りが早くなる。",-1],["selfcorrect","自分の判断ミスを、部下の前でも具体的に認められる。",1],["selfcorrect","自分の仮説と反対のデータが出たら、立場にこだわらず考えを変えられる。",1],["selfcorrect","自分より経験の浅い人の指摘でも、筋が通っていれば採用できる。",1]];
const archetypes=[{name:"Team Multiplier",jp:"チーム増幅型",desc:"要求水準を保ちながら、判断権・異論・育成を通じて『自分がいなくても強いチーム』を作る方向。",proto:{away:30,against:45,toward:45,standards:78,autonomy:88,safety:90,coaching:88,selfcorrect:90}},{name:"High-Standards Driver",jp:"高基準ドライバー型",desc:"速度と成果基準で前進させる。強さは推進力、弱点は周囲の処理速度との差が開いたときの焦り。",proto:{away:48,against:65,toward:60,standards:92,autonomy:62,safety:62,coaching:52,selfcorrect:72}},{name:"Quality Architect",jp:"品質設計型",desc:"基準・精度・再現性を設計して成果を安定させる。過剰になると細部介入や任せにくさに転じる。",proto:{away:48,against:42,toward:78,standards:90,autonomy:52,safety:70,coaching:68,selfcorrect:80}},{name:"Visionary Challenger",jp:"構想突破型",desc:"独創性と大胆さで既存前提を崩す。実装条件や周囲の理解を置き去りにしないことが鍵。",proto:{away:38,against:86,toward:38,standards:80,autonomy:80,safety:66,coaching:58,selfcorrect:76}},{name:"Independent Strategist",jp:"独立戦略型",desc:"前提を疑い、独力で深く考え、安易な同調を避ける。説明不足や距離感がリスクになりやすい。",proto:{away:72,against:50,toward:30,standards:76,autonomy:82,safety:57,coaching:58,selfcorrect:80}},{name:"Careful Stabilizer",jp:"慎重安定型",desc:"下振れを抑え、関係者と整合を取りながら確実に進める。決断の遅れや過度な合意志向に注意。",proto:{away:66,against:30,toward:70,standards:70,autonomy:58,safety:78,coaching:80,selfcorrect:82}},{name:"Charismatic Accelerator",jp:"巻き込み加速型",desc:"存在感とエネルギーで人を巻き込み、動きを作る。話す量と聞く量のバランスが成果を左右する。",proto:{away:35,against:82,toward:38,standards:78,autonomy:70,safety:60,coaching:58,selfcorrect:70}},{name:"Reactive Achiever",jp:"反応型アチーバー",desc:"成果への熱量が高く、問題にも敏感に反応する。負荷が上がるほど、見切り・苛立ち・一人で抱える動きに注意。",proto:{away:80,against:62,toward:52,standards:90,autonomy:48,safety:42,coaching:38,selfcorrect:62}}];
const actionLibrary={excitable:["24時間ルール","失望や苛立ちが強いときは、人・案件の評価変更を即決せず、事実と解釈を分けて翌日に再判定する。"],skeptical:["意図より証拠","『相手の意図』を推測する前に、確認できる事実・反証可能な仮説・本人への確認質問の3つに分ける。"],cautious:["戻せる決定と戻せない決定を分ける","戻せる決定は70%の情報で決め、戻せない決定だけ慎重にする。全案件を同じ慎重さで扱わない。"],reserved:["結論＋背景＋感情の3点セット","結論だけでなく『なぜそう判断したか』『相手への期待/懸念』を1文ずつ足して、周囲から見える情報量を増やす。"],leisurely:["その場で小さく反対する","納得していない依頼には『懸念はXです。条件Yなら進めます』と、その場で条件付き反対を言語化する。"],bold:["反証担当を置く","重要判断では、自分の案を否定する役を1人決める。反論の質を評価し、肩書きではなく根拠で決める。"],mischievous:["損失の上限を決める","面白い案ほど、最大損失・撤退条件・検証期間を先に数字で固定してから動く。"],colorful:["会議で最後に話す","自分が結論を持っている会議ほど、先に2〜3人の意見を聞いてから発言する。"],imaginative:["発想と実行条件を分けて考える","アイデア評価では『面白さ』と『実装可能性』を別採点し、後者が一定水準を超えた案だけ実行へ送る。"],diligent:["80/95/100点基準","仕事を重要度で3段階に分け、低重要度は80点で止める。100点を要求する仕事を明示的に限定する。"],dutiful:["異論を伝え、決定後は協力する","上位者への異論は『事実→懸念→代案』の3点で一度は出す。決定後はコミットする。"],autonomy:["判断を誰に任せるか決める","案件ごとに『本人が決める』『相談して本人が決める』『自分が決める』を先に定義し、後から判断権を奪わない。"],safety:["悪い知らせから先に聞く","定例の冒頭で『悪い知らせ・反対意見・失敗』から話す時間を固定し、早い報告そのものを評価する。"],coaching:["答えではなく判断基準を渡す","修正案を直接言う前に、見るべき基準を最大3つに絞って渡し、相手に再提案させる。"],selfcorrect:["判断ログ","重要判断の前提・予想・撤回条件を短く残し、結果後に『当たった/外れた理由』を自分から共有する。"]};
function safeGet(key,fallback=""){try{const v=window.localStorage.getItem(key);return v===null?fallback:v}catch(e){return fallback}}
function safeSet(key,value){try{window.localStorage.setItem(key,value)}catch(e){}}
function safeRemove(key){try{window.localStorage.removeItem(key)}catch(e){}}
const QUESTION_COUNT=derailerQuestions.length+impactQuestions.length;
function validAnswer(value){return Number.isInteger(value)&&value>=1&&value<=5}
function normalizeAnswers(value,limit=QUESTION_COUNT){
  if(!value||typeof value!=="object"||Array.isArray(value))return {};
  return Object.fromEntries(Object.entries(value).filter(([key,v])=>/^(0|[1-9]\d*)$/.test(key)&&Number(key)<limit&&validAnswer(v)));
}
function loadAnswers(){
  let saved={};
  try{saved=normalizeAnswers(JSON.parse(safeGet("derailer70Answers","{}")))}catch(e){}
  if(Object.keys(saved).length===0){
    try{saved=normalizeAnswers(JSON.parse(safeGet("derailerAnswers","{}")),55)}catch(e){}
  }
  return saved;
}
let answers=loadAnswers();
const mbtiValues=["ENTP","ENTJ","INTP","INTJ","ENFP","ENFJ","INFP","INFJ","ESTP","ESTJ","ISTP","ISTJ","ESFP","ESFJ","ISFP","ISFJ"];
let profile={name:safeGet("derailer70Name","").slice(0,80),mbti:safeGet("derailer70MBTI","")};
if(!mbtiValues.includes(profile.mbti))profile.mbti="";
function missingAnswers(){return Array.from({length:QUESTION_COUNT},(_,i)=>i).filter(i=>!validAnswer(answers[i]))}
function updateSavedNotice(){
  const n=QUESTION_COUNT-missingAnswers().length;
  document.getElementById("savedNotice").textContent=n?`保存済みの回答が ${n} 問あります。開始すると続きから回答できます。`:"";
  document.getElementById("resumeResultBtn").classList[n===QUESTION_COUNT?"remove":"add"]("hidden");
  document.getElementById("startBtn").textContent=n===QUESTION_COUNT?"回答を見直す":n?"回答を続ける":"70問を始める";
}
function startQuiz(){profile.name=document.getElementById("nameInput").value.trim().slice(0,80);profile.mbti=mbtiValues.includes(document.getElementById("mbtiInput").value)?document.getElementById("mbtiInput").value:"";safeSet("derailer70Name",profile.name);safeSet("derailer70MBTI",profile.mbti);document.getElementById("intro").classList.add("hidden");document.getElementById("quiz").classList.remove("hidden");renderQuestions();document.getElementById("incomplete").textContent="";window.scrollTo(0,0)}
// Fisher–Yates over all 70 original IDs. Scoring always uses the original ID.
function shuffledOrder(){
  const order=Array.from({length:QUESTION_COUNT},(_,i)=>i);
  for(let i=order.length-1;i>0;i--){
    let j;
    if(typeof crypto!=="undefined"&&crypto.getRandomValues){
      const range=i+1,limit=Math.floor(4294967296/range)*range,buffer=new Uint32Array(1);
      do{crypto.getRandomValues(buffer)}while(buffer[0]>=limit);
      j=buffer[0]%range;
    }else{j=Math.floor(Math.random()*(i+1))}
    [order[i],order[j]]=[order[j],order[i]];
  }
  return order;
}
function validOrder(order){return Array.isArray(order)&&order.length===QUESTION_COUNT&&new Set(order).size===QUESTION_COUNT&&order.every(i=>Number.isInteger(i)&&i>=0&&i<QUESTION_COUNT)}
let questionOrder=null;
function ensureQuestionOrder(){
  if(questionOrder)return questionOrder;
  try{const saved=JSON.parse(safeGet("derailer70Order","null"));if(validOrder(saved))questionOrder=saved}catch(e){}
  if(!questionOrder)questionOrder=shuffledOrder();
  safeSet("derailer70Order",JSON.stringify(questionOrder));
  return questionOrder;
}
function renderQuestions(){const all=[...derailerQuestions,...impactQuestions],root=document.getElementById("questions");root.innerHTML="";ensureQuestionOrder().forEach((i,position)=>{const q=all[i];const card=document.createElement("div");card.className="card question";card.id=`question-card-${i}`;card.tabIndex=-1;card.innerHTML=`<div class="qtop"><div class="qnum">${position+1}</div><div class="qtext" id="question-${i}">${q[1]}</div></div><div class="scale" role="radiogroup" aria-labelledby="question-${i}">${[1,2,3,4,5].map(v=>`<div class="option"><input type="radio" id="q${i}_${v}" name="q${i}" value="${v}" ${String(answers[i])===String(v)?"checked":""}><label for="q${i}_${v}"><b>${v}</b><span>${["全く<br>違う","やや<br>違う","どちらとも<br>いえない","やや<br>当てはまる","非常に<br>当てはまる"][v-1]}</span></label></div>`).join("")}</div>`;root.appendChild(card)});updateProgress()}
function saveAnswer(i,v){
  if(!Number.isInteger(i)||i<0||i>=QUESTION_COUNT||!validAnswer(v))return;
  answers[i]=v;safeSet("derailer70Answers",JSON.stringify(answers));
  const card=document.getElementById(`question-card-${i}`);
  if(card){card.classList.remove("unanswered");card.removeAttribute("aria-invalid")}
  document.getElementById("incomplete").textContent="";updateProgress();
}
function updateProgress(){
  const n=QUESTION_COUNT-missingAnswers().length;
  document.getElementById("progressText").textContent=`${n} / ${QUESTION_COUNT}`;
  document.getElementById("progressBar").style.width=`${n/QUESTION_COUNT*100}%`;
  document.getElementById("quizProgress").setAttribute("aria-valuenow",String(n));
  
  document.getElementById("phaseText").textContent=n===QUESTION_COUNT?"回答完了":"回答は自動保存されます";
}
function idx(avg){return Math.round((avg-1)/4*100)}function band(v){if(v>=85)return"非常に高い";if(v>=70)return"高い";if(v>=50)return"中程度";if(v>=25)return"やや低い";return"低い"}function clamp(v){return Math.max(0,Math.min(100,Math.round(v)))}function patternBand(v){if(v>=75)return"強く出ている";if(v>=55)return"やや出ている";if(v>=35)return"軽度";return"低い"}
function calc(){if(missingAnswers().length)throw new Error("70問すべてに回答してください");const fb={};Object.keys(factorInfo).forEach(k=>fb[k]=[]);derailerQuestions.forEach((q,i)=>{let v=Number(answers[i]);if(q[2]===-1)v=6-v;fb[q[0]].push(v)});const factors={};Object.entries(fb).forEach(([k,a])=>{const av=a.reduce((x,y)=>x+y,0)/a.length;factors[k]={avg:av,index:idx(av)}});const ib={};Object.keys(impactInfo).forEach(k=>ib[k]=[]);impactQuestions.forEach((q,j)=>{let v=Number(answers[55+j]);if(q[2]===-1)v=6-v;ib[q[0]].push(v)});const impacts={};Object.entries(ib).forEach(([k,a])=>{const av=a.reduce((x,y)=>x+y,0)/a.length;impacts[k]={avg:av,index:idx(av)}});const clusters={};Object.keys(clusterInfo).forEach(c=>{const vals=Object.keys(factorInfo).filter(k=>factorInfo[k].cluster===c).map(k=>factors[k].index);clusters[c]=Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)});const multiplier=clamp(impacts.autonomy.index*.25+impacts.safety.index*.30+impacts.coaching.index*.25+impacts.selfcorrect.index*.20);const overallDerailer=Math.round(Object.values(factors).reduce((s,x)=>s+x.index,0)/11);const patterns={impatient:clamp(impacts.standards.index*.35+factors.excitable.index*.20+factors.colorful.index*.10+(100-impacts.coaching.index)*.35),brilliantjerk:clamp(impacts.standards.index*.25+(100-impacts.safety.index)*.25+(100-impacts.coaching.index)*.20+factors.reserved.index*.10+factors.bold.index*.10+factors.skeptical.index*.10),micromanage:clamp(factors.diligent.index*.50+(100-impacts.autonomy.index)*.50),lonehero:clamp((100-impacts.autonomy.index)*.35+(100-impacts.coaching.index)*.25+impacts.standards.index*.20+factors.bold.index*.10+factors.reserved.index*.10)};const vector={away:clusters.away,against:clusters.against,toward:clusters.toward,...Object.fromEntries(Object.entries(impacts).map(([k,v])=>[k,v.index]))};const typeScores=archetypes.map(t=>{const keys=Object.keys(t.proto);let sq=0;keys.forEach(k=>sq+=(vector[k]-t.proto[k])**2);const dist=Math.sqrt(sq/keys.length);return {...t,fit:clamp(100-dist)}}).sort((a,b)=>b.fit-a.fit);return{factors,impacts,clusters,multiplier,overallDerailer,patterns,typeScores}}
function showResults(){const missing=missingAnswers();if(missing.length){document.getElementById("incomplete").textContent=`未回答が ${missing.length} 問あります。最初の未回答へ移動します。`;const cards=missing.map(i=>document.getElementById(`question-card-${i}`));cards.forEach(card=>{card.classList.add("unanswered");card.setAttribute("aria-invalid","true")});const first=ensureQuestionOrder().find(i=>missing.includes(i)),card=document.getElementById(`question-card-${first}`);card.focus({preventScroll:true});card.scrollIntoView({behavior:"smooth",block:"center"});return}const r=calc();document.getElementById("quiz").classList.add("hidden");document.getElementById("results").classList.remove("hidden");renderResults(r);window.scrollTo(0,0);document.getElementById("summaryTitle").focus({preventScroll:true})}
function renderResults(r){const primary=r.typeScores[0],secondary=r.typeScores[1],gap=primary.fit-secondary.fit;document.getElementById("leverageScore").textContent=r.multiplier;document.getElementById("resultIdentity").textContent=profile.name||"70問のセルフチェック";document.getElementById("summaryTitle").textContent=gap<4?`${primary.jp}・${secondary.jp}に近い回答`:`${primary.jp}が最も近い`;const factorMax=Math.max(...Object.values(r.factors).map(x=>x.index));const strongest=Object.entries(r.factors).filter(([,x])=>x.index===factorMax).map(([k])=>factorInfo[k].jp);const supports=Object.entries(r.impacts).filter(([k])=>k!=="standards");const supportMin=Math.min(...supports.map(([,x])=>x.index));const lowest=supports.filter(([,x])=>x.index===supportMin).map(([k])=>impactInfo[k].jp);renderLeadershipProfile(r,profile.mbti);document.getElementById("resultMbtiInput").value=profile.mbti;document.getElementById("types").innerHTML=r.typeScores.slice(0,2).map((t,i)=>`<div class="type-card ${i===0?"primary-type":""}"><div class="kicker">${i===0?"最も近い傾向":"次に近い傾向"}</div><div class="fit">類似度 ${t.fit} / 100</div><h3>${t.jp} <span class="factor-en">${t.name}</span></h3><p>${t.desc}</p>${i===0&&gap<4?'<span class="band">上位2つの類似度の差が小さいため、両方を参考にしてください</span>':""}</div>`).join("");document.getElementById("impactMetrics").innerHTML=Object.entries(impactInfo).map(([k,i])=>`<div class="metric"><span class="band">${band(r.impacts[k].index)}</span><div class="value">${r.impacts[k].index}<small> / 100</small></div><b>${i.jp}</b><p>${i.desc}。</p><p class="note">${impactExamples[k]}</p><p class="note">${r.impacts[k].index>=70?"この行動を取るという回答が多めです。周囲にも同じように伝わっているか確認してみてください。":r.impacts[k].index>=40?"回答は中間付近です。できている場面と難しい場面の違いを振り返ってみてください。":"この行動を取るという回答は少なめです。下の実践アクションで、試せる場面を1つ選んでください。"}</p></div>`).join("");const qx=r.impacts.standards.index,qy=r.multiplier,dot=document.getElementById("quadrantDot");dot.style.left=`${Math.max(4,Math.min(96,qx))}%`;dot.style.bottom=`${Math.max(4,Math.min(96,qy))}%`;dot.title=`要求水準 ${qx} / 支援行動 ${qy}`;const pdefs=[["impatient","High Standards / Low Patience","高基準・低忍耐パターン","要求水準や感情反応、育成に関する回答を組み合わせています。相手の理解を待たずに結論を急いだ場面がないか振り返ってください。"],["brilliantjerk","Brilliant Jerk-like Friction","高基準と対人摩擦の重なり","高い要求水準と、異論の聞き取り・育成の少なさなどを組み合わせた指数です。悪い報告が遅れていないか、会議で反対意見が出ているかを確認してください。"],["micromanage","Micromanagement Drift","マイクロマネジメント化","精密さと任せる行動の少なさを組み合わせています。相手に任せた仕事を、途中で自分の方法に直していないか確認してください。"],["lonehero","Lone Hero Dependency","一人エース依存","要求水準、自己確信、判断を渡す行動、育成などの回答を組み合わせています。自分の不在時にも判断と仕事が進むかを確認してください。"]];document.getElementById("patterns").innerHTML=pdefs.map(([k,en,jp,d])=>`<div class="pattern-card"><div class="fit">${r.patterns[k]} / 100</div><h3>${jp}</h3><span class="band">組み合わせ指数：${band(r.patterns[k])}</span><p>${d}</p></div>`).join("");document.getElementById("clusters").innerHTML=Object.entries(clusterInfo).map(([k,c])=>`<div class="metric"><div class="value">${r.clusters[k]}<small> / 100</small></div><b>${c.title}</b><p>${c.desc}</p></div>`).join("");const ranked=Object.entries(r.factors).sort((a,b)=>b[1].index-a[1].index).slice(0,3);document.getElementById("top3").innerHTML=ranked.map(([k,s],i)=>`<div class="type-card"><div class="kicker">TOP ${i+1}</div><div class="fit">${s.index}</div><h3>${factorInfo[k].jp}</h3><p><b>強みとして出ると：</b>${factorInfo[k].strength}</p><p><b>負荷が高い場面の注意点：</b>${factorInfo[k].watch}</p></div>`).join("");document.getElementById("factors").innerHTML=Object.entries(factorInfo).map(([k,f])=>{const s=r.factors[k].index;return `<div class="factor"><div class="factor-head"><div><span class="factor-name">${f.jp}</span><span class="factor-en">${f.en}</span></div><div class="factor-score">${s} / 100 · ${band(s)}</div></div><div class="bar"><div style="width:${s}%"></div></div><div class="factor-copy"><div class="pill"><b>強みとして出ると</b><br>${f.strength}</div><div class="pill"><b>過剰化すると</b><br>${f.watch}</div></div></div>`}).join("");const actions=[];ranked.forEach(([k])=>actions.push([actionLibrary[k][0],actionLibrary[k][1],strongest.length===11?`11項目が同点のため、「${factorInfo[k].jp}」についての一般的な候補を表示しています。実際に当てはまる場面があるものを選んでください。`:`「${factorInfo[k].jp}」が相対的に目立つため、その強みを保ちながら過剰化を抑える候補です。`]));const weakImpacts=Object.entries(r.impacts).filter(([k])=>k!=="standards").sort((a,b)=>a[1].index-b[1].index).slice(0,2);weakImpacts.forEach(([k])=>actions.push([actionLibrary[k][0],actionLibrary[k][1],`「${impactInfo[k].jp}」の回答から選んだ、支援行動を増やす候補です。低得点を欠点と断定するものではありません。`]));const unique=[],seen=new Set();actions.forEach(a=>{if(a&&!seen.has(a[0])){seen.add(a[0]);unique.push(a)}});document.getElementById("development").innerHTML=unique.slice(0,5).map(a=>`<div class="action-card"><h3>${a[0]}</h3><p class="note">${a[2]}</p><p>${a[1]}</p></div>`).join("");window._latest=r;renderLeadershipBrief(r);renderPractice(r)}
function buildSummary(){
  const r=window._latest||calc(),t=r.typeScores[0],second=r.typeScores[1];
  const typeLabel=t.fit-second.fit<4?`${t.jp}・${second.jp}に近い回答`:`${t.jp}が最も近い`;
  return `リーダーの強みと落とし穴 / Leadership Derailer 70

${leadershipBriefText(buildLeadershipBrief(r))}

${practiceText(practicePlan)}

詳しい結果
${typeLabel}（類似度 ${t.fit}/100）
チームの自走を支える行動指数: ${r.multiplier}/100

${leadershipProfileText(buildLeadershipProfile(r,profile.mbti))}

※非公式・独自セルフスクリーニング。公式HDSではありません。`;
}
async function copySummary(){try{await navigator.clipboard.writeText(buildSummary());toast("結果サマリーをコピーしました")}catch(e){prompt("コピーしてください",buildSummary())}}
function downloadJSON(){const r=window._latest||calc();const payload={version:"Leadership Derailer 70 v2.6",createdAt:new Date().toISOString(),profile,results:r,brief:buildLeadershipBrief(r),practice:practicePlan,leadershipSummary:buildLeadershipProfile(r,profile.mbti),answers,questionOrder:ensureQuestionOrder()};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const a=document.createElement("a"),url=URL.createObjectURL(blob);a.href=url;a.download="leadership-derailer-70-result.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("結果データのダウンロードを開始しました")}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.remove("hidden");setTimeout(()=>t.classList.add("hidden"),1800)}function backToQuiz(){document.getElementById("results").classList.add("hidden");document.getElementById("quiz").classList.remove("hidden");renderQuestions();window.scrollTo(0,0)}function resetQuiz(){if(!confirm("70問の回答をすべてリセットしますか？"))return;answers={};questionOrder=null;safeRemove("derailer70Order");safeRemove("derailer70Answers");safeRemove("derailerAnswers");window._latest=null;document.getElementById("incomplete").textContent="";updateSavedNotice();document.getElementById("results").classList.add("hidden");document.getElementById("quiz").classList.add("hidden");document.getElementById("intro").classList.remove("hidden");window.scrollTo(0,0)}function updateMBTI(value){
  profile.mbti=mbtiValues.includes(value)?value:"";
  safeSet("derailer70MBTI",profile.mbti);
  document.getElementById("mbtiInput").value=profile.mbti;
  document.getElementById("resultMbtiInput").value=profile.mbti;
  if(window._latest)renderResults(window._latest);
}
function bindUI(){
  const on=(id,event,fn)=>{const el=document.getElementById(id);if(el)el.addEventListener(event,fn)};
  on("startBtn","click",startQuiz);
  on("resumeResultBtn","click",()=>{startQuiz();showResults()});
  bindPractice();
  on("resultMbtiInput","change",e=>updateMBTI(e.target.value));
  on("showResultsBtn","click",showResults);
  on("quizResetBtn","click",resetQuiz);
  on("copySummaryBtn","click",copySummary);
  on("downloadJsonBtn","click",downloadJSON);
  on("printBtn","click",()=>window.print());
  on("backBtn","click",backToQuiz);
  on("resultResetBtn","click",resetQuiz);
  const qroot=document.getElementById("questions");
  if(qroot){qroot.addEventListener("change",e=>{const el=e.target;if(el&&el.matches('input[type="radio"][name^="q"]')){const i=Number(el.name.slice(1));saveAnswer(i,Number(el.value));}})}
}
try{document.getElementById("nameInput").value=profile.name;document.getElementById("mbtiInput").value=profile.mbti;}catch(e){}
bindUI();
updateSavedNotice();
if(location.hash==="#autostart"){setTimeout(startQuiz,0)}