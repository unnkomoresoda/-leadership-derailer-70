// Static HTML is deliberate: social crawlers must read tags without executing JS.
// Re-run after changing the type catalogue: node generate-share-pages.cjs
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'type-catalog.js'),'utf8'),context);
const types=vm.runInContext('LEADERSHIP_TYPES.map(t=>({...t,team:getLeadershipTeam(t)}))',context);
const base='https://unnkomoresoda.github.io/-leadership-derailer-70/';
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const output=path.join(__dirname,'share');
fs.mkdirSync(output,{recursive:true});
for(const type of types){
 const url=`${base}share/${type.id}.html`;
 const image=`${base}share/${type.id}-card.png`;
 const title=`${type.jp} | LEADERSHIP LENS`;
 const bases=type.bases.map(b=>b.jp).join(' × ');
 const description=`${type.theme} ${bases}からなるリーダー像。70問であなたの持ち味と落とし穴を振り返る、LEADERSHIP LENS。`;
 const alt=`${type.team.jp}の${type.jp}を表すキャラクター`;
 const shareMessage=`LEADERSHIP LENS｜${type.jp}。${type.theme}`;
 const intent=`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(url)}`;
 const html=`<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark" />
<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="ja_JP" />
<meta property="og:site_name" content="LEADERSHIP LENS" />
<meta property="og:title" content="${escape(title)}" />
<meta property="og:description" content="${escape(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${escape(alt)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escape(title)}" />
<meta name="twitter:description" content="${escape(description)}" />
<meta name="twitter:image" content="${image}" />
<meta name="twitter:image:alt" content="${escape(alt)}" />
<meta name="google-adsense-account" content="ca-pub-2304093190825895" />
<script async src="https://www.googletagmanager.com/gtag/js?id=G-DE5351HHGP"></script>
<script>
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','G-DE5351HHGP');
</script>
<link rel="stylesheet" href="../styles.css?v=2.14.1" />
<link rel="icon" href="../favicon.svg" type="image/svg+xml" />
</head>
<body class="type-share-page">
<nav class="catalog-topbar" aria-label="サイトナビゲーション"><div class="wrap"><a href="../index.html">LEADERSHIP LENS</a><a href="../types.html">28タイプ図鑑 →</a></div></nav>
<main class="wrap">
<article class="combination-hero share-type-hero" data-team="${type.team.id}">
 <div class="share-type-copy">
  <div class="eyebrow">シェアされたリーダータイプ</div>
  <a class="team-badge" data-team="${type.team.id}" href="../types.html#team-${type.team.id}">${escape(type.team.jp)} · ${type.team.en}</a>
  <h1>${escape(type.jp)}</h1>
  <div class="type-english">${escape(type.en)}</div>
  <p class="type-bases">${escape(bases)}</p>
  <p class="type-catch">${escape(type.theme)}</p>
  <p class="share-type-intro">${escape(type.essence)}</p>
  <div class="actions"><a class="button-link primary" href="../index.html">自分も70問で診断する →</a><a class="button-link secondary" href="../types.html#${type.id}">このタイプを詳しく読む →</a></div>
 </div>
 <img class="leader-share-image" src="../leader-${type.id}.webp?v=2.13.0" width="900" height="900" alt="${escape(alt)}" />
</article>
<section class="card share-page-footer">
 <h2>タイプの骨格と、あなた固有の現れ方</h2>
 <p>このページはリーダー像の紹介です。同じタイプでも、仕事の進め方・任せ方・負荷がかかったときの反応は人によって変わります。70問の診断では、実際の回答をもとに個別の分析とアドバイスを表示します。</p>
 <a class="text-link" href="${escape(intent)}" target="_blank" rel="noopener noreferrer">このタイプをXで紹介する →</a>
</section>
</main>
<footer class="wrap"><p>LEADERSHIP LENS / リーダーシップ・レンズ</p><p>HDSの概念を参考にした独自セルフチェックです。公式Hogan HDSの設問・ノルム・パーセンタイル・リスク区分を再現したものではなく、採用・昇進・医療等の高影響判断には使用できません。</p></footer>
</body>
</html>
`;
 fs.writeFileSync(path.join(output,`${type.id}.html`),html);
}
console.log(`Generated ${types.length} static type-share pages.`);
