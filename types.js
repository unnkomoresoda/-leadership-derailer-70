function catalogNode(tag,text,className){
 const element=document.createElement(tag);
 if(text)element.textContent=text;
 if(className)element.className=className;
 return element;
}
function catalogLeaderImage(type,detail=false){
 const team=getLeadershipTeam(type),image=document.createElement('img');
 image.src=`./leader-${type.id}.webp?v=2.13.0`;
 image.alt=`${team.jp}の${type.jp}を表すキャラクター：${type.theme}`;
 image.width=900;image.height=900;image.loading='lazy';image.decoding='async';
 image.className=detail?'leader-detail-image':'leader-card-image';
 return image;
}
function catalogTeamBadge(type,link=false){
 const team=getLeadershipTeam(type),badge=catalogNode(link?'a':'span',`${team.jp} · ${team.en}`,'team-badge');
 badge.setAttribute('data-team',team.id);
 if(link)badge.href=`#team-${team.id}`;
 return badge;
}
function renderCatalog(){
 const cards=document.getElementById('catalogCards'),details=document.getElementById('catalogDetails');
 const filters=document.getElementById('baseFilters'),teamFilters=document.getElementById('teamFilters');
 const cardNodes=new Map(),teamSections=new Map();
 LEADERSHIP_TEAMS.forEach(team=>{
  const button=catalogNode('button',null,'team-filter');
  button.type='button';button.dataset.team=team.id;button.setAttribute('aria-pressed','false');
  button.setAttribute('aria-label',`${team.jp}で絞り込む`);
  button.appendChild(catalogNode('span',team.jp,'team-filter-name'));
  button.appendChild(catalogNode('span',`${team.en} · 7 TYPES`,'team-filter-english'));
  button.appendChild(catalogNode('span',team.theme,'team-filter-description'));
  teamFilters.appendChild(button);
  const section=catalogNode('section',null,'catalog-team-section');section.dataset.team=team.id;
  const title=catalogNode('h2',team.jp,'team-section-title');title.id=`group-${team.id}`;
  section.setAttribute('aria-labelledby',title.id);section.appendChild(title);
  section.appendChild(catalogNode('p',`${team.en} · ${team.theme}`,'team-section-description'));
  const grid=catalogNode('div',null,'catalog-grid catalog-team-grid');
  section.appendChild(grid);cards.appendChild(section);
  teamSections.set(team.id,{section,grid});
 });
 LEADERSHIP_BASES.forEach(base=>{
  const button=catalogNode('button',base.jp,'filter-chip');
  button.type='button';button.dataset.base=String(base.index);button.setAttribute('aria-pressed','false');filters.appendChild(button);
 });
 const labels=[['essence','このタイプの本質'],['success','なぜ成果を出せるのか'],['decision','意思決定の特徴'],['mobilize','人の動かし方'],['normal','平常時の特徴'],['pressure','プレッシャーが高まったとき'],['process','強みが過剰化するプロセス'],['derailer','最も気をつけたい落とし穴'],['environment','力を発揮しやすい環境'],['difficult','苦戦しやすい環境'],['growth','成長するとどう変わるか'],['withBoss','このタイプが上司だった場合'],['withReport','このタイプの部下を持った場合'],['cooperate','噛み合いやすい組み方'],['friction','衝突が起きやすいポイント'],['reason','衝突が起きる理由'],['partner','うまく組む方法']];
 LEADERSHIP_TYPES.forEach(type=>{
  const team=getLeadershipTeam(type),card=catalogNode('a',null,'catalog-card');
  card.href=`#${type.id}`;card.dataset.type=type.id;card.dataset.team=team.id;
  card.appendChild(catalogLeaderImage(type));card.appendChild(catalogTeamBadge(type));
  card.appendChild(catalogNode('h3',type.jp));card.appendChild(catalogNode('div',type.en,'catalog-en'));
  card.appendChild(catalogNode('p',type.bases.map(x=>x.jp).join(' × '),'note'));
  card.appendChild(catalogNode('p',type.theme));card.appendChild(catalogNode('span','詳しく読む →','catalog-go'));
  teamSections.get(team.id).grid.appendChild(card);cardNodes.set(type.id,card);
  const article=catalogNode('article',null,'catalog-article hidden');article.id=type.id;article.dataset.team=team.id;
  const header=catalogNode('header',null,'type-detail-hero');
  header.appendChild(catalogNode('div','組み合わせリーダータイプ','eyebrow'));header.appendChild(catalogTeamBadge(type,true));
  header.appendChild(catalogNode('h1',type.jp));header.appendChild(catalogNode('div',type.en,'type-english'));
  header.appendChild(catalogNode('p',type.bases.map(x=>x.jp).join(' × '),'type-bases'));
  header.appendChild(catalogNode('p',type.theme,'type-catch'));header.appendChild(catalogLeaderImage(type,true));
  header.appendChild(catalogNode('p','イラストは上司像のイメージです。年齢・性別・外見でタイプが決まるものではありません。','note leader-image-note'));
  article.appendChild(header);
  article.appendChild(catalogNode('p','このページは基本的なリーダー像の解説です。あなた自身の得点を説明するものではありません。同じタイプでも、支援行動や負荷時の反応は70問の個別結果によって変わります。以下の強み・落とし穴は、実際の場面で確かめる仮説です。','note lens-note'));
  const toc=catalogNode('details',null,'disclosure type-toc');toc.appendChild(catalogNode('summary','このタイプの目次'));
  const nav=catalogNode('nav',null,'disclosure-body');nav.setAttribute('aria-label',`${type.jp}の目次`);
  labels.forEach(([key,label])=>{const link=catalogNode('a',label);link.href=`#${type.id}--${key}`;nav.appendChild(link)});
  const around=catalogNode('a','周囲からどう見えるか');around.href=`#${type.id}--around`;nav.appendChild(around);
  toc.appendChild(nav);article.appendChild(toc);
  labels.forEach(([key,label],n)=>{
   const section=catalogNode('section',null,'catalog-section');section.id=`${type.id}--${key}`;
   section.appendChild(catalogNode('h2',label));section.appendChild(catalogNode('p',type[key]));article.appendChild(section);
   if(n===3){
    const people=catalogNode('section',null,'catalog-section');people.id=`${type.id}--around`;
    people.appendChild(catalogNode('h2','周囲からどう見えるか'));
    [['部下から','reports'],['同僚から','peers'],['上司から','bosses']].forEach(([label,key])=>{
     people.appendChild(catalogNode('h3',label));people.appendChild(catalogNode('p',type[key]));
    });
    article.appendChild(people);
   }
  });
  const related=catalogNode('nav',null,'related-types no-print');related.setAttribute('aria-label','関連するタイプ');
  related.appendChild(catalogNode('h2','説明に登場するタイプ'));
  LEADERSHIP_TYPES.filter(t=>t.id!==type.id&&[type.cooperate,type.friction].some(text=>text.includes(t.jp))).forEach(t=>{
   const link=catalogNode('a',`${t.jp} →`,'button-link secondary');link.href=`#${t.id}`;related.appendChild(link);
  });
  article.appendChild(related);details.appendChild(article);
 });
 let selectedBase=null,selectedTeam=null;
 const input=document.getElementById('typeSearch'),count=document.getElementById('catalogCount'),empty=document.getElementById('catalogEmpty');
 const normalize=text=>text.normalize('NFKC').toLocaleLowerCase('ja-JP');
 function filter(){
  const tokens=normalize(input.value).trim().split(/\s+/).filter(Boolean),totals=new Map(LEADERSHIP_TEAMS.map(t=>[t.id,0]));
  let visibleCount=0;
  LEADERSHIP_TYPES.forEach(type=>{
   const team=getLeadershipTeam(type),text=normalize([type.jp,type.en,type.theme,team.jp,team.en,team.colorName,...type.bases.map(x=>x.jp)].join(' '));
   const visible=(selectedBase===null||type.a===selectedBase||type.b===selectedBase)&&(selectedTeam===null||team.id===selectedTeam)&&tokens.every(token=>text.includes(token));
   cardNodes.get(type.id).classList.toggle('hidden',!visible);
   if(visible){visibleCount++;totals.set(team.id,totals.get(team.id)+1)}
  });
  teamSections.forEach(({section},id)=>section.classList.toggle('hidden',totals.get(id)===0));
  teamFilters.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.team===selectedTeam)));
  count.textContent=`${visibleCount} / 28タイプ`;empty.classList.toggle('hidden',visibleCount!==0);
 }
 input.addEventListener('input',filter);
 filters.addEventListener('click',event=>{
  const button=event.target.closest('button[data-base]');if(!button)return;
  const value=Number(button.dataset.base);selectedBase=selectedBase===value?null:value;
  filters.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(Number(item.dataset.base)===selectedBase)));filter();
 });
 teamFilters.addEventListener('click',event=>{
  const button=event.target.closest('button[data-team]');if(!button)return;
  selectedTeam=selectedTeam===button.dataset.team?null:button.dataset.team;
  const hash=selectedTeam?`#team-${selectedTeam}`:'#catalog';
  if(location.hash===hash)filter();else location.hash=hash;
 });
 document.getElementById('clearFilters').addEventListener('click',()=>{
  selectedBase=null;selectedTeam=null;input.value='';
  filters.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed','false'));
  if(location.hash.startsWith('#team-'))location.hash='#catalog';
  filter();input.focus();
 });
 function route(){
  let fragment;try{fragment=decodeURIComponent(location.hash.slice(1))}catch{fragment='invalid'}
  const id=fragment.split('--')[0],type=LEADERSHIP_TYPES.find(item=>item.id===id),detail=Boolean(type);
  const group=LEADERSHIP_TEAMS.find(team=>fragment===`team-${team.id}`);
  if(group)selectedTeam=group.id;
  else if(!detail&&(!fragment||fragment==='catalog'))selectedTeam=null;
  document.getElementById('catalogOverview').classList.toggle('hidden',detail);
  document.getElementById('catalogDetailNav').classList.toggle('hidden',!detail);
  document.getElementById('catalogInvalid').classList.toggle('hidden',!fragment||fragment==='catalog'||detail||Boolean(group));
  [...details.children].forEach(article=>article.classList.toggle('hidden',article.id!==type?.id));
  document.title=type?`${type.jp} | LEADERSHIP LENS`:group?`${group.jp} | 28タイプ図鑑 | LEADERSHIP LENS`:'28タイプ リーダーシップ図鑑 | LEADERSHIP LENS';
  filter();
  if(detail){
   const target=document.getElementById(fragment)||document.getElementById(type.id);
   target.scrollIntoView({behavior:'auto',block:'start'});
   const heading=target.querySelector('h1,h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}
  }else window.scrollTo(0,0);
 }
 window.addEventListener('hashchange',route);route();
}
renderCatalog();
