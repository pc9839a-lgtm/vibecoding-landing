import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{
 const uri=decodeURIComponent((req.url||'/').split('?')[0]);
 const safe=path.normalize(uri).replace(/^(\.\.(\/|\\|$))+/,'').replace(/^[/\\]+/,'');
 const target=path.resolve(root,safe||'index.html');
 if(!target.startsWith(root+path.sep)&&target!==path.join(root,'index.html')){res.writeHead(403);return res.end('Forbidden')}
 fs.readFile(target,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream'});res.end(data)});
});
await new Promise(ok=>server.listen(4178,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
fs.mkdirSync(path.join(root,'review'),{recursive:true});
let failed=false;
const results=[];
try{
 for(const width of [360,390,1440]){
  const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.goto('http://127.0.0.1:4178/',{waitUntil:'load',timeout:30000});
  await page.evaluate(async()=>{
    await document.fonts.ready;
    await Promise.all([...document.images].map(img=>(img.decode?.().catch(()=>{})||Promise.resolve())));
  });
  const initial=await page.evaluate(()=>{
    const images=[...document.images];
    const links=[...document.querySelectorAll('a[href^="#"]')].map(a=>({label:a.textContent.trim(),href:a.getAttribute('href')}));
    const existing=new Set([...document.querySelectorAll('[id]')].map(e=>e.id));
    const price=document.querySelector('.price-box__new')?.getBoundingClientRect();
    return {
      viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,
      images:images.map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),
      brokenAnchors:links.filter(a=>!existing.has(a.href.slice(1))),
      price:{left:price?.left,right:price?.right},
      horizontalElements:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return cs.position!=='absolute'&&cs.position!=='fixed'&&(r.left < -2||r.right>innerWidth+2)&&r.width>0}).slice(0,7).map(e=>({name:e.tagName,className:typeof e.className==='string'?e.className:'',width:e.getBoundingClientRect().width,left:e.getBoundingClientRect().left})),
      sections:document.querySelectorAll('main > section').length,faq:document.querySelectorAll('details').length
    };
  });
  const anchors=['#pricing','#work','#curriculum','#apply','#results'];
  const clicks=[];
  for(const anchor of anchors){
    if(await page.locator('a[href="'+anchor+'"]').count()){
      await page.locator('a[href="'+anchor+'"]').first().click({timeout:15000});
      clicks.push({anchor,hash:new URL(page.url()).hash,ok:new URL(page.url()).hash===anchor});
    }
  }
  await page.evaluate(()=>scrollTo(0,0));
  await page.waitForTimeout(180);
  const file=path.join(root,'review',width===1440?'desktop-1440.jpg':'mobile-'+width+'.jpg');
  await page.screenshot({path:file,fullPage:true,type:'jpeg',quality:83,animations:'disabled'});
  const passed=initial.scrollWidth<=width+1&&initial.images.every(i=>i.loaded)&&initial.brokenAnchors.length===0&&clicks.every(c=>c.ok)&&initial.price.right<=width+1&&initial.price.left>=-1&&errors.length===0;
  results.push({width,passed,...initial,clicks,errors,screenshot:path.relative(root,file)});
  if(!passed)failed=true;
  await page.close();
 }
}finally{await browser.close();server.close()}
fs.writeFileSync(path.join(root,'review','qa-report.json'),JSON.stringify({timestamp:new Date().toISOString(),passed:!failed,results},null,2));
console.log(JSON.stringify({passed:!failed,results:results.map(r=>({width:r.width,passed:r.passed,scrollWidth:r.scrollWidth,height:r.documentHeight,imagesOK:r.images.every(i=>i.loaded),brokenAnchors:r.brokenAnchors,clicks:r.clicks,errors:r.errors,horizontalElements:r.horizontalElements,screenshot:r.screenshot}))},null,2));
if(failed)process.exitCode=1;