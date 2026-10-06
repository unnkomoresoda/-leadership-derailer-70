const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'type-catalog.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'type-results.js'),'utf8'),context);
const types=vm.runInContext('LEADERSHIP_TYPES',context);
const base='https://unnkomoresoda.github.io/-leadership-derailer-70/';
function meta(html,key){
 const escaped=key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 return html.match(new RegExp(`<meta (?:property|name)="${escaped}" content="([^"]*)"`))?.[1];
}
test('all 28 shared URLs contain crawlable, type-specific image metadata',()=>{
 const images=new Set();
 for(const type of types){
  const html=fs.readFileSync(path.join(__dirname,'share',`${type.id}.html`),'utf8');
  const page=`${base}share/${type.id}.html`,image=`${base}share/${type.id}-card.png`;
  assert.equal(meta(html,'og:url'),page);
  assert.ok(html.includes(`<link rel="canonical" href="${page}"`));
  assert.equal(meta(html,'twitter:card'),'summary_large_image');
  assert.equal(meta(html,'twitter:image'),image);
  assert.equal(meta(html,'og:image'),image);
  assert.ok(meta(html,'twitter:title').includes(type.jp));
  assert.ok(meta(html,'og:description').includes(type.theme));
  assert.ok(html.includes(`href="../types.html#${type.id}"`));
  assert.ok(html.includes('href="../index.html"'));
  assert.ok(!html.includes('http-equiv="refresh"'));
  images.add(image);
 }
 assert.equal(types.length,28);assert.equal(images.size,28);
});
test('all preview PNGs are 1200x630, publicly linked and under the image size limit',()=>{
 for(const type of types){
  const image=fs.readFileSync(path.join(__dirname,'share',`${type.id}-card.png`));
  assert.equal(image.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(image.readUInt32BE(16),1200);assert.equal(image.readUInt32BE(20),630);
  assert.ok(image.length<5*1024*1024);
 }
});
test('X share chooses 28 distinct pages and excludes individual data',()=>{
 const links=new Set();
 for(const type of types){
  const share=new URL(vm.runInContext(`buildXShareURL(${JSON.stringify({...type,displayName:'非公開の名前',scores:{skeptical:95}})})`,context));
  const page=share.searchParams.get('url');
  assert.equal(page,`${base}share/${type.id}.html`);
  assert.ok(share.searchParams.get('text').includes(type.jp));
  assert.ok(!decodeURIComponent(share.href).includes('非公開の名前'));
  assert.ok(!share.href.includes('skeptical'));
  assert.equal(new URL(page).search,'');assert.equal(new URL(page).hash,'');
  links.add(page);
 }
 assert.equal(links.size,28);
 assert.equal(vm.runInContext('buildTypeSharePageURL({id:"../../unexpected"})',context),base);
});
